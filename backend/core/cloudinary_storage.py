# core/cloudinary_storage.py
#
# Minimal Cloudinary storage backend for Django.
# Uses the Cloudinary SDK directly — same approach as the test script that
# confirmed uploads work. Bypasses django-cloudinary-storage entirely.

import io
import os
import uuid

import cloudinary
import cloudinary.uploader
import cloudinary.api

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class CloudinaryMediaStorage(Storage):
    """
    Stores files on Cloudinary. Falls back gracefully if Cloudinary is
    not configured (though in practice Django will use a different
    DEFAULT_FILE_STORAGE when Cloudinary is not configured).

    File names become Cloudinary public_ids (without extension).
    URLs are Cloudinary secure_url values stored in the database.
    """

    def _get_public_id(self, name):
        """
        Convert a Django file name like 'products/images/photo.webp'
        to a Cloudinary public_id 'products/images/photo'
        (Cloudinary stores the extension separately).
        """
        root, _ = os.path.splitext(name)
        return root

    def _open(self, name, mode='rb'):
        """Download a file from Cloudinary."""
        import urllib.request
        url = self.url(name)
        with urllib.request.urlopen(url) as response:
            return ContentFile(response.read(), name=name)

    def _save(self, name, content):
        """
        Upload a file to Cloudinary.
        Returns the name as stored (used to build the URL later).
        """
        if hasattr(content, 'seek'):
            content.seek(0)

        data = content.read()
        public_id = self._get_public_id(name)

        # Detect resource type — Cloudinary needs 'raw' for PDFs and non-images
        _, ext = os.path.splitext(name)
        ext = ext.lower()

        if ext in ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'):
            resource_type = 'image'
        else:
            resource_type = 'raw'

        result = cloudinary.uploader.upload(
            data,
            public_id=public_id,
            resource_type=resource_type,
            overwrite=True,
            invalidate=True,
        )

        # Store the secure_url directly as the file name so .url() works correctly
        # We store the full URL because Cloudinary's URL includes version numbers
        # and transformations that we don't want to reconstruct manually.
        return result['secure_url']

    def delete(self, name):
        """Delete a file from Cloudinary."""
        try:
            # If name is a full URL, extract the public_id from it
            if name.startswith('http'):
                # URL format: .../upload/v123456/path/to/file.ext
                # public_id is everything after /upload/v{version}/ minus extension
                parts = name.split('/upload/')
                if len(parts) == 2:
                    path_with_version = parts[1]
                    # Remove version prefix (v1234567/)
                    path = '/'.join(path_with_version.split('/')[1:])
                    public_id, _ = os.path.splitext(path)
                    cloudinary.uploader.destroy(public_id)
            else:
                public_id = self._get_public_id(name)
                cloudinary.uploader.destroy(public_id)
        except Exception:
            pass  # Don't raise on delete failure

    def exists(self, name):
        """Check if a resource exists on Cloudinary."""
        try:
            if name.startswith('http'):
                return True  # If we have a URL, assume it exists
            public_id = self._get_public_id(name)
            cloudinary.api.resource(public_id)
            return True
        except Exception:
            return False

    def url(self, name):
        """
        Return the URL for a file.
        Since _save() stores the full Cloudinary URL as the name,
        this just returns the name directly.
        """
        if name and name.startswith('http'):
            return name
        # Fallback: construct URL manually (shouldn't normally be needed)
        public_id = self._get_public_id(name)
        return cloudinary.CloudinaryImage(public_id).build_url(secure=True)

    def size(self, name):
        """Return file size."""
        try:
            if name.startswith('http'):
                parts = name.split('/upload/')
                if len(parts) == 2:
                    path = '/'.join(parts[1].split('/')[1:])
                    public_id, _ = os.path.splitext(path)
                    result = cloudinary.api.resource(public_id)
                    return result.get('bytes', 0)
        except Exception:
            pass
        return 0

    def get_available_name(self, name, max_length=None):
        """
        Cloudinary handles name conflicts with overwrite=True,
        but we still add uniqueness to avoid unintended overwrites
        of different files that happen to share a name.
        """
        root, ext = os.path.splitext(name)
        unique = f"{root}_{uuid.uuid4().hex[:8]}{ext}"
        return unique
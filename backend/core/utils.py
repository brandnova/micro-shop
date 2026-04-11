import io
import uuid
from PIL import Image as PilImage
from django.core.files.base import ContentFile


def convert_to_webp(image_field, max_size=(1200, 1200), quality=82):
    """
    Convert any uploaded image to WebP, resize if larger than max_size,
    and return a ContentFile ready to be saved.

    Called from model save() methods before the file hits storage.
    """
    img = PilImage.open(image_field)

    # Convert palette/transparency modes that WebP handles differently
    if img.mode in ('RGBA', 'LA'):
        img = img.convert('RGBA')
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    img.thumbnail(max_size, PilImage.LANCZOS)

    output = io.BytesIO()
    img.save(output, format='WEBP', quality=quality, method=6)
    output.seek(0)

    return output


def webp_filename(original_name):
    """Replace original extension with .webp"""
    stem = original_name.rsplit('.', 1)[0] if '.' in original_name else original_name
    return f"{stem}.webp"
#!/usr/bin/env python
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from cloudinary import uploader
import base64

def test_direct_cloudinary_upload():
    print("Testing direct Cloudinary upload (bypassing Django)...")
    
    # Create a valid PNG
    png_data = base64.b64decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    )
    
    try:
        # Direct upload to Cloudinary
        result = uploader.upload(
            png_data,
            public_id="direct_test_image",
            folder="products/images",
            overwrite=True
        )
        
        print(f"✅ Direct upload successful!")
        print(f"Public ID: {result['public_id']}")
        print(f"URL: {result['secure_url']}")
        
        # Clean up
        uploader.destroy(result['public_id'])
        print("✅ Cleaned up")
        
        return True
    except Exception as e:
        print(f"❌ Direct upload failed: {e}")
        return False

if __name__ == "__main__":
    test_direct_cloudinary_upload()
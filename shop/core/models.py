# core/models.py

from django.db import models
from django.utils import timezone
import uuid
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError

def validate_image_size(file):
    """Validate image file size (max 5MB)"""
    max_size = 5 * 1024 * 1024  # 5MB
    if file.size > max_size:
        raise ValidationError(f'Image size cannot exceed 5MB. Current size: {file.size/(1024*1024):.2f}MB')

class Product(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(
        upload_to='products/images/',
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png']),
            validate_image_size
        ]
    )
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', '-created_at']
    
    def save(self, *args, **kwargs):
        # Ensure only one primary image per product
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        # If this is the first image, make it primary
        elif not ProductImage.objects.filter(product=self.product).exists():
            self.is_primary = True
        super().save(*args, **kwargs)

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('payment_uploaded', 'Payment Uploaded'),
        ('payment_confirmed', 'Payment Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    tracking_number = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    location = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    products = models.TextField()  
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    payment_proof = models.FileField(
        upload_to='payment_proofs/',
        null=True,
        blank=True,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'pdf'])]
    )

    def __str__(self):
        return f"{self.name} - {self.tracking_number}"

class BankDetails(models.Model):
    bank_name = models.CharField(max_length=255)
    account_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=255)

    def __str__(self):
        return self.account_name

class AdminToken(models.Model):
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return (timezone.now() - self.created_at).days < 7

class SiteSettings(models.Model):
    site_title = models.CharField(max_length=200, default="My E-commerce Site")
    store_tag = models.CharField(max_length=255, default="Elevating your style with grace and sophistication.")
    contact_email = models.EmailField(max_length=255, default="support@example.com")
    contact_number = models.CharField(max_length=255, default="1234567890")
    main_color = models.CharField(max_length=7, default="#FF69B4")

    def __str__(self):
        return "Site Settings"

    class Meta:
        verbose_name_plural = "Site Settings"
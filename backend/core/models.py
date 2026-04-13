import uuid
import secrets
import string
import random
import hashlib

from django.db import models
from django.utils import timezone
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile

from .utils import convert_to_webp, webp_filename


# ─── Validators & Generators ──────────────────────────────────────────────────────────────

def validate_image_size(file):
    """Max 5MB per product image."""
    max_size = 5 * 1024 * 1024
    if file.size > max_size:
        raise ValidationError(
            f'Image size cannot exceed 5MB. Current size: {file.size / (1024 * 1024):.2f}MB'
        )

def validate_payment_proof_size(file):
    """Max 10MB for payment proof uploads."""
    max_size = 10 * 1024 * 1024
    if file.size > max_size:
        raise ValidationError(
            f'File size cannot exceed 10MB. Current size: {file.size / (1024 * 1024):.2f}MB'
        )

def generate_product_code():
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=8))

# ─── Tracking Code ───────────────────────────────────────────────────────────

def generate_tracking_code():
    prefix = "MS"
    year = timezone.now().year
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"{prefix}-{year}-{random_part}"


# ─── Admin Token Generation ─────────────────────────────────────────────────

def generate_token():
    """Generate a short, readable token like QWG13OH9cqUF7Ar"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(16))


# ─── Product ─────────────────────────────────────────────────────────────────

class Product(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=8, unique=True, editable=False, db_index=True)
    category = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)

    def save(self, *args, **kwargs):
        if not self.code:
            for _ in range(10):
                candidate = generate_product_code()
                if not Product.objects.filter(code=candidate).exists():
                    self.code = candidate
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code})"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(
        upload_to='products/images/',
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp']),
            validate_image_size,
        ]
    )
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', '-created_at']

    def save(self, *args, **kwargs):
        # Convert to WebP before saving to storage
        if self.image and hasattr(self.image, 'file'):
            try:
                webp_io = convert_to_webp(self.image)
                new_name = webp_filename(self.image.name)
                self.image.save(new_name, ContentFile(webp_io.read()), save=False)
            except Exception:
                pass  # If conversion fails, save original — never block the upload

        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        elif not ProductImage.objects.filter(product=self.product).exists():
            self.is_primary = True
        super().save(*args, **kwargs)


# ─── Transaction ─────────────────────────────────────────────────────────────

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

    tracking_code = models.CharField(max_length=20, unique=True, editable=False)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    location = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='pending')
    note = models.CharField(max_length=500, blank=True, default='', help_text='Optional note from the customer at checkout')
    created_at = models.DateTimeField(auto_now_add=True)
    payment_proof = models.FileField(
        upload_to='payment_proofs/',
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'pdf']),
            validate_payment_proof_size,
        ]
    )

    def save(self, *args, **kwargs):
        # Tracking code generation (existing logic)
        if not self.tracking_code:
            for _ in range(5):
                code = generate_tracking_code()
                if not Transaction.objects.filter(tracking_code=code).exists():
                    self.tracking_code = code
                    break

        # Convert payment proof to WebP if it's a new image upload
        if self.payment_proof and hasattr(self.payment_proof, 'file'):
            try:
                # Payment proofs don't need to be large — 800px max
                webp_io = convert_to_webp(self.payment_proof, max_size=(800, 800), quality=80)
                new_name = webp_filename(self.payment_proof.name)
                self.payment_proof.save(new_name, ContentFile(webp_io.read()), save=False)
            except Exception:
                pass

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.tracking_code}"


class TransactionItem(models.Model):
    """Replaces the old products = TextField(). Each line item in an order."""
    transaction = models.ForeignKey(Transaction, related_name='items', on_delete=models.CASCADE)
    product_name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity}x {self.product_name} (#{self.transaction.tracking_code})"

    @property
    def subtotal(self):
        try:
            price = self.price if self.price is not None else 0
            quantity = self.quantity if self.quantity is not None else 0
            return price * quantity
        except (TypeError, Exception):
            return 0


class TransactionStatusHistory(models.Model):
    """Audit trail — every status change gets logged here."""
    transaction = models.ForeignKey(Transaction, related_name='status_history', on_delete=models.CASCADE)
    status = models.CharField(max_length=100)
    note = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction.tracking_code} → {self.status} at {self.created_at}"


# ─── Bank Details ─────────────────────────────────────────────────────────────

class BankDetails(models.Model):
    bank_name = models.CharField(max_length=255)
    account_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=255)

    def __str__(self):
        return self.account_name


# ─── Admin Token ──────────────────────────────────────────────────────────────

class AdminToken(models.Model):
    label = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optional label to identify this token (e.g. 'office-laptop')."
    )
    token = models.CharField(
        max_length=100,
        unique=True,
        help_text=(
            "Your login token. Auto-generated if left blank. "
            "You can set a custom one — minimum 10 characters, "
            "must include at least one uppercase letter, one lowercase letter, and one digit. "
            "Example of a strong custom token: MyShop2024x"
        ),
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def is_valid(self):
        return self.is_active and timezone.now() < self.expires_at

    @staticmethod
    def hash_token(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode()).hexdigest()

    def __str__(self):
        label = self.label or "unnamed"
        status = "active" if self.is_valid() else "expired/inactive"
        return f"Token [{label}] — {status}"


# ─── Site Settings ────────────────────────────────────────────────────────────

class SiteSettings(models.Model):
    site_title = models.CharField(max_length=200, default="MicroShop")
    store_tag = models.CharField(max_length=255, default="Quality products, delivered.")
    contact_email = models.EmailField(max_length=255, default="support@example.com")
    contact_number = models.CharField(max_length=255, default="")
    delivery_methods = models.CharField(max_length=255, blank=True, default='', help_text='Comma-separated list, e.g. "Pickup, Home Delivery"')
    delivery_time = models.CharField(max_length=100, blank=True, default='', help_text='e.g. "2–5 business days"')
    delivery_note = models.CharField(max_length=300, blank=True, default='', help_text='Optional short note shown to customers during checkout')
    main_color = models.CharField(max_length=7, default="#432B02")

    def __str__(self):
        return "Site Settings"

    class Meta:
        verbose_name_plural = "Site Settings"
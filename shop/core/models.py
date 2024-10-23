# core/models.py

from django.db import models
from django.utils import timezone
import uuid
from django.core.validators import FileExtensionValidator

class Product(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/')
    quantity = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

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
    contact_email = models.EmailField(max_length=255, default="support@example.com")
    contact_number = models.CharField(max_length=255, default="1234567890")
    main_color = models.CharField(max_length=7, default="#FF69B4")  

    def __str__(self):
        return "Site Settings"

    class Meta:
        verbose_name_plural = "Site Settings"
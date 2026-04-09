import re
from datetime import timedelta

from django import forms
from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html

from .models import (
    Product, ProductImage, Transaction, TransactionItem,
    TransactionStatusHistory, BankDetails, AdminToken, SiteSettings,
    generate_token,
)


class AdminTokenForm(forms.ModelForm):
    class Meta:
        model = AdminToken
        fields = ['label', 'token', 'expires_at', 'is_active']
        widgets = {
            'token': forms.TextInput(attrs={
                'style': 'font-family: monospace; font-size: 1.1em; letter-spacing: 0.05em;',
                'placeholder': 'Leave blank to auto-generate',
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Token is not required — blank = auto-generate
        self.fields['token'].required = False

    def clean_token(self):
        token = self.cleaned_data.get('token') or ''
        token = token.strip()

        # Blank is fine — auto-generated in save_model
        if not token:
            return token

        if len(token) < 10:
            raise forms.ValidationError("Token must be at least 10 characters long.")
        if not re.search(r'[A-Z]', token):
            raise forms.ValidationError("Token must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', token):
            raise forms.ValidationError("Token must contain at least one lowercase letter.")
        if not re.search(r'[0-9]', token):
            raise forms.ValidationError("Token must contain at least one digit.")

        return token


@admin.register(AdminToken)
class AdminTokenAdmin(admin.ModelAdmin):
    form = AdminTokenForm
    list_display = ('label', 'token_display', 'created_at', 'expires_at', 'is_active', 'is_token_valid')
    readonly_fields = ('created_at', 'token_instructions')
    fields = ('token_instructions', 'label', 'token', 'expires_at', 'is_active', 'created_at')

    def token_display(self, obj):
        return format_html(
            '<code style="background:#f3f4f6;color:#374151;padding:2px 8px;border-radius:4px;'
            'font-size:1em;letter-spacing:0.05em">{}</code>',
            obj.token
        )
    token_display.short_description = 'Token'

    def token_instructions(self, obj):
        return format_html("""
            <div style="background:#fffbeb;color:#374151;border:1px solid #fde68a;border-radius:6px;
                        padding:14px 16px;margin-bottom:8px;font-size:0.875em;line-height:1.6">
                <strong style="display:block;margin-bottom:6px">🔑 Admin Token Guide</strong>
                <ul style="margin:0;padding-left:18px">
                    <li>Leave the <strong>Token</strong> field blank to auto-generate a secure 16-character token.</li>
                    <li>Or enter a <strong>custom token</strong> you can remember — e.g. <code style="color:#374151">"MyShop2024x"</code></li>
                    <li>Custom tokens must be <strong>at least 10 characters</strong> and include uppercase,
                        lowercase, and a digit.</li>
                    <li>The token is stored and <strong>visible here</strong> — you can always return to
                        this page if you forget it.</li>
                    <li>To use the token: go to <strong>/store-admin</strong> on your site and paste it in.</li>
                    <li>To revoke access: uncheck <strong>Is active</strong> or delete the token.</li>
                </ul>
            </div>
        """)
    token_instructions.short_description = ''

    def is_token_valid(self, obj):
        return obj.is_valid()
    is_token_valid.boolean = True
    is_token_valid.short_description = 'Valid'

    def save_model(self, request, obj, form, change):
        # Auto-generate if blank
        if not obj.token:
            obj.token = generate_token()
        # Default expiry: 30 days from now
        if not obj.expires_at:
            obj.expires_at = timezone.now() + timedelta(days=30)
        super().save_model(request, obj, form, change)
        if not change:
            self.message_user(
                request,
                f'Token created. Your login token is: {obj.token} — '
                f'You can always view it again from this page.'
            )


# ─── Rest unchanged ───────────────────────────────────────────────────────────

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'quantity')
    search_fields = ('name', 'category')
    list_filter = ('category',)

    class ProductImageInline(admin.StackedInline):
        model = ProductImage
        extra = 1
        readonly_fields = ('display_image',)

        def display_image(self, instance):
            if instance.image:
                return format_html(
                    '<img src="{}" style="max-height:200px;max-width:200px;" />',
                    instance.image.url
                )
            return "No image"

    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'is_primary', 'created_at', 'display_image')
    list_filter = ('is_primary', 'product')

    def display_image(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height:100px;max-width:100px;" />',
                obj.image.url
            )
        return "No image"
    display_image.short_description = 'Image'


class TransactionItemInline(admin.TabularInline):
    model = TransactionItem
    extra = 0
    readonly_fields = ('product_name', 'price', 'quantity')


class TransactionStatusHistoryInline(admin.TabularInline):
    model = TransactionStatusHistory
    extra = 0
    readonly_fields = ('status', 'note', 'created_at')
    ordering = ('created_at',)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('name', 'tracking_code', 'total_amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'email', 'tracking_code')
    readonly_fields = ('tracking_code', 'created_at')
    inlines = [TransactionItemInline, TransactionStatusHistoryInline]


@admin.register(BankDetails)
class BankDetailsAdmin(admin.ModelAdmin):
    list_display = ('bank_name', 'account_name', 'account_number')
    search_fields = ('bank_name', 'account_name')


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_title', 'contact_email', 'contact_number')

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()
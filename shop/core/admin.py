from django.contrib import admin
from django.utils.html import format_html
from .models import Product, ProductImage, Transaction, BankDetails, AdminToken, SiteSettings

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
                return format_html('<img src="{}" style="max-height: 200px; max-width: 200px;" />'.format(instance.image.url))
            return "No image"

    inlines = [ProductImageInline]

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'is_primary', 'created_at', 'display_image')
    list_filter = ('is_primary', 'product')

    def display_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 100px;" />'.format(obj.image.url))
        return "No image"
    display_image.short_description = 'Image'

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('name', 'tracking_number', 'total_amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'email', 'tracking_number')
    readonly_fields = ('tracking_number',)

@admin.register(BankDetails)
class BankDetailsAdmin(admin.ModelAdmin):
    list_display = ('bank_name', 'account_name', 'account_number')
    search_fields = ('bank_name', 'account_name')

@admin.register(AdminToken)
class AdminTokenAdmin(admin.ModelAdmin):
    list_display = ('token', 'created_at', 'is_token_valid')
    readonly_fields = ('created_at',)

    def is_token_valid(self, obj):
        return obj.is_valid()
    is_token_valid.boolean = True
    is_token_valid.short_description = 'Valid Token'

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_title', 'contact_email', 'contact_number')

    def has_add_permission(self, request):
        # Prevent multiple site settings instances
        return not SiteSettings.objects.exists()
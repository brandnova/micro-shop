from rest_framework import serializers
from .models import Product, ProductImage, Transaction, TransactionItem, TransactionStatusHistory, BankDetails, SiteSettings


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'code', 'name', 'category', 'description', 'price', 'quantity', 'is_active', 'images', 'primary_image']

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            return ProductImageSerializer(primary, context=self.context).data
        return None


class TransactionItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = TransactionItem
        fields = ['id', 'product_name', 'price', 'quantity', 'subtotal']


class TransactionStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionStatusHistory
        fields = ['id', 'status', 'note', 'created_at']


class TransactionSerializer(serializers.ModelSerializer):
    items = TransactionItemSerializer(many=True, read_only=True)
    status_history = TransactionStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'tracking_code', 'name', 'email', 'location', 'phone',
            'total_amount', 'status', 'note', 'created_at', 'payment_proof',
            'items', 'status_history',
        ]
        read_only_fields = ['tracking_code']


class TransactionCreateSerializer(serializers.ModelSerializer):
    """
    Used during order creation. Accepts a list of cart items and creates
    TransactionItems in bulk.
    """
    items = TransactionItemSerializer(many=True, write_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'tracking_code', 'name', 'email', 'location', 'phone', 'note',
            'total_amount', 'items',
        ]
        read_only_fields = ['tracking_code']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        transaction = Transaction.objects.create(**validated_data)
        for item in items_data:
            TransactionItem.objects.create(transaction=transaction, **item)
        # Seed the status history
        TransactionStatusHistory.objects.create(
            transaction=transaction,
            status='pending',
            note='Order placed.',
        )
        return transaction


class BankDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankDetails
        fields = '__all__'


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ['id', 'site_title', 'contact_email', 'contact_number', 'main_color', 'store_tag', 'delivery_methods', 'delivery_time', 'delivery_note',]
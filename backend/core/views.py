import uuid
import os

from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Q

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

from .models import (
    Product, ProductImage, Transaction, TransactionStatusHistory,
    BankDetails, AdminToken, SiteSettings,
)
from .serializers import (
    ProductSerializer, ProductImageSerializer,
    TransactionSerializer, TransactionCreateSerializer,
    BankDetailsSerializer, SiteSettingsSerializer,
)
from .emails import (
    send_order_placed_email,
    send_payment_uploaded_email,
    send_status_update_email,
)


# ─── Health Check ─────────────────────────────────────────────────────────────

@api_view(['GET'])
def health_check(request):
    return Response({
        "status": "ok",
        "version": getattr(settings, "API_VERSION", "2.0"),
        "name": getattr(settings, "API_NAME", "MicroShop API"),
        "environment": getattr(settings, "API_ENV", "development"),
    })


# ─── Admin Auth ───────────────────────────────────────────────────────────────

@api_view(['POST'])
def verify_admin(request):
    raw_token = request.data.get('token')
    if not raw_token:
        return Response({'valid': False, 'message': 'Token required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        admin_token = AdminToken.objects.get(token=raw_token)
        if admin_token.is_valid():
            return Response({'valid': True})
        return Response({'valid': False, 'message': 'Token expired or revoked'}, status=status.HTTP_401_UNAUTHORIZED)
    except AdminToken.DoesNotExist:
        return Response({'valid': False, 'message': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    

# ─── Products ─────────────────────────────────────────────────────────────────

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.prefetch_related('images').all().order_by('-id')

    @action(detail=True, methods=['POST'], url_path='upload-images')
    def upload_images(self, request, pk=None):
        product = self.get_object()
        images = request.FILES.getlist('images')
        primary_image_id = request.data.get('primary_image')

        if not images and not primary_image_id:
            return Response(
                {'error': 'No images provided and no primary image specified'},
                status=status.HTTP_400_BAD_REQUEST
            )

        existing_count = product.images.count()
        if existing_count + len(images) > 10:
            return Response(
                {'error': f'Maximum 10 images per product. You can add {10 - existing_count} more.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded = []
        for image in images:
            try:
                product_image = ProductImage.objects.create(product=product, image=image)
                uploaded.append(product_image)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if primary_image_id:
            try:
                primary = ProductImage.objects.get(id=primary_image_id, product=product)
                product.images.update(is_primary=False)
                primary.is_primary = True
                primary.save()
            except ProductImage.DoesNotExist:
                return Response({'error': 'Specified primary image does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        elif uploaded and not product.images.filter(is_primary=True).exists():
            uploaded[0].is_primary = True
            uploaded[0].save()

        serializer = ProductImageSerializer(uploaded, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['POST'], url_path='set-primary-image')
    def set_primary_image(self, request, pk=None):
        product = self.get_object()
        image_id = request.data.get('image_id')

        if not image_id:
            return Response({'error': 'image_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            image = ProductImage.objects.get(id=image_id, product=product)
            product.images.update(is_primary=False)
            image.is_primary = True
            image.save()
        except ProductImage.DoesNotExist:
            return Response({'error': 'Specified image does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Primary image updated successfully'})

    @action(detail=True, methods=['DELETE'], url_path='delete-image')
    def delete_image(self, request, pk=None):
        product = self.get_object()
        image_id = request.data.get('image_id')

        if not image_id:
            return Response({'error': 'image_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            image = ProductImage.objects.get(id=image_id, product=product)
            if image.is_primary:
                next_image = product.images.exclude(id=image_id).first()
                if next_image:
                    next_image.is_primary = True
                    next_image.save()
            image.delete()
        except ProductImage.DoesNotExist:
            return Response({'error': 'Specified image does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Image deleted successfully'})


# ─── Transactions ─────────────────────────────────────────────────────────────

class TransactionViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'create':
            return TransactionCreateSerializer
        return TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.prefetch_related('items', 'status_history').all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(tracking_code__iexact=search)
            )
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()

        send_order_placed_email(transaction)

        return Response(
            TransactionSerializer(transaction).data,
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        instance = self.get_object()
        old_status = instance.status

        response = self.update(request, *args, **kwargs)

        instance.refresh_from_db()
        if instance.status != old_status:
            TransactionStatusHistory.objects.create(
                transaction=instance,
                status=instance.status,
                note=request.data.get('status_note', ''),
            )
            send_status_update_email(instance)

        return response


# ─── Order Tracking ───────────────────────────────────────────────────────────

@api_view(['GET'])
def track_order(request):
    tracking_code = request.query_params.get('tracking_code')
    if not tracking_code:
        return Response({'error': 'tracking_code is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        transaction = Transaction.objects.prefetch_related('items', 'status_history').get(
            tracking_code=tracking_code
        )
    except Transaction.DoesNotExist:
        return Response({'error': 'No order found with that tracking code.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TransactionSerializer(transaction)
    return Response(serializer.data)


# ─── Payment Proof Upload ─────────────────────────────────────────────────────

@api_view(['POST'])
def upload_payment_proof(request):
    tracking_code = request.data.get('tracking_code')
    payment_proof = request.FILES.get('payment_proof')

    if not tracking_code:
        return Response({'error': 'tracking_code is required'}, status=status.HTTP_400_BAD_REQUEST)

    if not payment_proof:
        return Response({'error': 'No file was uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

    # Rename to avoid collisions and path guessing
    ext = os.path.splitext(payment_proof.name)[1].lower()
    payment_proof.name = f"{uuid.uuid4().hex}{ext}"

    try:
        transaction = Transaction.objects.get(tracking_code=tracking_code)
    except Transaction.DoesNotExist:
        return Response({'error': 'Invalid tracking code.'}, status=status.HTTP_404_NOT_FOUND)

    transaction.payment_proof = payment_proof
    transaction.status = 'payment_uploaded'
    transaction.save()

    TransactionStatusHistory.objects.create(
        transaction=transaction,
        status='payment_uploaded',
        note='Payment proof uploaded by customer.',
    )

    send_payment_uploaded_email(transaction)

    return Response({'message': 'Payment proof uploaded successfully.'}, status=status.HTTP_200_OK)


# ─── Bank Details ─────────────────────────────────────────────────────────────

class BankDetailsViewSet(viewsets.ModelViewSet):
    queryset = BankDetails.objects.all()
    serializer_class = BankDetailsSerializer


# ─── Site Settings ────────────────────────────────────────────────────────────

class SiteSettingsViewSet(viewsets.ModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer

    def list(self, request):
        obj = SiteSettings.objects.first()
        if not obj:
            obj = SiteSettings.objects.create()
        return Response(self.get_serializer(obj).data)

    def update(self, request, *args, **kwargs):
        obj = SiteSettings.objects.first()
        if not obj:
            obj = SiteSettings.objects.create()
        serializer = self.get_serializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
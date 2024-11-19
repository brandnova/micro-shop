# core/views.py 

from rest_framework import viewsets, status 
from rest_framework.decorators import api_view, action 
from rest_framework.response import Response 
from .models import Product, ProductImage, Transaction, BankDetails, AdminToken, SiteSettings
from .serializers import ProductSerializer, ProductImageSerializer, TransactionSerializer, BankDetailsSerializer, SiteSettingsSerializer
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

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
        
        # Limit total number of images per product
        existing_count = product.images.count()
        if existing_count + len(images) > 10:  # Maximum 10 images per product
            return Response(
                {'error': f'Maximum 10 images allowed per product. You can add {10 - existing_count} more images.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        uploaded_images = []
        for image in images:
            try:
                product_image = ProductImage.objects.create(
                    product=product,
                    image=image
                )
                uploaded_images.append(product_image)
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Set primary image
        if primary_image_id:
            try:
                primary_image = ProductImage.objects.get(id=primary_image_id, product=product)
                product.images.update(is_primary=False)
                primary_image.is_primary = True
                primary_image.save()
            except ProductImage.DoesNotExist:
                return Response(
                    {'error': 'Specified primary image does not exist'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif uploaded_images and not product.images.filter(is_primary=True).exists():
            uploaded_images[0].is_primary = True
            uploaded_images[0].save()
        
        serializer = ProductImageSerializer(uploaded_images, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['POST'], url_path='set-primary-image')
    def set_primary_image(self, request, pk=None):
        product = self.get_object()
        image_id = request.data.get('image_id')
        
        if not image_id:
            return Response(
                {'error': 'image_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            image = ProductImage.objects.get(id=image_id, product=product)
            product.images.update(is_primary=False)
            image.is_primary = True
            image.save()
        except ProductImage.DoesNotExist:
            return Response(
                {'error': 'Specified image does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({'message': 'Primary image updated successfully'})
    
    @action(detail=True, methods=['DELETE'], url_path='delete-image')
    def delete_image(self, request, pk=None):
        product = self.get_object()
        image_id = request.data.get('image_id')
        
        if not image_id:
            return Response(
                {'error': 'image_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            image = ProductImage.objects.get(id=image_id, product=product)
            
            # If deleting primary image, set another image as primary if available
            if image.is_primary:
                next_image = product.images.exclude(id=image_id).first()
                if next_image:
                    next_image.is_primary = True
                    next_image.save()
            
            image.delete()
        except ProductImage.DoesNotExist:
            return Response(
                {'error': 'Specified image does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({'message': 'Image deleted successfully'})

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(email__icontains=search) | queryset.filter(tracking_number__iexact=search)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        # Send email with tracking number
        transaction = serializer.instance
        send_mail(
            'Your Order Tracking Number',
            f'Thank you for your order. Your tracking number is: {transaction.tracking_number}',
            settings.DEFAULT_FROM_EMAIL,
            [transaction.email],
            fail_silently=False,
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

class BankDetailsViewSet(viewsets.ModelViewSet):
    queryset = BankDetails.objects.all()
    serializer_class = BankDetailsSerializer

@api_view(['POST'])
def verify_admin(request):
    token = request.data.get('token')
    try:
        admin_token = AdminToken.objects.get(token=token)
        if admin_token.is_valid():
            return Response({'valid': True})
        else:
            return Response({'valid': False, 'message': 'Token expired'})
    except AdminToken.DoesNotExist:
        return Response({'valid': False, 'message': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def upload_payment_proof(request):
    tracking_number = request.data.get('tracking_number')
    payment_proof = request.data.get('payment_proof')

    try:
        transaction = Transaction.objects.get(tracking_number=tracking_number)
    except Transaction.DoesNotExist:
        return Response({'error': 'Invalid tracking number'}, status=status.HTTP_400_BAD_REQUEST)

    transaction.payment_proof = payment_proof
    transaction.status = 'payment_uploaded'
    transaction.save()

    return Response({'message': 'Payment proof uploaded successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def track_order(request):
    tracking_number = request.query_params.get('tracking_number')

    try:
        transaction = Transaction.objects.get(tracking_number=tracking_number)
    except Transaction.DoesNotExist:
        return Response({'error': 'Invalid tracking number'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = TransactionSerializer(transaction)
    return Response(serializer.data)

class SiteSettingsViewSet(viewsets.ModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer

    def list(self, request):
        settings = SiteSettings.objects.first()
        if not settings:
            settings = SiteSettings.objects.create()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        settings = SiteSettings.objects.first()
        if not settings:
            settings = SiteSettings.objects.create()
        serializer = self.get_serializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
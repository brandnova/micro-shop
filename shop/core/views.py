# core/views.py 

from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Product, Transaction, BankDetails, AdminToken, SiteSettings
from .serializers import ProductSerializer, TransactionSerializer, BankDetailsSerializer, SiteSettingsSerializer
from django.core.mail import send_mail
from django.conf import settings

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

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
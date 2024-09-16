from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Product, Transaction, BankDetails, AdminToken
from .serializers import ProductSerializer, TransactionSerializer, BankDetailsSerializer

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
            queryset = queryset.filter(name__icontains=search) | queryset.filter(email__icontains=search)
        return queryset

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


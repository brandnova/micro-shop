from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, TransactionViewSet, BankDetailsViewSet, verify_admin

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'bank-details', BankDetailsViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/verify-admin/', verify_admin, name='verify_admin'),
]
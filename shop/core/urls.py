# core/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter # type: ignore
from .views import ProductViewSet, TransactionViewSet, BankDetailsViewSet, SiteSettingsViewSet, verify_admin, upload_payment_proof, track_order

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'bank-details', BankDetailsViewSet)
router.register(r'site-settings', SiteSettingsViewSet, basename='site-settings')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/verify-admin/', verify_admin, name='verify_admin'),
    path('api/upload-payment-proof/', upload_payment_proof, name='upload_payment_proof'),
    path('api/track-order/', track_order, name='track_order'),
]
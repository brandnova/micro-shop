from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, TransactionViewSet, BankDetailsViewSet,
    SiteSettingsViewSet, verify_admin, upload_payment_proof,
    track_order, health_check, mark_order_delivered,
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', TransactionViewSet, basename='order')
router.register(r'bank-details', BankDetailsViewSet, basename='bank-details')
router.register(r'site-settings', SiteSettingsViewSet, basename='site-settings')

urlpatterns = [
    # ⚠️ Custom order endpoints MUST come before router.urls
    # so they are matched before DRF tries to resolve them as {pk} detail routes.
    path('api/orders/upload-proof/', upload_payment_proof, name='upload_payment_proof'),
    path('api/orders/track/', track_order, name='track_order'),
    path('api/orders/confirm-delivery/', mark_order_delivered, name='mark_order_delivered'),

    path('api/', include(router.urls)),
    path('api/health/', health_check, name='health_check'),
    path('api/verify-admin/', verify_admin, name='verify_admin'),
]
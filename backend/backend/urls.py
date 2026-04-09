from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

admin.site.site_header = "MicroShop Admin"
admin.site.site_title  = "MicroShop"
admin.site.index_title = "Store Management"

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('', include('core.urls')),
]

# Serve media files when using local storage (dev or Cloudinary-less production).
# When Cloudinary is active, files are served directly from Cloudinary CDN
# and this block is harmless but unused.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# All non-API/admin/static/media routes go to the React SPA.
urlpatterns += [
    re_path(
        r'^(?!api/|django-admin/|static/|media/).*$',
        TemplateView.as_view(template_name='frontend/index.html')
    ),
]
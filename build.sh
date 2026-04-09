#!/usr/bin/env bash
set -o errexit

echo "Starting MicroShop build..."

# ------------------------
# Backend setup
# ------------------------
cd backend
pip install -r requirements.txt
pip install --upgrade pip

# ------------------------
# Frontend build
# ------------------------
cd ../frontend
npm install
npm audit fix
npm run build

# ------------------------
# Move frontend into Django
# ------------------------
echo "Integrating frontend build into Django..."

rm -rf ../backend/static/frontend
rm -rf ../backend/templates/frontend

mkdir -p ../backend/static/frontend
mkdir -p ../backend/templates/frontend

cp -r dist/assets ../backend/static/frontend/
cp dist/index.html ../backend/templates/frontend/index.html

# ------------------------
# Django final steps
# ------------------------
cd ../backend

python manage.py collectstatic --noinput
python manage.py migrate

echo "Ensuring demo superuser exists..."

python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
import os

User = get_user_model()

username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin123")

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print("Superuser created")
else:
    print("Superuser already exists")
EOF

echo "Build complete."
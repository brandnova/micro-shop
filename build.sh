#!/usr/bin/env bash
set -o errexit

echo "Starting build process..."

# ------------------------
# Backend setup
# ------------------------
cd backend
pip install -r requirements.txt

# ------------------------
# Frontend build
# ------------------------
cd ../frontend
npm install
npm audit fix
npm run build

# ------------------------
# Move build into Django
# ------------------------
echo "Moving frontend build into Django..."

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

echo "Build complete."
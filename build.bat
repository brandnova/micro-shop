@echo off
setlocal

echo Starting MicroShop build...

:: ------------------------
:: Backend setup
:: ------------------------
cd backend
pip install -r requirements.txt
pip install --upgrade pip

:: ------------------------
:: Frontend build
:: ------------------------
cd ..\frontend
call npm install
call npm audit fix
call npm run build

:: ------------------------
:: Move frontend into Django
:: ------------------------
echo Integrating frontend build into Django...

if exist ..\backend\static\frontend rmdir /s /q ..\backend\static\frontend
if exist ..\backend\templates\frontend rmdir /s /q ..\backend\templates\frontend

mkdir ..\backend\static\frontend
mkdir ..\backend\templates\frontend

xcopy /e /i /q dist\assets ..\backend\static\frontend\assets
copy dist\index.html ..\backend\templates\frontend\index.html

:: ------------------------
:: Django final steps
:: ------------------------
cd ..\backend

python manage.py collectstatic --noinput
python manage.py migrate

echo Ensuring demo superuser exists...
python manage.py shell -c "from django.contrib.auth import get_user_model; import os; User = get_user_model(); u = os.environ.get('DJANGO_SUPERUSER_USERNAME','admin'); e = os.environ.get('DJANGO_SUPERUSER_EMAIL','admin@example.com'); p = os.environ.get('DJANGO_SUPERUSER_PASSWORD','admin123'); User.objects.create_superuser(u,e,p) if not User.objects.filter(username=u).exists() else print('Superuser already exists')"

echo Build complete.
endlocal
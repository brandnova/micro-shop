# 🛒 MicroShop (V2)

A lightweight, API-driven micro e-commerce system built with **Django (DRF)** and **React**. Designed for small businesses that want a real, deployable store without the complexity of payment gateway integrations.

MicroShop uses a **manual bank transfer workflow** — customers place orders, transfer payment, upload proof, and track their order through fulfillment. The React frontend is bundled into Django for single-server deployment.

---

## Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Backend  | Django 5.x, Django REST Framework             |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion   |
| Database | SQLite (development) · PostgreSQL (production) |
| Email    | SMTP · falls back to console if unconfigured  |

---

## Features

- Product catalogue with multiple images per product
- Cart, checkout, and order placement
- Human-readable tracking codes (`MS-2026-AB12CD34`)
- Payment proof upload
- Per-status email notifications to customers
- React admin dashboard + full Django admin
- Dynamic site settings and accent color theming
- Bank details management (shown to customers at checkout)
- API health check endpoint
- Single-server deployment — React bundled into Django

---

## Development Setup

### 1. Clone

```bash
git clone https://github.com/brandnova/micro-shop.git
cd micro-shop
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment variables

Create `backend/.env`:

```env
# Django core
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000

# CORS — only needed during development (removed in production)
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Email — leave EMAIL_HOST blank to use console output during development
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Shown in customer emails as the link back to the store
FRONTEND_URL=http://localhost:5173

# API identity (shown at /api/health/)
API_NAME=MicroShop API
API_VERSION=2.0
API_ENV=development

# Cloudinary — leave blank to fall back to local media storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 4. Run the backend

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev        # Vite dev server at http://localhost:5173
```

Create `frontend/.env.development`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## Admin Access

### Django Admin — full database control

URL: `http://localhost:8000/django-admin`  
Login: superuser credentials from `createsuperuser`

Use for: creating admin tokens, direct data access, emergency edits.

### React Admin Dashboard — daily store operations

URL: `http://localhost:5173/store-admin` (dev) · `/store-admin` (production)  
Login: an **Admin Token** (not your Django password)

**Creating an Admin Token:**

1. Go to Django Admin → **Admin Tokens → Add**
2. Optionally enter a label (e.g. `main`) and set an expiry date
3. Leave the **Token** field blank to auto-generate, or enter a custom token
   - Custom tokens: min 10 chars, must include uppercase, lowercase, and a digit
4. Click **Save**
5. The token appears in the success message and is always visible in the token list
6. Paste it into the React admin login screen

To revoke access: uncheck **Is active** or delete the token.

---

## Workflows

### Customer

1. Browse products and add to cart
2. Checkout — fill in name, email, phone, delivery address
3. Receive tracking code by email (`MS-2026-AB12CD34`)
4. Transfer the exact order total to a bank account listed under **Payment Info** in the nav
5. Click **Upload Proof** in the nav, enter tracking code, attach receipt
6. Click **Track Order** in the nav at any time to check status
7. Receive email updates at every status change

### Store Owner

1. Log into `/store-admin`
2. **Overview** — total orders, revenue, pending actions at a glance
3. **Products** — add, edit, delete products and manage images
4. **Orders** — search orders, view payment proofs, update order status
5. **Bank Details** — add payment accounts shown to customers
6. **Site Settings** — store name, tagline, contact info, accent color

Every status change (Payment Confirmed, Shipped, Delivered, etc.) automatically emails the customer.

---

## Order Status Flow

```
pending → payment_uploaded → payment_confirmed → processing → shipped → delivered
                                                                        ↘ cancelled
```

---

## API Reference

```
GET  /api/health/
GET  /api/products/
POST /api/products/
GET  /api/products/{id}/
POST /api/products/{id}/upload-images/
GET  /api/orders/
POST /api/orders/
GET  /api/orders/track/?tracking_code=MS-2026-XXXXXXXX
POST /api/orders/upload-proof/
GET  /api/bank-details/
POST /api/verify-admin/
GET  /api/site-settings/
```

---

## Production Deployment

### 1. Configure environment

Update `backend/.env`:

```env
DEBUG=False
SECRET_KEY=a-long-random-production-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
API_ENV=production

# Real SMTP credentials
EMAIL_HOST=smtp.yourprovider.com
EMAIL_HOST_USER=you@yourdomain.com
EMAIL_HOST_PASSWORD=your-smtp-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Remove or leave blank — CORS not needed when frontend is served by Django
CORS_ALLOWED_ORIGINS=
```

### 2. Build the React frontend

```bash
cd frontend
npm run build
```

### 3. Move build output into Django

```
frontend/dist/assets/    →  backend/static/frontend/assets/
frontend/dist/index.html →  backend/templates/frontend/index.html
```

### 4. Update index.html to use Django static tags

Open `backend/templates/frontend/index.html` and make these two edits:

**Add at the very top:**
```html
{% load static %}
```

**Replace all asset `src` and `href` paths**, for example:
```html
<!-- Before -->
<script src="/assets/index-abc123.js"></script>
<link rel="stylesheet" href="/assets/index-abc123.css">

<!-- After -->
<script src="{% static 'frontend/assets/index-abc123.js' %}"></script>
<link rel="stylesheet" href="{% static 'frontend/assets/index-abc123.css' %}">
```

### 5. Collect static files

```bash
cd backend
python manage.py collectstatic
```

### 6. Run the server

```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

Or with Daphne (if you add Channels later):

```bash
daphne backend.asgi:application
```

### Media files in production

Django does **not** serve `/media/` files efficiently in production. The recommended setup is to point your web server directly at `MEDIA_ROOT`:

**Nginx example:**
```nginx
location /media/ {
    alias /path/to/backend/media/;
}

location /static/ {
    alias /path/to/backend/staticfiles/;
}

location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

If you don't have Nginx (e.g. on a simple VPS or PaaS), the Django fallback in `urls.py` will serve media files directly — fine for low traffic, not recommended for scale.

---

## Deployment Checklist

- [ ] `DEBUG=False` in `.env`
- [ ] `SECRET_KEY` is long, random, and not the default
- [ ] `ALLOWED_HOSTS` includes your domain
- [ ] `CSRF_TRUSTED_ORIGINS` includes your domain with `https://`
- [ ] `FRONTEND_URL` points to your live domain
- [ ] SMTP credentials set and tested
- [ ] React built and files moved into Django (`static/` and `templates/`)
- [ ] `index.html` updated with `{% load static %}` and `{% static %}` tags
- [ ] `collectstatic` run successfully
- [ ] Database migrated (`python manage.py migrate`)
- [ ] Superuser created (`python manage.py createsuperuser`)
- [ ] Admin token created via Django Admin
- [ ] Media files served by Nginx or the Django fallback is in place
- [ ] `/api/health/` returns `"status": "ok"` on the live domain
- [ ] Test a full order flow end to end on the live server

---

## Project Structure

```
micro-shop/
├── backend/
│   ├── core/           # Models, views, serializers, email logic, URLs
│   ├── backend/        # Django settings, root URLs, WSGI
│   ├── static/         # Frontend build assets live here after deployment
│   ├── staticfiles/    # Output of collectstatic — served in production
│   └── templates/
│       └── frontend/
│           └── index.html   # React entry point (after build)
└── frontend/
    └── src/
        ├── api/        # Axios client + per-domain request functions
        ├── context/    # ThemeContext — accent color via CSS variables
        ├── hooks/      # useCart, useSiteSettings, useToast, useScrollToTop
        ├── components/
        │   ├── ui/     # Button, Modal, Badge, Toast, Spinner
        │   ├── home/   # Storefront components and modals
        │   └── admin/  # Dashboard panels, tables, stats
        └── pages/      # HomePage, AdminDashboard, AdminLogin
```

---

## License

MIT
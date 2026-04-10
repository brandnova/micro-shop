# 🛒 MicroShop (V2)

A lightweight, API-driven micro e-commerce system built with **Django (DRF)** and **React**. Designed for small businesses that want a real, deployable store without complex payment integrations.

MicroShop uses a **manual bank transfer workflow** — customers place orders, transfer payment, upload proof, and track their order through fulfillment. The React frontend is bundled into Django for single-server deployment.

---

## Tech Stack

| Layer    | Technology                                                        |
|----------|-------------------------------------------------------------------|
| Backend  | Django 5.x, Django REST Framework                                 |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion                       |
| Database | SQLite (local dev) · PostgreSQL via `DATABASE_URL` (production)   |
| Storage  | Cloudinary storage · local disk fallback       |
| Email    | SMTP · console fallback if unconfigured                           |

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

## Local Development

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
SECRET_KEY=django-insecure-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=https://yourdomain.com

# PostgreSQL — leave blank to use SQLite locally
# DATABASE_URL=postgresql://HAXGOFx:IOVceEq@sectyxyauifa.db.dbaas.dev:31163/OONEoa

# CORS — only needed during development (removed in production)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Email — leave EMAIL_HOST blank to use console output during development
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@microshop.com

# Shown in customer emails as the link back to the store
FRONTEND_URL=http://localhost:5173

# API identity (shown at /api/health/)
API_NAME=MicroShop API
API_VERSION=2.0
API_ENV=development

# Cloudinary — leave ALL THREE blank to fall back to local media storage
# To enable Cloudinary, fill in all three values below
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> All external services are **opt-in**. Leave `DATABASE_URL` blank → SQLite. Leave Cloudinary keys blank → local disk storage. Leave `EMAIL_HOST` blank → emails print to the terminal.

### 4. Run the backend

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 5. Run the frontend

Create `frontend/.env.development`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

---

## Admin Access

### Django Admin — full database control

URL: `/django-admin`
Login with your `createsuperuser` credentials.
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
2. Checkout — enter name, email, phone, delivery address
3. Receive tracking code by email (`MS-2026-AB12CD34`)
4. Transfer the exact order total to a bank account listed under **Payment Info** in the nav
5. Click **Upload Proof** in the nav, enter tracking code, attach receipt
6. Use **Track Order** in the nav to check status at any time
7. Receive email updates at every status change

### Store Owner

1. Log into `/store-admin`
2. **Overview** — total orders, revenue, pending actions at a glance
3. **Products** — add, edit, delete products and manage images
4. **Orders** — search orders, view payment proofs, update status
5. **Bank Details** — manage payment accounts shown to customers
6. **Site Settings** — store name, tagline, contact info, accent color

Every status update emails the customer automatically.

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

### Render (recommended)

MicroShop includes a `build.sh` that handles the full build and integration automatically.

#### Prerequisites

- Render account
- PostgreSQL database (Supabase, Neon, Railway, or any provider that gives a connection string)
- Cloudinary account with storage config variables

#### 1. Render Web Service settings

| Field | Value |
|---|---|
| Runtime | Python 3 |
| Build Command | `chmod +x build.sh && ./build.sh` |
| Start Command | `cd backend && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT` |

#### 2. Environment variables (set in Render dashboard)

```env
# Same as your local .env variables (set DEBUG to False)
```

#### 3. After first deploy — create superuser

Render dashboard → your service → **Shell** tab:

```bash
cd backend && python manage.py createsuperuser
```

#### 4. Post-deploy setup checklist

1. `/django-admin` → **Admin Tokens → Add** — create your store login token
2. `/django-admin` → **Bank Details → Add** — add your payment account(s)
3. `/django-admin` → **Site Settings** — configure store name, tagline, theme color
4. `/store-admin` — log in with your token and verify everything loads

> **Free tier:** Render's free tier sleeps after 15 minutes of inactivity. First request after sleep takes ~30s. Upgrade to Starter ($7/month) for always-on.

---

### Manual deployment (Linux/VPS)

#### 1. Build and integrate

```bash
chmod +x build.sh && ./build.sh
```

#### 2. Nginx configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /static/ {
        alias /path/to/backend/staticfiles/;
    }

    location /media/ {
        # Only needed if Cloudinary storage is NOT configured.
        # With Cloudinary active, media is served directly from the bucket.
        alias /path/to/backend/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## Deployment Checklist

- [ ] `DEBUG=False`
- [ ] `SECRET_KEY` is long, random, not the default
- [ ] `ALLOWED_HOSTS` includes your domain
- [ ] `CSRF_TRUSTED_ORIGINS` includes `https://` + your domain
- [ ] `FRONTEND_URL` points to your live URL
- [ ] `DATABASE_URL` set to your PostgreSQL connection string
- [ ] Cloudinary credentials set in virtual environment file
- [ ] SMTP credentials configured and tested
- [ ] Frontend built and integrated (`build.sh` or manual steps)
- [ ] `collectstatic` completed successfully
- [ ] Database migrated
- [ ] Superuser created
- [ ] Admin token created via Django Admin
- [ ] Bank details added
- [ ] Site settings configured
- [ ] `/api/health/` returns `"status": "ok"` on the live domain
- [ ] Upload a test product image and confirm it appears (verifies S3 storage)
- [ ] Full order flow tested end to end on the live server

---

## Project Structure

```
micro-shop/
├── build.sh                    # Automated build and integration script
├── backend/
│   ├── core/                   # Models, views, serializers, emails, URLs
│   ├── backend/                # Django settings, root URLs, WSGI
│   ├── static/frontend/        # React build assets (populated by build.sh)
│   ├── staticfiles/            # Output of collectstatic
│   └── templates/frontend/
│       └── index.html          # React entry point (populated by build.sh)
└── frontend/
    └── src/
        ├── api/                # Axios client + per-domain request functions
        ├── context/            # ThemeContext — accent color via CSS variables
        ├── hooks/              # useCart, useSiteSettings, useToast, useScrollToTop
        ├── components/
        │   ├── ui/             # Button, Modal, Badge, Toast, Spinner
        │   ├── home/           # Storefront components and modals
        │   └── admin/          # Dashboard panels, tables, stats
        └── pages/              # HomePage, AdminDashboard, AdminLogin
```

---

## License

MIT
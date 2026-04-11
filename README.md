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
| Storage  | Cloudinary (optional) · local disk fallback                       |
| Email    | SMTP · console fallback if unconfigured                           |

---

## Features

- Product catalogue with multiple images, WebP auto-conversion, and lazy loading
- Cart with localStorage persistence
- Checkout with order notes and delivery info display
- Human-readable tracking codes (`MS-2026-AB12CD34`)
- Payment proof upload (images converted to WebP, PDFs stored as-is)
- Per-status email notifications to customers
- Stock auto-decremented on payment confirmation
- Product soft delete (deactivate/reactivate) and permanent delete
- Product share links with Open Graph meta tags
- React admin dashboard + full Django admin
- Dynamic site settings — theme color, delivery info, contact details
- Bank details management shown to customers at checkout
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
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000

# CORS — only needed during development
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Database — leave blank to use SQLite locally
DATABASE_URL=

# Email — leave EMAIL_HOST blank to print emails to the console
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Used in customer emails as the link back to the store
FRONTEND_URL=http://localhost:5173

# API identity
API_NAME=MicroShop API
API_VERSION=2.0
API_ENV=development

# Cloudinary — leave ALL THREE blank to fall back to local media storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> All external services are opt-in. Leave `DATABASE_URL` blank → SQLite. Leave Cloudinary keys blank → local disk. Leave `EMAIL_HOST` blank → emails print to terminal.

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

URL: `/store-admin`
Login with an **Admin Token** (not your Django password).

**Creating a token:**

1. Django Admin → **Admin Tokens → Add**
2. Set a label (optional) and expiry date
3. Leave **Token** blank to auto-generate, or enter a custom one
   - Custom tokens: min 10 chars, must include uppercase, lowercase, and a digit
4. Click **Save** — token is visible in the list and shown in the success message
5. Paste it into `/store-admin` to log in

Revoke tokens by unchecking **Is active** or deleting them.

---

## Workflows

### Customer

1. Browse products and add to cart (cart persists across page reloads)
2. Checkout — enter name, email, phone, delivery address, and an optional order note
3. Receive tracking code by email (e.g. `MS-2026-AB12CD34`)
4. Transfer the exact order total to a bank account listed under **Payment Info** in the nav
5. Click **Upload Proof** in the nav, enter tracking code, attach receipt
6. Use **Track Order** in the nav to check order status at any time
7. Receive email notifications at every status change

### Store Owner

1. Log into `/store-admin`
2. **Overview** — total orders, confirmed revenue, pending actions at a glance
3. **Products** — add, edit, deactivate, or permanently delete products; manage images
4. **Orders** — search and filter orders, view payment proofs, update order status
5. **Bank Details** — manage payment accounts shown to customers
6. **Site Settings** — store name, tagline, theme color, delivery info, contact details

Every status update emails the customer automatically. Stock is decremented when payment is confirmed.

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
GET  /api/products/                              # active, paginated
GET  /api/products/?status=all                  # all products, unpaginated (admin)
POST /api/products/
GET  /api/products/{id}/
PATCH /api/products/{id}/
DELETE /api/products/{id}/
POST /api/products/{id}/upload-images/
POST /api/products/{id}/set-primary-image/
DELETE /api/products/{id}/delete-image/
GET  /api/orders/
POST /api/orders/
GET  /api/orders/{id}/
PATCH /api/orders/{id}/
GET  /api/orders/track/?tracking_code=MS-2026-XXXXXXXX
POST /api/orders/upload-proof/
GET  /api/bank-details/
POST /api/bank-details/
PATCH /api/bank-details/{id}/
DELETE /api/bank-details/{id}/
POST /api/verify-admin/
GET  /api/site-settings/
PATCH /api/site-settings/1/
GET  /p/{code}/                                 # product share / OG redirect
```

---

## Deployment

MicroShop includes a `build.sh` script that handles the complete build and Django integration automatically.

### Prerequisites

- A server or PaaS account (Render recommended)
- A PostgreSQL database connection string (Supabase, Neon, Railway, or similar)
- Cloudinary account (optional — local disk storage works without it)
- SMTP credentials for email delivery

### Environment variables for production

```env
SECRET_KEY=<long random string>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
API_ENV=production

DATABASE_URL=postgresql://user:password@host:port/dbname

# Optional — leave blank to use local disk
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_HOST_USER=you@yourdomain.com
EMAIL_HOST_PASSWORD=your-smtp-password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

### Build and deploy

```bash
chmod +x build.sh && ./build.sh
```

`build.sh` does the following automatically:
1. Installs frontend and backend dependencies
2. Builds the React app with `npm run build`
3. Moves the build output into `backend/static/frontend/` and `backend/templates/frontend/`
4. Patches `index.html` with Django `{% static %}` tags
5. Runs `collectstatic` and `migrate`

Start the server:

```bash
cd backend && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
```

**On Render specifically:**

| Field | Value |
|---|---|
| Build Command | `chmod +x build.sh && ./build.sh` |
| Start Command | `cd backend && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT` |

After first deploy, create a superuser via the Render Shell tab:

```bash
cd backend && python manage.py createsuperuser
```

Then complete setup at `/django-admin`: create an Admin Token, add Bank Details, configure Site Settings.

### Nginx (self-hosted)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /static/ { alias /path/to/backend/staticfiles/; }
    location /media/  { alias /path/to/backend/media/; }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

The `/media/` block is only needed when Cloudinary is not configured.

---

## Deployment Checklist

- [ ] `DEBUG=False`
- [ ] `SECRET_KEY` is long, random, not the insecure default
- [ ] `ALLOWED_HOSTS` includes your domain
- [ ] `CSRF_TRUSTED_ORIGINS` includes `https://` + your domain
- [ ] `FRONTEND_URL` points to your live URL
- [ ] `DATABASE_URL` set to PostgreSQL connection string
- [ ] SMTP credentials configured and tested
- [ ] `build.sh` ran successfully (no errors)
- [ ] `collectstatic` completed
- [ ] Database migrated
- [ ] Superuser created
- [ ] Admin token created at `/django-admin`
- [ ] Bank details added
- [ ] Site settings configured
- [ ] `/api/health/` returns `"status": "ok"` on the live domain
- [ ] Storefront loads and products display correctly
- [ ] Full order flow tested end to end

---

## Project Structure

```
micro-shop/
├── build.sh                    # Automated build and integration script
├── backend/
│   ├── core/
│   │   ├── models.py           # Product, Transaction, AdminToken, SiteSettings, etc.
│   │   ├── views.py            # API viewsets and function-based views
│   │   ├── serializers.py      # DRF serializers
│   │   ├── emails.py           # Transactional email logic
│   │   ├── utils.py            # WebP conversion helper
│   │   └── urls.py             # Core URL patterns
│   ├── backend/                # Django settings, root URLs, WSGI
│   ├── static/frontend/        # React build assets (populated by build.sh)
│   ├── staticfiles/            # Output of collectstatic
│   └── templates/frontend/
│       └── index.html          # React entry point (populated by build.sh)
└── frontend/
    └── src/
        ├── api/                # Axios client + per-domain request functions
        ├── context/            # ThemeContext — accent color via CSS variables
        ├── hooks/              # useCart, useSiteSettings, useToast, useScrollToTop, usePagination
        ├── components/
        │   ├── ui/             # Button, Modal, Badge, Toast, Spinner
        │   ├── home/           # Storefront components and modals
        │   └── admin/          # Dashboard panels, tables, stats, Pagination
        └── pages/              # HomePage, AdminDashboard, AdminLogin
```

---

## License

MIT
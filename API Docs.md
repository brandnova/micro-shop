# API Documentation — MicroShop v2

## Introduction

MicroShop is a simple e-commerce backend built with Django REST Framework. It supports product management, order placement, payment proof uploads, and order tracking.

---

## Workflow

1. Users browse products and add them to the cart (frontend).
2. Users fill in contact details at checkout. The cart items are submitted as structured line items.
3. The system creates an order, generates a human-readable tracking code (e.g. `MS-2026-A3BX9K2Z`), and emails it to the customer.
4. The customer makes a bank transfer, then uploads payment proof using their tracking code.
5. The customer can track their order status at any time using their tracking code.
6. The site owner manages products, views orders, confirms payments, and updates statuses via the admin dashboard.

---

## Endpoints

### Health

#### `GET /api/health/`
Returns API status and version info.

**Response:**
```json
{
  "status": "ok",
  "version": "2.0",
  "name": "MicroShop API",
  "environment": "development"
}
```

---

### Products

#### `GET /api/products/`
List products. Returns paginated results (20 per page).

**Query params:**
- `?status=active` — (default) only active products, paginated
- `?status=inactive` — only inactive products, paginated
- `?status=all` — all products regardless of status, unpaginated (admin use)

Each product includes all images and a resolved `primary_image`.

#### `POST /api/products/`
Create a product.

**Request:**
```json
{
  "name": "Product Name",
  "category": "Category",
  "description": "Description",
  "price": "15.99",
  "quantity": 50
}
```

#### `GET /api/products/{id}/`
Retrieve a single product by database ID. Works for both active and inactive products.

#### `PATCH /api/products/{id}/`
Update a product. Pass `"is_active": false` to soft-delete (hide from storefront).

#### `DELETE /api/products/{id}/`
Permanently delete a product.

#### `POST /api/products/{id}/upload-images/`
Upload one or more images for a product. Accepts `multipart/form-data` with files under the key `images`. All uploaded images are automatically converted to WebP and resized to a maximum of 1200×1200px. Optionally pass `primary_image` (an existing image ID) to set the primary.

#### `POST /api/products/{id}/set-primary-image/`
Set a product's primary image.

**Request:** `{ "image_id": 3 }`

#### `DELETE /api/products/{id}/delete-image/`
Delete a specific image from a product.

**Request:** `{ "image_id": 3 }`

---

### Orders

#### `GET /api/orders/`
List all orders. Supports `?search=` (matches name, email, or tracking code). Returns paginated results.

#### `POST /api/orders/`
Place a new order. Generates a tracking code and sends a confirmation email to the customer.

**Request:**
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "location": "Customer Address",
  "phone": "08012345678",
  "total_amount": "25.99",
  "note": "Optional order note or delivery instructions",
  "items": [
    { "product_name": "Item A", "price": "10.00", "quantity": 2 },
    { "product_name": "Item B", "price": "5.99", "quantity": 1 }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "tracking_code": "MS-2026-A3BX9K2Z",
  "name": "Customer Name",
  "email": "customer@example.com",
  "location": "Customer Address",
  "phone": "08012345678",
  "total_amount": "25.99",
  "note": "",
  "status": "pending",
  "created_at": "2026-01-20T12:00:00Z",
  "payment_proof": null,
  "items": [
    { "id": 1, "product_name": "Item A", "price": "10.00", "quantity": 2, "subtotal": "20.00" },
    { "id": 2, "product_name": "Item B", "price": "5.99", "quantity": 1, "subtotal": "5.99" }
  ],
  "status_history": [
    { "id": 1, "status": "pending", "note": "Order placed.", "created_at": "2026-01-20T12:00:00Z" }
  ]
}
```

#### `GET /api/orders/{id}/`
Retrieve a specific order by database ID.

#### `PATCH /api/orders/{id}/`
Update an order's status. Triggers a customer email notification. Optionally include `status_note` to annotate the change.

**Request:** `{ "status": "shipped", "status_note": "Dispatched via DHL" }`

When status transitions to `payment_confirmed`, product stock is automatically decremented based on the order items.

---

### Order Tracking

#### `GET /api/orders/track/?tracking_code=MS-2026-A3BX9K2Z`
Look up an order by tracking code. Returns the full order including items and status history.

---

### Payment Proof Upload

#### `POST /api/orders/upload-proof/`
Upload payment proof for an order. The uploaded file is converted to WebP automatically (PDFs are stored as-is).

**Request:** `multipart/form-data`
```
tracking_code: MS-2026-A3BX9K2Z
payment_proof: <file>   (jpg, jpeg, png, or pdf — max 10MB)
```

**Response:**
```json
{ "message": "Payment proof uploaded successfully." }
```

On success, the order status moves to `payment_uploaded` and the change is logged in status history. A notification email is sent to the customer.

---

### Bank Details

#### `GET /api/bank-details/`
List all configured bank accounts.

#### `POST /api/bank-details/`
Add a bank account.

**Request:**
```json
{
  "bank_name": "Example Bank",
  "account_name": "Store Account",
  "account_number": "1234567890"
}
```

#### `PATCH /api/bank-details/{id}/`
Update a bank account.

#### `DELETE /api/bank-details/{id}/`
Remove a bank account.

---

### Admin Verification

#### `POST /api/verify-admin/`
Verify an admin token against the database.

**Request:** `{ "token": "YourToken123" }`

**Response:** `{ "valid": true }` or `{ "valid": false, "message": "Token expired or revoked" }`

Tokens are created and managed via the Django admin at `/django-admin`. They support expiry dates and can be manually revoked.

---

### Site Settings

#### `GET /api/site-settings/`
Retrieve current site settings.

**Response fields:** `site_title`, `store_tag`, `contact_email`, `contact_number`, `main_color`, `delivery_methods`, `delivery_time`, `delivery_note`.

#### `PATCH /api/site-settings/1/`
Update site settings.

---

### Product Share (OG redirect)

#### `GET /p/{code}/`
Returns an HTML page with Open Graph meta tags for social sharing, then immediately redirects the visitor to `/?product={code}` which opens the product modal on the storefront.

Used by the Share button on product modals. Crawlers (WhatsApp, Twitter, Facebook) read the meta tags. Humans are redirected instantly.

---

## Order Status Flow

```
pending → payment_uploaded → payment_confirmed → processing → shipped → delivered
                                                                       ↘ cancelled (any stage)
```

Every status transition is logged in `status_history` and triggers an email to the customer.

---

## Error Handling

All errors return a JSON body with an `error` key.

```json
{ "error": "No order found with that tracking code." }
```

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad request / validation error |
| 401  | Invalid or expired token |
| 403  | CSRF token missing (ensure `X-CSRFToken` header is sent on mutations) |
| 404  | Resource not found |
| 500  | Server error |
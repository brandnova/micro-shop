# API Documentation — MicroShop v2

## Introduction

MicroShop is a simple e-commerce backend built with Django REST Framework. It supports product management, order placement, payment proof uploads, and order tracking.

---

## Workflow

1. Users browse products and add them to the cart (frontend).
2. Users fill in contact details at checkout. The cart items are submitted as structured line items.
3. The system creates an order, generates a human-readable tracking code (e.g. `MS-2025-A3BX9K2Z`), and emails it to the customer.
4. The customer makes a bank transfer, then uploads payment proof using their tracking code.
5. The customer can track their order status at any time using their tracking code.
6. The site owner manages products, views orders, confirms payments, and updates statuses via the Django admin.

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
List all products. Each product includes all images and a resolved `primary_image`.

#### `POST /api/products/`
Create a product (admin only).

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
Retrieve a single product.

#### `PUT /api/products/{id}/` / `PATCH /api/products/{id}/`
Update a product (admin only).

#### `DELETE /api/products/{id}/`
Delete a product (admin only).

#### `POST /api/products/{id}/upload-images/`
Upload images for a product. Accepts `multipart/form-data` with a list of image files under the key `images`. Optionally pass `primary_image` (an existing image ID) to set the primary.

#### `POST /api/products/{id}/set-primary-image/`
Set a product's primary image.

**Request:** `{ "image_id": 3 }`

#### `DELETE /api/products/{id}/delete-image/`
Delete a specific image from a product.

**Request:** `{ "image_id": 3 }`

---

### Orders

> Previously `/api/transactions/`. Now `/api/orders/`.

#### `GET /api/orders/`
List all orders. Supports search via `?search=` (matches name, email, or tracking code).

#### `POST /api/orders/`
Place a new order. Accepts customer details and a list of cart items. Automatically generates a tracking code and sends a confirmation email.

**Request:**
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "location": "Customer Address",
  "phone": "08012345678",
  "total_amount": "25.99",
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
  "tracking_code": "MS-2025-A3BX9K2Z",
  "name": "Customer Name",
  "email": "customer@example.com",
  "location": "Customer Address",
  "phone": "08012345678",
  "total_amount": "25.99",
  "status": "pending",
  "created_at": "2025-01-20T12:00:00Z",
  "payment_proof": null,
  "items": [
    { "id": 1, "product_name": "Item A", "price": "10.00", "quantity": 2, "subtotal": "20.00" },
    { "id": 2, "product_name": "Item B", "price": "5.99", "quantity": 1, "subtotal": "5.99" }
  ],
  "status_history": [
    { "id": 1, "status": "pending", "note": "Order placed.", "created_at": "2025-01-20T12:00:00Z" }
  ]
}
```

#### `GET /api/orders/{id}/`
Retrieve a specific order by database ID (admin use).

#### `PATCH /api/orders/{id}/`
Update an order's status (admin only). Optionally pass `status_note` to annotate the change in status history.

**Request:** `{ "status": "shipped", "status_note": "Dispatched via DHL" }`

---

### Order Tracking

#### `GET /api/orders/track/?tracking_code=MS-2025-A3BX9K2Z`
Look up an order by tracking code. Returns the full order including items and status history.

---

### Payment Proof Upload

#### `POST /api/orders/upload-proof/`
Upload payment proof for an order.

**Request:** `multipart/form-data`
```
tracking_code: MS-2025-A3BX9K2Z
payment_proof: <file>   (jpg, jpeg, png, or pdf — max 10MB)
```

**Response:**
```json
{ "message": "Payment proof uploaded successfully." }
```

On success, the order status automatically moves to `payment_uploaded` and the change is logged in status history.

---

### Bank Details

#### `GET /api/bank-details/`
Retrieve bank account details for payment.

**Response:**
```json
{
  "id": 1,
  "bank_name": "Example Bank",
  "account_name": "Store Account",
  "account_number": "1234567890"
}
```

---

### Admin Verification

#### `POST /api/verify-admin/`
Verify an admin token. Tokens are created via the Django admin and shown exactly once.

**Request:** `{ "token": "raw_token_here" }`

**Response:** `{ "valid": true }` or `{ "valid": false, "message": "Token expired or revoked" }`

---

### Site Settings

#### `GET /api/site-settings/`
Retrieve current site settings (title, tag, contact info, theme color).

#### `PUT /api/site-settings/` / `PATCH /api/site-settings/`
Update site settings (admin only).

---

## Order Status Flow

```
pending → payment_uploaded → payment_confirmed → processing → shipped → delivered
                                                                       ↘ cancelled (any stage)
```

Every status transition is logged automatically in `status_history`.

---

## Error Handling

The API uses standard HTTP status codes. Errors return a JSON body with an `error` key.

```json
{ "error": "No order found with that tracking code." }
```

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Invalid or expired token |
| 404 | Resource not found |
| 500 | Server error |


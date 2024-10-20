# API Documentation for Mini Store Backend

## Introduction

This document outlines the API endpoints for the Mini Store backend, including recent upgrades to the system workflow.

### Workflow Evolution

#### Former Workflow:
1. Users selected products and added them to the cart (frontend functionality).
2. Users filled in their contact information during checkout.
3. Users were informed that the vendor had seen their order and was awaiting payment.
4. Users made a bank transfer to the displayed bank details.
5. The site owner manually managed products and transactions/orders through an admin dashboard.

#### Current Workflow:
1. Users select products and add them to the cart (frontend functionality).
2. Users fill in their contact information during checkout.
3. The system automatically generates a tracking number for the order and emails it to the user.
4. Users make a bank transfer and can upload proof of payment using their tracking number.
5. Users can track their order status using the tracking number.
6. The site owner can manage products, view and update order statuses, and confirm payments through the admin dashboard.

## API Endpoints

### 1. Products

#### GET /api/products/
Retrieve a list of all products.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Product Name",
    "category": "Category",
    "description": "Product description",
    "price": "10.99",
    "image": "http://example.com/media/products/image.jpg",
    "quantity": 100
  },
  ...
]
```

#### POST /api/products/
Create a new product (Admin only).

**Request:**
```json
{
  "name": "New Product",
  "category": "New Category",
  "description": "Product description",
  "price": "15.99",
  "image": <image_file>,
  "quantity": 50
}
```

**Response:**
```json
{
  "id": 2,
  "name": "New Product",
  "category": "New Category",
  "description": "Product description",
  "price": "15.99",
  "image": "http://example.com/media/products/new_image.jpg",
  "quantity": 50
}
```

#### GET /api/products/{id}/
Retrieve a specific product.

**Response:**
```json
{
  "id": 1,
  "name": "Product Name",
  "category": "Category",
  "description": "Product description",
  "price": "10.99",
  "image": "http://example.com/media/products/image.jpg",
  "quantity": 100
}
```

#### PUT /api/products/{id}/
Update a specific product (Admin only).

#### DELETE /api/products/{id}/
Delete a specific product (Admin only).

### 2. Transactions

#### GET /api/transactions/
Retrieve a list of all transactions (Admin only).

**Response:**
```json
[
  {
    "id": 1,
    "tracking_number": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Customer Name",
    "email": "customer@example.com",
    "location": "Customer Address",
    "phone": "1234567890",
    "total_amount": "25.99",
    "products": "Product 1, Product 2",
    "status": "pending",
    "created_at": "2023-04-20T12:00:00Z",
    "payment_proof": null
  },
  ...
]
```

#### POST /api/transactions/
Create a new transaction (order).

**Request:**
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "location": "Customer Address",
  "phone": "1234567890",
  "total_amount": "25.99",
  "products": "Product 1, Product 2"
}
```

**Response:**
```json
{
  "id": 2,
  "tracking_number": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Customer Name",
  "email": "customer@example.com",
  "location": "Customer Address",
  "phone": "1234567890",
  "total_amount": "25.99",
  "products": "Product 1, Product 2",
  "status": "pending",
  "created_at": "2023-04-20T13:00:00Z",
  "payment_proof": null
}
```

#### GET /api/transactions/{id}/
Retrieve a specific transaction (Admin only).

#### PATCH /api/transactions/{id}/
Update a specific transaction (Admin only).

### 3. Bank Details

#### GET /api/bank-details/
Retrieve bank details for payment.

**Response:**
```json
{
  "id": 1,
  "bank_name": "Example Bank",
  "account_name": "Store Account",
  "account_number": "1234567890"
}
```

### 4. Admin Verification

#### POST /api/verify-admin/
Verify admin token.

**Request:**
```json
{
  "token": "admin_token_here"
}
```

**Response:**
```json
{
  "valid": true
}
```

### 5. Upload Payment Proof

#### POST /api/upload-payment-proof/
Upload payment proof for a transaction.

**Request:**
```
Content-Type: multipart/form-data

tracking_number: 550e8400-e29b-41d4-a716-446655440000
payment_proof: <file>
```

**Response:**
```json
{
  "message": "Payment proof uploaded successfully"
}
```

### 6. Track Order

#### GET /api/track-order/?tracking_number=550e8400-e29b-41d4-a716-446655440000
Track an order using the tracking number.

**Response:**
```json
{
  "id": 1,
  "tracking_number": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Customer Name",
  "email": "customer@example.com",
  "location": "Customer Address",
  "phone": "1234567890",
  "total_amount": "25.99",
  "products": "Product 1, Product 2",
  "status": "payment_uploaded",
  "created_at": "2023-04-20T12:00:00Z",
  "payment_proof": "http://example.com/media/payment_proofs/proof.pdf"
}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests. In case of an error, the response will include a JSON object with an `error` key explaining the issue.

Example error response:

```json
{
  "error": "Invalid tracking number"
}
```

Common status codes:

- 200 OK: The request was successful.
- 201 Created: A new resource was successfully created.
- 400 Bad Request: The request was invalid or cannot be served.
- 401 Unauthorized: Authentication failed or user doesn't have permissions for the requested operation.
- 404 Not Found: The requested resource could not be found.
- 500 Internal Server Error: The server encountered an unexpected condition that prevented it from fulfilling the request.

To handle and display errors in a user-friendly way:

1. Check the status code of the response.
2. If it's not a success code (200-299), extract the error message from the response body.
3. Display the error message to the user in a clear and concise manner, such as in a toast notification or an alert box.

Example JavaScript code for handling errors:

```javascript
fetch('/api/endpoint')
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw err; });
    }
    return response.json();
  })
  .then(data => {
    // Handle successful response
  })
  .catch(error => {
    // Display error to user
    showErrorNotification(error.error || 'An unexpected error occurred. Please try again.');
  });
```

This API documentation should provide developers with the necessary information to build a new frontend or update an existing one to work with this backend. It includes details on all available endpoints, request/response formats, and error handling guidelines.
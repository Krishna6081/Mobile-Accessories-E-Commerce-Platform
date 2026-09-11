# API Reference & Documentation
Base URL: `/api/v1`

### Standard Response Structure
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Endpoints Overview

#### 🔑 Authentication (`/api/v1/auth`)
- `POST /auth/register` - Customer registration
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - Verify mobile/email OTP
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate refresh token
- `POST /auth/forgot-password` - Request password reset OTP
- `POST /auth/reset-password` - Reset password with OTP

#### 🛍️ Products & Catalog (`/api/v1/products`)
- `GET /products` - List products with filter, search, sort, pagination
- `GET /products/:slug` - Product detail with variants & reviews
- `GET /categories` - List categories with hierarchy
- `GET /brands` - List brands
- `GET /search` - Search autosuggest

#### 🛒 Cart & Checkout (`/api/v1/cart`, `/api/v1/checkout`)
- `GET /cart` - Fetch customer cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:id` - Update quantity
- `DELETE /cart/items/:id` - Remove item
- `POST /checkout/validate` - Validate stock & coupon code
- `POST /checkout/place-order` - Transactional order creation
- `POST /checkout/verify-payment` - Razorpay HMAC verification

#### 📦 Customer Account & Orders (`/api/v1/orders`, `/api/v1/account`)
- `GET /orders` - Customer order history
- `GET /orders/:id` - Order detail & timeline
- `POST /orders/:id/cancel` - Cancel order before shipping
- `POST /orders/:id/return` - Request order return/replacement
- `GET /orders/:id/invoice` - Download PDF invoice

#### 📊 Admin & Analytics (`/api/v1/admin`)
- `GET /admin/dashboard/kpis` - Real KPI statistics
- `GET /admin/dashboard/charts` - Sales/order breakdown data
- `GET /admin/products` - Admin product management
- `POST /admin/products` - Create product & variants
- `PUT /admin/products/:id` - Update product
- `DELETE /admin/products/:id` - Delete product
- `GET /admin/orders` - Order administration
- `PUT /admin/orders/:id/status` - Update delivery status & tracking
- `GET /admin/inventory` - Inventory alerts & stock movement
- `GET /admin/reports/sales` - Exportable sales reports
- `GET /admin/reports/products` - Exportable product metrics
- `GET /admin/payment-credentials` - Super Admin payment configuration
- `POST /admin/payment-credentials` - Update encrypted Razorpay credentials
- `GET /admin/audit-logs` - View system audit logs

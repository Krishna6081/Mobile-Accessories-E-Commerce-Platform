# Role-Based Access Control (RBAC) System

### 1. Architectural Philosophy
Role-Based Access Control is enforced **server-side** at the middleware level on all protected API routes. Frontend UI elements dynamically adapt based on permissions received in JWT payloads, but backend handlers re-verify credentials and database permission links on every sensitive request.

### 2. Standard Roles

| Role Key | Level | Description |
|---|---|---|
| `SUPER_ADMIN` | Level 100 | Complete system ownership, payment gateway configuration, staff management, role management, system settings, audit logs access. |
| `ADMIN` | Level 80 | Full catalog CRUD, order administration, customer management, coupon creation, banners, CMS editing, sales reports. |
| `MANAGER` | Level 50 | Inventory management, order status updates, fulfillment processing, review moderation. |
| `CUSTOMER` | Level 10 | Storefront customer operations (browse, cart, wishlist, checkout, view personal orders & addresses). |

### 3. Permission Definitions

```
product.view, product.create, product.update, product.delete
category.view, category.create, category.update, category.delete
brand.view, brand.create, brand.update, brand.delete
order.view, order.update, order.cancel, order.refund
inventory.view, inventory.update
customer.view, customer.block
coupon.view, coupon.create, coupon.update, coupon.delete
banner.view, banner.create, banner.update, banner.delete
cms.view, cms.update
reports.view, reports.export
settings.view, settings.update
payment.manage (SUPER_ADMIN ONLY)
staff.manage (SUPER_ADMIN ONLY)
roles.manage (SUPER_ADMIN ONLY)
audit.view (SUPER_ADMIN ONLY)
```

### 4. Middleware Flow

```
[ Request ]
    │
    ▼
[ authenticate() ] ── (Verifies JWT access token & attaches user context)
    │
    ▼
[ requirePermission("product.create") ] ── (Checks user role permissions in DB/Cache)
    │
    ├─ Authorized ──► [ Controller Handler ]
    └─ Unauthorized ─► [ 403 Forbidden Response ]
```

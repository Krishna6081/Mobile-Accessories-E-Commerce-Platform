# Data-Driven Role-Based Access Control (RBAC) System

### 1. Architectural Philosophy
Authorization in the Mobile Accessories E-Commerce Platform is strictly **data-driven** and enforced **server-side** via `authenticate()` and `requirePermission("module.action")` middlewares on all protected API routes. Controllers never hardcode role checks for general operations; instead, access is governed by granular database permissions assigned through `roles`, `permissions`, and `role_permissions` tables.

---

### 2. Primary User Classes & Hierarchy

```
GUEST (Unauthenticated visitor)
  ↓
CUSTOMER (Storefront Customer account)
  ↓
MANAGER / STAFF (Fulfillment & Inventory Operator)
  ↓
ADMIN (Operations & Storefront Manager)
  ↓
SUPER ADMIN (Master System Owner & Security Manager)
```

| User Class | Stored in DB | Description | Key Access Scope |
|---|---|---|---|
| `GUEST` | No | Visitor browsing storefront | Browse products, categories, search, view CMS |
| `CUSTOMER` | Yes | Storefront customer account | Cart, Wishlist, Checkout, Addresses, Personal Orders, Invoice, Profile, Password change |
| `MANAGER` / `STAFF` | Yes | Store fulfillment & stock operator | Operational dashboard, Product view/add/edit, Inventory stock updates, Order view & operational status updates |
| `ADMIN` | Yes | Full operational administrator | Catalog CRUD, Order management & refunds, Customer management & blocking, Marketing coupons/banners, Reviews moderation, CMS editing, Sales reports |
| `SUPER_ADMIN` | Yes | Master system administrator | All system access, Payment gateway credentials, Staff management, Custom role & permission matrix, System audit logs, Super Admin profile & ownership transfer |

---

### 3. Database Schema

- **`roles`**: `id`, `name` (unique), `description`, `isSystem`, `status` (`ACTIVE`/`BLOCKED`), `createdAt`, `updatedAt`
- **`permissions`**: `id`, `name` (unique, `module.action`), `module`, `description`, `createdAt`, `updatedAt`
- **`role_permissions`**: `id`, `roleId`, `permissionId` (unique `[roleId, permissionId]`)

---

### 4. Granular Permissions Index (`module.action`)

| Module | Action Permissions |
|---|---|
| **Dashboard** | `dashboard.view` |
| **Catalog** | `product.view`, `product.create`, `product.update`, `product.delete`, `category.view`, `category.create`, `category.update`, `category.delete`, `brand.view`, `brand.create`, `brand.update`, `brand.delete` |
| **Inventory** | `inventory.view`, `inventory.update` |
| **Orders** | `order.view`, `order.update`, `order.cancel`, `order.return`, `order.refund` |
| **Customers** | `customer.view`, `customer.update`, `customer.block` |
| **Marketing** | `coupon.view`, `coupon.create`, `coupon.update`, `coupon.delete`, `banner.view`, `banner.create`, `banner.update`, `banner.delete` |
| **Reviews** | `review.view`, `review.approve`, `review.reject`, `review.delete`, `review.reply` |
| **CMS** | `cms.view`, `cms.update` |
| **Reports** | `report.view`, `report.export` |
| **Settings** | `settings.view`, `settings.update` |
| **Security / Payment** | `payment.view`, `payment.update`, `audit.view`, `superadmin.manage` |
| **Staff & Roles** | `staff.view`, `staff.create`, `staff.update`, `staff.deactivate`, `role.view`, `role.create`, `role.update`, `role.delete` |

---

### 5. Access Control Matrix

| Module / Action | CUSTOMER | MANAGER | ADMIN | SUPER ADMIN |
|---|:---:|:---:|:---:|:---:|
| **Storefront & Personal Account** | ✓ | - | - | - |
| **Product & Inventory Operations** | - | ✓ (View/Create/Update) | ✓ | ✓ |
| **Order Status Update** | - | ✓ (Operational) | ✓ | ✓ |
| **Customer Blocking** | - | - | ✓ | ✓ |
| **Coupons, Banners & CMS** | - | - | ✓ | ✓ |
| **Sales & Product Analytics Reports** | - | ✓ (View) | ✓ | ✓ |
| **Staff Account Management** | - | - | - | ✓ |
| **Custom Roles & Permission Matrix** | - | - | - | ✓ |
| **Payment Gateway Configuration** | - | - | - | ✓ |
| **Audit Logs** | - | - | - | ✓ |
| **Super Admin Ownership Transfer** | - | - | - | ✓ |

---

### 6. Development Test Credentials

- **Super Admin**: `superadmin@example.com` / `SuperAdmin123!` (or `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`)
- **Admin**: `admin@example.com` / `Admin123!` (or `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- **Manager**: `manager@example.com` / `Manager123!` (or `MANAGER_EMAIL` / `MANAGER_PASSWORD`)
- **Customer**: `customer@example.com` / `Customer123!` (or `CUSTOMER_EMAIL` / `CUSTOMER_PASSWORD`)

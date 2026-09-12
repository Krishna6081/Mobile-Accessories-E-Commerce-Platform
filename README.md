# Mobile Accessories E-Commerce Platform

A production-ready, full-stack E-Commerce platform built for mobile accessories with **data-driven Role-Based Access Control (RBAC)** supporting 5 primary user classes: `GUEST`, `CUSTOMER`, `MANAGER / STAFF`, `ADMIN`, and `SUPER ADMIN`.

---

## 🌟 Key Features

- **5 Primary User Classes & Hierarchy**:
  - `GUEST`: Unauthenticated storefront visitor.
  - `CUSTOMER`: Account holder with cart, checkout, addresses, orders, and wishlist.
  - `MANAGER / STAFF`: Limited operational admin for order fulfillment and stock management.
  - `ADMIN`: Operational administrator for catalog, orders, customers, reviews, and CMS.
  - `SUPER ADMIN`: Master system owner with payment credentials, staff management, dynamic permission matrix, audit logs, and ownership transfer.
- **Data-Driven RBAC Engine**:
  - Authorization middleware checks granular `module.action` permissions (`product.view`, `order.update`, `staff.deactivate`, etc.).
  - Permission Matrix UI for creating custom roles dynamically.
- **Security & Protection**:
  - Super Admin ownership transfer with current password verification & audit log.
  - Sensitive contact change via 2-step OTP verification.
  - Encrypted payment credentials (AES-256-GCM) at rest.
  - Standardized 403 Access Denied page & frontend permission guards.

---

## 🛠️ Quick Start

```bash
# 1. Install all monorepo dependencies
npm run install:all

# 2. Database Generation & Seeding
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 3. Start Development Servers (Backend + Frontend)
npm run dev
```

---

## 🔑 Test Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `superadmin@example.com` | `SuperAdmin123!` |
| **Admin** | `admin@example.com` | `Admin123!` |
| **Manager** | `manager@example.com` | `Manager123!` |
| **Customer** | `customer@example.com` | `Customer123!` |

---

## 📚 Documentation Links

- [RBAC System Architecture](docs/RBAC.md)
- [API Protection & Endpoints](docs/API.md)
- [Database Schema & Models](docs/DATABASE.md)

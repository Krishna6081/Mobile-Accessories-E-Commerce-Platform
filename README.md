# Mobile Accessories E-Commerce Platform (`mobile-accessories-ecommerce`)

A modern, production-ready, full-stack E-Commerce platform for mobile accessories (Phone Cases, Chargers, Audio, Watch Straps, Power Banks, Mounts, Screen Protectors, Speakers) built with **React**, **Node.js**, **Express**, **MySQL**, and **Prisma ORM**.

---

## 🌟 Key Features

### 🛒 Customer Storefront
- **Modern Vortique-Inspired Design**: Sleek typography, micro-interactions, responsive grid, trust strip, hero slider.
- **Product Discovery**: Category & brand filters, price range slider, rating filters, live search auto-suggest, sorting.
- **Rich Product Detail**: Multi-image zoom gallery, device compatibility selector, stock indicators, delivery pincode checker, post-delivery verified reviews.
- **Cart & Wishlist**: Guest and logged-in carts, stock validation, promo code validation, quantity limits.
- **Checkout & Payments**: Multi-step checkout, Cash on Delivery (COD), integrated Razorpay payment gateway adapter (test/live modes).
- **Customer Account**: Profile management, saved addresses, order tracking with real-time timeline, downloadable invoices.

### 🛡️ Admin & Super Admin Panel
- **Analytics Dashboard**: Interactive KPI metrics, Recharts sales and order charts, real API integration.
- **Product & Inventory Management**: Multi-variant SKU support, image management, stock thresholds, transaction-safe inventory updates.
- **Data-Driven RBAC**: Fine-grained permissions (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `CUSTOMER`) enforced strictly server-side.
- **Encrypted Payment Settings**: Super Admin gated payment credential editor with AES-256-GCM encryption at rest, step-up password verification, credential history, and masked key displays (`••••••••1234`).
- **Audit Logs**: Detailed tracking of sensitive actions (logins, role changes, order status changes, credential updates).
- **CMS & Marketing**: Promotional banners, Hero carousels, dynamic CMS pages (About, Contact, Policies), coupon engine.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, Redux Toolkit, React Router v6, Tailwind CSS, Lucide React, Recharts, React Hook Form, Zod, React Hot Toast.
- **Backend**: Node.js, Express.js, Prisma ORM, MySQL 8, JWT (Access + Refresh tokens), bcrypt, Multer, Winston/Morgan, Helmet, CORS, Rate-Limiting.
- **Documentation**: Swagger/OpenAPI, SRS.md, API.md, DATABASE.md, RBAC.md.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- MySQL 8.0+

### 1. Database Setup
Ensure MySQL service is running and create a database named `mobile_accessories_db`:
```sql
CREATE DATABASE mobile_accessories_db;
```

### 2. Environment Variables Setup
Copy `.env.example` to `.env` in `Backend/`:
```bash
cp Backend/.env.example Backend/.env
```
Update `DATABASE_URL` in `Backend/.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/mobile_accessories_db"
JWT_ACCESS_SECRET="your-jwt-access-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"
ENCRYPTION_KEY="12345678901234567890123456789012"
```

### 3. Installation & Database Seeding
From the project root directory:
```bash
# Install dependencies
npm run install:all

# Generate Prisma Client & Run Migrations
npm run prisma:generate
npm run prisma:seed
```

### 4. Running Development Servers
```bash
# Start both Backend (Port 5000) and Frontend (Port 5173) concurrently
npm run dev
```

---

## 🔐 Default Admin Credentials (Development)

- **Super Admin Email**: `superadmin@accessories.com`
- **Super Admin Password**: `SuperAdmin123!`
- **Admin Email**: `admin@accessories.com`
- **Admin Password**: `Admin123!`
- **Customer Email**: `customer@example.com`
- **Customer Password**: `Customer123!`

---

## 📖 API Documentation & Specs
- **Swagger Documentation**: Available at `http://localhost:5000/api/v1/docs` when backend is running.
- **Architecture Docs**: Check the `docs/` folder for `SRS.md`, `API.md`, `DATABASE.md`, and `RBAC.md`.

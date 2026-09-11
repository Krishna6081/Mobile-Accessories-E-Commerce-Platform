# Software Requirements Specification (SRS)
## Mobile Accessories E-Commerce Platform

### 1. Introduction
The Mobile Accessories E-Commerce Platform is a enterprise-grade full-stack web application designed for selling mobile accessories including Phone Cases, Chargers, Cables, Audio Accessories, Power Banks, Mounts, Smart Watch Accessories, OTG Drives, Screen Protectors, and Speakers.

### 2. User Roles & Capabilities
1. **Guest**: Browse catalog, view product details, search, add to guest cart, check pincode delivery.
2. **Customer**: Authenticate, manage profile & addresses, wishlist, place orders (COD & Online Payment), track orders, cancel/return orders, submit reviews post-delivery.
3. **Manager**: Manage inventory, process customer orders, update delivery statuses, view products and coupons.
4. **Admin**: Perform full CRUD on catalog (products, categories, brands), manage customer accounts, coupons, promotional banners, reviews moderation, CMS pages, generate sales/inventory reports.
5. **Super Admin**: Exclusive access to payment gateway credential management (AES-256 encrypted), site & tax configuration, staff onboarding, custom role/permission assignment, full audit trail review, Super Admin ownership transfer.

### 3. Key Non-Functional Requirements
- **Security**: JWT authentication, bcrypt password hashing, AES-256-GCM encryption for payment gateway secrets, rate limiting, SQL injection protection via Prisma ORM parameterized queries, XSS sanitization.
- **Performance**: Pagination capped at 20 products per page (max 50), database indexing on key fields (`slug`, `SKU`, `user_id`, `status`), dynamic layout rendering.
- **Reliability**: Transactional order processing and inventory deduction to prevent negative stock and race conditions.

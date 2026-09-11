# Database Schema Documentation

### Schema Overview
The database uses **MySQL 8.0+** managed via **Prisma ORM**.

### Models & Entity Relationships

1. **User & Identity**:
   - `User`: Core user model storing customer and staff credentials, `role_id`, status (ACTIVE/BLOCKED).
   - `Address`: Multiple delivery addresses per user with default flags.
   - `RefreshToken`: Cryptographic token store for JWT rotation.
   - `OtpVerification`: Pending OTP tokens for email/phone verification.

2. **RBAC Control System**:
   - `Role`: System roles (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `CUSTOMER`).
   - `Permission`: Fine-grained actions (`product.create`, `order.update`, `payment.manage`, etc.).
   - `RolePermission`: Many-to-many lookup table linking roles and permissions.

3. **Catalog & Inventory**:
   - `Category`: Categories with parent-child subcategories support.
   - `Brand`: Accessory brand entities.
   - `Product`: Master product details, tags, status, search indexes.
   - `ProductVariant`: SKU, color, model compatibility, price, MRP, stock quantity.
   - `ProductImage`: Associated media files with sort order.

4. **Commerce & Orders**:
   - `Cart` & `CartItem`: Shopping cart state per user/session.
   - `Order` & `OrderItem`: Transactional order snapshot.
   - `OrderStatusHistory`: Audit trail of order status transitions (`PLACED` -> `SHIPPED` -> `DELIVERED`).
   - `Coupon` & `CouponUsage`: Promotional vouchers with global/product scopes.
   - `Review`: Delivered-order customer reviews & ratings.
   - `Wishlist`: Saved customer items.

5. **Security & Operations**:
   - `PaymentCredential`: Encrypted storage (AES-256) for payment secrets.
   - `PaymentCredentialHistory`: Audit history of credential changes.
   - `AuditLog`: System audit logging for security sensitive operations.
   - `Banner`: Managed Hero slides and promo banners.
   - `CmsPage`: Dynamic CMS content.
   - `Setting`: Global store and tax configurations.

# Database Schema & RBAC Architecture

The platform uses Prisma ORM with MySQL. Database security and access control are normalized into discrete role and permission relations.

---

## RBAC Relational Schema

```
[ User ] (n) ──► (1) [ Role ] (1) ──► (n) [ RolePermission ] (n) ◄── (1) [ Permission ]
```

### Models & Definitions

#### 1. `Role`
- `id` (`String`, UUID @id)
- `name` (`String`, @unique) - `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `CUSTOMER`, or custom names (e.g. `INVENTORY_MANAGER`)
- `description` (`String?`)
- `isSystem` (`Boolean`, default: `false`) - System roles cannot be deleted
- `status` (`AccountStatus`, default: `ACTIVE`) - `ACTIVE`, `BLOCKED`, `PENDING`
- `createdAt`, `updatedAt`

#### 2. `Permission`
- `id` (`String`, UUID @id)
- `name` (`String`, @unique) - e.g. `product.create`, `order.update`, `staff.deactivate`
- `module` (`String`) - `Dashboard`, `Catalog`, `Orders`, `Inventory`, `Customers`, `Marketing`, `Reviews`, `CMS`, `Reports`, `Security`, `Staff`
- `description` (`String?`)
- `createdAt`, `updatedAt`

#### 3. `RolePermission`
- `id` (`String`, UUID @id)
- `roleId` (`String`, FK to `Role.id`)
- `permissionId` (`String`, FK to `Permission.id`)
- `@@unique([roleId, permissionId])`

---

## Seed Command & Migration

Generate client and seed default roles, permissions, and test accounts:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

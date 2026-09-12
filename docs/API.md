# API Documentation & Protection Matrix

All administrative and customer endpoints are served under `/api/v1`. Access to protected resources requires JWT Authorization header (`Bearer <token>`).

---

## Admin & Staff Endpoints (`/api/v1/admin`)

| Endpoint | Method | Required Permission | Description |
|---|---|---|---|
| `/admin/dashboard/kpis` | GET | `dashboard.view` | Dashboard KPI metrics |
| `/admin/dashboard/charts` | GET | `dashboard.view` | 30-day sales & order analytics chart |
| `/admin/products` | GET | `product.view` | List products |
| `/admin/orders` | GET | `order.view` | List admin orders |
| `/admin/orders/:id/status` | PUT | `order.update` | Update order status and tracking details |
| `/admin/inventory` | GET | `inventory.view` | List inventory stock levels |
| `/admin/inventory/:id` | PUT | `inventory.update` | Adjust stock level for variant |
| `/admin/reports/sales` | GET | `report.view` | Sales analytics report |
| `/admin/reports/products` | GET | `report.view` | Product sales report |
| `/admin/reviews` | GET | `review.view` | List customer reviews for moderation |
| `/admin/reviews/:id` | PUT | `review.approve` | Moderate review |
| `/admin/customers` | GET | `customer.view` | List customer accounts |
| `/admin/customers/:id/block` | PUT | `customer.block` | Block or unblock customer |
| `/admin/staff` | GET | `staff.view` | List administrative staff members |
| `/admin/staff` | POST | `staff.create` | Onboard staff account (prohibits normal admin creating SUPER_ADMIN) |
| `/admin/staff/:id` | PUT | `staff.update` | Edit staff details |
| `/admin/staff/:id/status` | PUT | `staff.deactivate` | Activate or deactivate staff account |
| `/admin/roles` | GET | `role.view` | List system & custom roles with permission counts |
| `/admin/roles` | POST | `role.create` | Create custom role with permissions |
| `/admin/roles/:roleId` | PUT | `role.update` | Update custom role details |
| `/admin/roles/:roleId` | DELETE | `role.delete` | Delete custom role |
| `/admin/roles/:roleId/permissions` | PUT | `role.update` | Assign permissions array to role |
| `/admin/permissions` | GET | `role.view` | List all permissions grouped by module |
| `/admin/payment-credentials` | GET | `payment.view` | Masked payment credentials |
| `/admin/payment-credentials` | POST | `payment.update` | Step-up AES-256 payment credentials update |
| `/admin/audit-logs` | GET | `audit.view` | System audit logs |
| `/admin/super-admin/profile` | GET / PUT | `superadmin.manage` | Super Admin profile management |
| `/admin/super-admin/send-otp` | POST | `superadmin.manage` | Send verification OTP for sensitive contact change |
| `/admin/super-admin/verify-update` | PUT | `superadmin.manage` | Verify OTP & update email/mobile |
| `/admin/super-admin/transfer` | POST | `superadmin.manage` | Transfer Super Admin ownership |

---

## 403 Forbidden Response Specification

When an authenticated user attempts an operation without required permissions, the API responds with:

**HTTP Status**: `403 Forbidden`
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

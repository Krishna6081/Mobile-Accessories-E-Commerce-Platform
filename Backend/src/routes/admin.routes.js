const express = require('express');
const authenticate = require('../middlewares/auth');
const { requirePermission, requireRole } = require('../middlewares/rbac');

const AdminDashboardController = require('../controllers/admin/dashboard.controller');
const OrderController = require('../controllers/order.controller');
const InventoryController = require('../controllers/admin/inventory.controller');
const ReportsController = require('../controllers/admin/reports.controller');
const StaffController = require('../controllers/admin/staff.controller');
const SuperAdminController = require('../controllers/admin/superadmin.controller');
const CustomerAdminController = require('../controllers/admin/customer.controller');
const PaymentCredentialsController = require('../controllers/admin/payment.controller');
const AuditController = require('../controllers/admin/audit.controller');
const ReviewController = require('../controllers/review.controller');

const router = express.Router();

// Require authentication for all admin routes
router.use(authenticate);

// Dashboard APIs
router.get('/dashboard/kpis', requirePermission('dashboard.view'), AdminDashboardController.getKpis);
router.get('/dashboard/charts', requirePermission('dashboard.view'), AdminDashboardController.getSalesChart);

// Admin Orders
router.get('/orders', requirePermission('order.view'), OrderController.getAdminOrders);
router.put('/orders/:id/status', requirePermission('order.update'), OrderController.updateOrderStatus);

// Inventory Management
router.get('/inventory', requirePermission('inventory.view'), InventoryController.getInventory);
router.put('/inventory/:id', requirePermission('inventory.update'), InventoryController.updateStock);

// Reports Analytics
router.get('/reports/sales', requirePermission('report.view'), ReportsController.getSalesReport);
router.get('/reports/products', requirePermission('report.view'), ReportsController.getProductReport);

// Reviews Moderation
router.get('/reviews', requirePermission('review.view'), ReviewController.adminListReviews);
router.put('/reviews/:id', requirePermission('review.approve'), ReviewController.adminModerateReview);

// Staff Management
router.get('/staff', requirePermission('staff.view'), StaffController.listStaff);
router.post('/staff', requirePermission('staff.create'), StaffController.createStaff);
router.put('/staff/:id', requirePermission('staff.update'), StaffController.updateStaff);
router.put('/staff/:id/status', requirePermission('staff.deactivate'), StaffController.toggleStaffStatus);

// Roles & Dynamic Permission Matrix
router.get('/roles', requirePermission('role.view'), StaffController.listRoles);
router.post('/roles', requirePermission('role.create'), StaffController.createRole);
router.put('/roles/:roleId', requirePermission('role.update'), StaffController.updateRole);
router.delete('/roles/:roleId', requirePermission('role.delete'), StaffController.deleteRole);
router.put('/roles/:roleId/permissions', requirePermission('role.update'), StaffController.updateRolePermissions);
router.get('/permissions', requirePermission('role.view'), StaffController.listPermissions);

// Customer Management
router.get('/customers', requirePermission('customer.view'), CustomerAdminController.listCustomers);
router.get('/customers/:id', requirePermission('customer.view'), CustomerAdminController.getCustomerById);
router.put('/customers/:id', requirePermission('customer.update'), CustomerAdminController.updateCustomer);
router.put('/customers/:id/block', requirePermission('customer.block'), CustomerAdminController.toggleBlockCustomer);

// Payment Gateway Security Credentials
router.get('/payment-credentials', requirePermission('payment.view'), PaymentCredentialsController.getCredentialsMasked);
router.post('/payment-credentials', requirePermission('payment.update'), PaymentCredentialsController.updateCredentials);
router.get('/payment-credentials/history', requirePermission('payment.view'), PaymentCredentialsController.getCredentialHistory);

// Audit Logs
router.get('/audit-logs', requirePermission('audit.view'), AuditController.getAuditLogs);

// Super Admin Profile, Sensitive OTP, and Ownership Transfer
router.get('/super-admin/profile', requirePermission('superadmin.manage'), SuperAdminController.getProfile);
router.put('/super-admin/profile', requirePermission('superadmin.manage'), SuperAdminController.updateProfile);
router.post('/super-admin/send-otp', requirePermission('superadmin.manage'), SuperAdminController.sendOtpForChange);
router.put('/super-admin/verify-update', requirePermission('superadmin.manage'), SuperAdminController.verifyAndUpdateContact);
router.post('/super-admin/transfer', requirePermission('superadmin.manage'), SuperAdminController.transferSuperAdmin);

module.exports = router;

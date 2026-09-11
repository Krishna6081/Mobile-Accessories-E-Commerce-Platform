const express = require('express');
const authenticate = require('../middlewares/auth');
const { requirePermission, requireRole } = require('../middlewares/rbac');

const AdminDashboardController = require('../controllers/admin/dashboard.controller');
const OrderController = require('../controllers/order.controller');
const InventoryController = require('../controllers/admin/inventory.controller');
const ReportsController = require('../controllers/admin/reports.controller');
const StaffController = require('../controllers/admin/staff.controller');
const PaymentCredentialsController = require('../controllers/admin/payment.controller');
const AuditController = require('../controllers/admin/audit.controller');
const ReviewController = require('../controllers/review.controller');

const router = express.Router();

// Require authentication for all admin routes
router.use(authenticate);

// Dashboard
router.get('/dashboard/kpis', requirePermission('reports.view'), AdminDashboardController.getKpis);
router.get('/dashboard/charts', requirePermission('reports.view'), AdminDashboardController.getSalesChart);

// Admin Orders
router.get('/orders', requirePermission('order.view'), OrderController.getAdminOrders);
router.put('/orders/:id/status', requirePermission('order.update'), OrderController.updateOrderStatus);

// Inventory
router.get('/inventory', requirePermission('inventory.view'), InventoryController.getInventory);
router.put('/inventory/:id', requirePermission('inventory.update'), InventoryController.updateStock);

// Reports
router.get('/reports/sales', requirePermission('reports.view'), ReportsController.getSalesReport);
router.get('/reports/products', requirePermission('reports.view'), ReportsController.getProductReport);

// Reviews Moderation
router.get('/reviews', requirePermission('product.update'), ReviewController.adminListReviews);
router.put('/reviews/:id', requirePermission('product.update'), ReviewController.adminModerateReview);

// Staff & Roles Management
router.get('/staff', requirePermission('staff.view'), StaffController.listStaff);
router.post('/staff', requireRole('SUPER_ADMIN'), StaffController.createStaff);
router.get('/roles', requirePermission('roles.view'), StaffController.listRoles);
router.put('/roles/:roleId/permissions', requireRole('SUPER_ADMIN'), StaffController.updateRolePermissions);

// Super Admin Encrypted Payment Gateway Configuration (SUPER_ADMIN ONLY)
router.get('/payment-credentials', requireRole('SUPER_ADMIN'), PaymentCredentialsController.getCredentialsMasked);
router.post('/payment-credentials', requireRole('SUPER_ADMIN'), PaymentCredentialsController.updateCredentials);
router.get('/payment-credentials/history', requireRole('SUPER_ADMIN'), PaymentCredentialsController.getCredentialHistory);

// System Audit Logs (SUPER_ADMIN ONLY)
router.get('/audit-logs', requireRole('SUPER_ADMIN'), AuditController.getAuditLogs);

module.exports = router;

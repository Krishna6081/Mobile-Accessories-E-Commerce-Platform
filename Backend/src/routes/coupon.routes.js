const express = require('express');
const CouponController = require('../controllers/coupon.controller');
const authenticate = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');

const router = express.Router();

router.post('/validate', CouponController.validateCoupon);

// Admin Routes
router.get('/', authenticate, requirePermission('coupon.view'), CouponController.getCoupons);
router.post('/', authenticate, requirePermission('coupon.create'), CouponController.createCoupon);
router.put('/:id', authenticate, requirePermission('coupon.update'), CouponController.updateCoupon);
router.delete('/:id', authenticate, requirePermission('coupon.delete'), CouponController.deleteCoupon);

module.exports = router;

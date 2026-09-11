const express = require('express');

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const brandRoutes = require('./brand.routes');
const cartRoutes = require('./cart.routes');
const checkoutRoutes = require('./checkout.routes');
const orderRoutes = require('./order.routes');
const reviewRoutes = require('./review.routes');
const wishlistRoutes = require('./wishlist.routes');
const couponRoutes = require('./coupon.routes');
const bannerRoutes = require('./banner.routes');
const cmsRoutes = require('./cms.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/coupons', couponRoutes);
router.use('/banners', bannerRoutes);
router.use('/cms', cmsRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

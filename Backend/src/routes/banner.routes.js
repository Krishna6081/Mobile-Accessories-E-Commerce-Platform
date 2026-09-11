const express = require('express');
const BannerController = require('../controllers/banner.controller');
const authenticate = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');

const router = express.Router();

router.get('/', BannerController.getBanners);

// Admin Banner CRUD
router.post('/', authenticate, requirePermission('banner.create'), BannerController.createBanner);
router.put('/:id', authenticate, requirePermission('banner.update'), BannerController.updateBanner);
router.delete('/:id', authenticate, requirePermission('banner.delete'), BannerController.deleteBanner);

module.exports = router;

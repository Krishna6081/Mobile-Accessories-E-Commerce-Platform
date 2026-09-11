const express = require('express');
const BrandController = require('../controllers/brand.controller');
const authenticate = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');

const router = express.Router();

router.get('/', BrandController.getBrands);
router.post('/', authenticate, requirePermission('brand.create'), BrandController.createBrand);
router.put('/:id', authenticate, requirePermission('brand.update'), BrandController.updateBrand);
router.delete('/:id', authenticate, requirePermission('brand.delete'), BrandController.deleteBrand);

module.exports = router;

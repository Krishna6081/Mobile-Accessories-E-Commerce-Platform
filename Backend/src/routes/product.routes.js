const express = require('express');
const ProductController = require('../controllers/product.controller');
const authenticate = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');

const router = express.Router();

router.get('/', ProductController.getProducts);
router.get('/search/suggest', ProductController.searchAutoSuggest);
router.get('/:slug', ProductController.getProductBySlug);

// Admin / Staff CRUD
router.post('/', authenticate, requirePermission('product.create'), ProductController.createProduct);
router.put('/:id', authenticate, requirePermission('product.update'), ProductController.updateProduct);
router.delete('/:id', authenticate, requirePermission('product.delete'), ProductController.deleteProduct);

module.exports = router;

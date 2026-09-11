const express = require('express');
const CategoryController = require('../controllers/category.controller');
const authenticate = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');

const router = express.Router();

router.get('/', CategoryController.getCategories);
router.post('/', authenticate, requirePermission('category.create'), CategoryController.createCategory);
router.put('/:id', authenticate, requirePermission('category.update'), CategoryController.updateCategory);
router.delete('/:id', authenticate, requirePermission('category.delete'), CategoryController.deleteCategory);

module.exports = router;

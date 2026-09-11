const express = require('express');
const CmsController = require('../controllers/cms.controller');
const authenticate = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/rbac');

const router = express.Router();

router.get('/:slug', CmsController.getCmsPage);
router.put('/:slug', authenticate, requirePermission('cms.update'), CmsController.updateCmsPage);

module.exports = router;

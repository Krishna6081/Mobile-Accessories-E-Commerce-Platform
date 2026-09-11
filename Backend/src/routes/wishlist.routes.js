const express = require('express');
const WishlistController = require('../controllers/wishlist.controller');
const authenticate = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', WishlistController.getWishlist);
router.post('/toggle', WishlistController.toggleWishlist);

module.exports = router;

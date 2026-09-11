const express = require('express');
const ReviewController = require('../controllers/review.controller');
const authenticate = require('../middlewares/auth');

const router = express.Router();

router.get('/product/:productId', ReviewController.getProductReviews);
router.post('/', authenticate, ReviewController.submitReview);

module.exports = router;

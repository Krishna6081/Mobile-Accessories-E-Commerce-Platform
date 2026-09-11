const express = require('express');
const CheckoutController = require('../controllers/checkout.controller');
const authenticate = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.post('/validate', CheckoutController.validateCheckout);
router.post('/place-order', CheckoutController.placeOrder);
router.post('/verify-payment', CheckoutController.verifyPayment);

module.exports = router;

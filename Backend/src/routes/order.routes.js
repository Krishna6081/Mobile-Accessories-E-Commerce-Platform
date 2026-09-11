const express = require('express');
const OrderController = require('../controllers/order.controller');
const authenticate = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', OrderController.getCustomerOrders);
router.get('/:id', OrderController.getOrderDetails);
router.post('/:id/cancel', OrderController.cancelOrder);
router.get('/:id/invoice', OrderController.downloadInvoice);

module.exports = router;

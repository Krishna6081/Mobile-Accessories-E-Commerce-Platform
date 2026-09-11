const express = require('express');
const CartController = require('../controllers/cart.controller');
const authenticate = require('../middlewares/auth');

const router = express.Router();

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, CartController.getCart);
router.post('/items', optionalAuth, CartController.addItem);
router.put('/items/:id', CartController.updateQuantity);
router.delete('/items/:id', CartController.removeItem);

module.exports = router;

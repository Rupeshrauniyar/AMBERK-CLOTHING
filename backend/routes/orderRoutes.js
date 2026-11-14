const express = require('express');
const router = express.Router();
const {
  getQuote,
  createOrder,
  getPublicOrder,
  trackOrder,
  lookupOrders,
  getMyOrders,
} = require('../controllers/orderController');
const { optionalAuth, protect } = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

const checkoutLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 15, standardHeaders: true, legacyHeaders: false });
const lookupLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

router.post('/quote', getQuote);
router.post('/checkout', checkoutLimiter, optionalAuth, createOrder);
router.post('/track', lookupLimiter, trackOrder);
router.post('/lookup', lookupLimiter, lookupOrders);
router.get('/mine', protect, getMyOrders);
router.get('/:orderNumber', lookupLimiter, optionalAuth, getPublicOrder);

module.exports = router;

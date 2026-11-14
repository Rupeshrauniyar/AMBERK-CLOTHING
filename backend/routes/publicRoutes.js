const express = require('express');
const router = express.Router();
const { getPublicSettings, getHomepagePayload } = require('../controllers/settingsController');
const { sendContact, subscribeNewsletter, getProductReviews, createProductReview } = require('../controllers/miscController');
const { optionalAuth } = require('../middlewares/auth');

router.get('/settings/public', getPublicSettings);
router.get('/homepage', getHomepagePayload);
router.post('/contact', sendContact);
router.post('/newsletter/subscribe', subscribeNewsletter);
router.get('/reviews/:productId', getProductReviews);
router.post('/reviews/:productId', optionalAuth, createProductReview);

module.exports = router;


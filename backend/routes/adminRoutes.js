const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { handleImageUpload } = require('../controllers/miscController');

// Controllers
const {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const {
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const {
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  addOrderNote,
} = require('../controllers/orderController');

const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

const {
  getAdminSettings,
  updateAdminSettings,
  getAdminHomepageSections,
  updateAdminHomepageSection,
} = require('../controllers/settingsController');

const {
  getDashboardSummary,
  getInventoryTable,
  adjustStock,
  getInventoryMovements,
  getCustomers,
  getContactMessages,
  updateContactMessageStatus,
  getNewsletterSubscribers,
  getAdminReviews,
  updateReviewStatus,
} = require('../controllers/adminController');

// Require authentication & admin role for all routes in this router
router.use(protect, restrictTo('admin', 'owner', 'staff'));

// Dashboard Overview
router.get('/dashboard', getDashboardSummary);

// Uploads
router.post('/upload', upload.single('image'), handleImageUpload);

// Products
router.get('/products', getAdminProducts);
router.get('/products/:id', getAdminProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Orders
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/notes', addOrderNote);

// Inventory
router.get('/inventory', getInventoryTable);
router.post('/inventory/adjust', adjustStock);
router.get('/inventory/movements', getInventoryMovements);

// Coupons
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Settings & Homepage
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);
router.get('/homepage/sections', getAdminHomepageSections);
router.put('/homepage/sections/:key', updateAdminHomepageSection);

// Customers & Communications
router.get('/customers', getCustomers);
router.get('/contacts', getContactMessages);
router.put('/contacts/:id', updateContactMessageStatus);
router.get('/subscribers', getNewsletterSubscribers);
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id', updateReviewStatus);

module.exports = router;


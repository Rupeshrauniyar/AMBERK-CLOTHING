const express = require('express');
const router = express.Router();
const { register, login, adminLogin, getMe, updateProfile, saveAddress, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/address', protect, saveAddress);
router.post('/logout', logout);

module.exports = router;


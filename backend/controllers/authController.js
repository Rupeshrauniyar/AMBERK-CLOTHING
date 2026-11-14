const User = require('../models/User');
const { sendTokenResponse } = require('../utils/jwt');
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

exports.register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: validatedData.email });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'An account with this email already exists.' },
      });
    }

    const user = await User.create({
      ...validatedData,
      role: 'customer',
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'This account has been deactivated.' },
      });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid admin credentials.' },
      });
    }

    if (!['admin', 'owner', 'staff'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied: Administrator privileges required.' },
      });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        addresses: user.addresses || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.saveAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const { fullName, phone, province, district, municipality, area, address, landmark, label, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({
      fullName,
      phone,
      province,
      district,
      municipality,
      area,
      address,
      landmark: landmark || '',
      label: label || 'Home',
      isDefault: isDefault ?? (user.addresses.length === 0),
    });

    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.cookie('amberk_token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
};


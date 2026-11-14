const ContactMessage = require('../models/ContactMessage');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const Review = require('../models/Review');
const upload = require('../middlewares/upload');
const { uploadImage } = require('../services/imageService');

exports.sendContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Name, email, and message are required.' },
      });
    }

    const contact = await ContactMessage.create({
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
    });

    res.status(201).json({
      success: true,
      data: { message: 'Your message has been received. Our team will contact you shortly!' },
    });
  } catch (error) {
    next(error);
  }
};

exports.subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_EMAIL', message: 'Email address is required.' },
      });
    }

    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(200).json({
        success: true,
        data: { message: 'You are already subscribed to our newsletter.' },
      });
    }

    await NewsletterSubscriber.create({
      email: email.toLowerCase().trim(),
    });

    res.status(201).json({
      success: true,
      data: { message: 'Thank you for subscribing to Amberk Clothing updates!' },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId, status: 'approved' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

exports.createProductReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, rating, title, comment } = req.body;

    const review = await Review.create({
      productId,
      userId: req.user ? req.user._id : null,
      name,
      rating: Number(rating),
      title: title || '',
      comment,
      status: 'approved',
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

exports.handleImageUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'No image file uploaded' },
      });
    }

    const imageAsset = await uploadImage(req.file.path, 'amberk_clothing');

    res.status(200).json({
      success: true,
      data: imageAsset,
    });
  } catch (error) {
    next(error);
  }
};


const mongoose = require('mongoose');
const { imageAssetSchema } = require('./Category');

const storeSettingsSchema = new mongoose.Schema(
  {
    store: {
      name: { type: String, default: 'Amberk Clothing' },
      tagline: { type: String, default: 'Wear Your Everyday Better.' },
      description: {
        type: String,
        default: 'Modern clothing and contemporary fashion e-commerce based in Biratnagar, Nepal.',
      },
      logo: { type: imageAssetSchema, default: null },
      favicon: { type: imageAssetSchema, default: null },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      address: {
        line: { type: String, default: '' },
        city: { type: String, default: 'Biratnagar' },
        district: { type: String, default: 'Morang' },
        province: { type: String, default: 'Koshi Province' },
        country: { type: String, default: 'Nepal' },
      },
      mapUrl: { type: String, default: '' },
      businessHours: { type: String, default: 'Sun - Fri: 10:00 AM - 8:00 PM' },
    },
    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    currency: { type: String, default: 'NPR' },
    timezone: { type: String, default: 'Asia/Kathmandu' },
    delivery: {
      enabled: { type: Boolean, default: true },
      zones: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          description: { type: String, default: '' },
          districts: [{ type: String }],
          municipalities: [{ type: String }],
          charge: { type: Number, default: 0 },
          freeDelivery: { type: Boolean, default: true },
          freeDeliveryMinimum: { type: Number, default: null },
          estimatedDays: { type: String, default: '1–2 days' },
          isActive: { type: Boolean, default: true },
        },
      ],
      allowOutsideZones: { type: Boolean, default: true },
      outsideZoneCharge: { type: Number, default: 150 },
      outsideZoneFreeMinimum: { type: Number, default: 2500 },
      outsideZoneEstimatedDays: { type: String, default: '3–5 days' },
      info: {
        type: String,
        default: 'Free home delivery across Biratnagar and Morang district. Nationwide shipping available at flat rate.',
      },
    },
    payments: {
      cod: {
        enabled: { type: Boolean, default: true },
        label: { type: String, default: 'Cash on Delivery (COD)' },
        instructions: { type: String, default: 'Pay with cash upon receipt of your parcel.' },
      },
      esewa: {
        enabled: { type: Boolean, default: false },
        label: { type: String, default: 'eSewa Mobile Wallet' },
        instructions: { type: String, default: 'Online payment via eSewa gateway.' },
      },
      khalti: {
        enabled: { type: Boolean, default: false },
        label: { type: String, default: 'Khalti Digital Wallet' },
        instructions: { type: String, default: 'Online payment via Khalti gateway.' },
      },
    },
    policies: {
      returnPolicySummary: {
        type: String,
        default: 'Hassle-free 7-day exchanges on unworn items with original tags intact.',
      },
      returnPolicy: {
        type: String,
        default:
          'We want you to love what you wear. If a product does not fit or meets any issue, you can request an exchange within 7 days of delivery. Items must be unworn, unwashed, and in original packaging with tags intact. Contact customer support via WhatsApp or email to initiate a return or exchange.',
      },
      shippingPolicy: {
        type: String,
        default:
          'Orders within Biratnagar metropolitan area are fulfilled within 24–48 hours. Nationwide deliveries take 3–5 business days depending on road and courier conditions. Delivery status can be tracked anytime using your order number and phone number.',
      },
      privacyPolicy: {
        type: String,
        default:
          'Amberk Clothing respects your privacy. We collect your name, phone number, and address strictly for shipping, customer service, and order verification. We never sell or share your personal data with third parties.',
      },
      terms: {
        type: String,
        default:
          'By placing an order on Amberk Clothing, you agree to our terms of service, payment policies, and delivery conditions. Prices are shown in Nepalese Rupees (NPR) inclusive of all applicable taxes.',
      },
    },
    seo: {
      siteUrl: { type: String, default: '' },
      defaultTitle: { type: String, default: 'Amberk Clothing | Premium Everyday Fashion' },
      titleTemplate: { type: String, default: '%s — Amberk Clothing' },
      defaultDescription: {
        type: String,
        default: 'Modern, high-quality clothing and contemporary essentials crafted for comfort and confidence. Biratnagar, Nepal.',
      },
      defaultOgImage: { type: String, default: null },
    },
    inventory: {
      lowStockThreshold: { type: Number, default: 5 },
    },
    notifications: {
      orderEmailTo: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);


/**
 * Idempotent content upgrade for an existing database:
 *  - adds the offer popup + about homepage sections if missing
 *  - removes placeholder contact details that were never verified business info
 *  - adds a percentage welcome coupon used by the default offer popup
 *
 * Usage: node scripts/upgrade-content.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db/db');
const HomepageSection = require('../models/HomepageSection');
const StoreSettings = require('../models/StoreSettings');
const Coupon = require('../models/Coupon');

const UNSPLASH = (id, w = 1400) => `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

const sections = [
  {
    key: 'offerPopup',
    order: 0,
    isEnabled: true,
    content: {
      eyebrow: 'Welcome to Amberk',
      heading: 'Take 10% off your first order',
      body: 'Fresh everyday styles, delivered to your door. Use the code below at checkout on orders over NPR 1,500.',
      couponCode: 'AMBERK10',
      ctaLabel: 'Shop the collection',
      ctaHref: '/shop',
      image: { url: UNSPLASH('photo-1515886657613-9f3515b0c78f', 900), publicId: 'popup', provider: 'external', alt: 'Amberk editorial' },
      delaySeconds: 6,
    },
  },
  {
    key: 'about',
    order: 20,
    isEnabled: true,
    content: {
      eyebrow: 'Our story',
      heading: 'More Than Clothing. A Way to Express Yourself.',
      intro:
        'Amberk Clothing was created with a simple idea: great style should be accessible, enjoyable, and easy to discover.',
      story:
        'Based in Biratnagar, Nepal, we bring together contemporary fashion, everyday essentials, and fresh trends with a focus on value and convenience.',
      philosophy: {
        heading: 'Considered, not complicated',
        body: 'We choose pieces you will reach for again and again — honest fabrics, easy fits and colours that work together.',
      },
      differentiators: [
        { title: 'Fresh every week', body: 'New styles land regularly so there is always something to discover.' },
        { title: 'Fair, honest pricing', body: 'Good clothing without the inflated mark-ups.' },
        { title: 'Easy from start to finish', body: 'Order in a minute, pay on delivery, and exchange if the size is not right.' },
      ],
      valueCommitment: {
        heading: 'Our commitment to value',
        body: 'Every piece is chosen to balance quality, comfort and price, so you never feel you overpaid for your everyday wardrobe.',
      },
      delivery: {
        heading: 'Delivered to your door',
        body: 'Shop from your phone and get your order delivered to your home, with free delivery in eligible areas.',
      },
      cta: { heading: 'Find your next favourite piece', label: 'Explore the collection', href: '/shop' },
      images: [
        { url: UNSPLASH('photo-1490481651871-ab68de25d43d'), publicId: 'about1', provider: 'external', alt: 'Amberk lookbook' },
        { url: UNSPLASH('photo-1483985988355-763728e1935b'), publicId: 'about2', provider: 'external', alt: 'Shopping at Amberk' },
      ],
    },
  },
];

(async () => {
  await connectDB();
  for (const s of sections) {
    const exists = await HomepageSection.findOne({ key: s.key });
    if (!exists) {
      await HomepageSection.create(s);
      console.log(`[upgrade] added section ${s.key}`);
    }
  }

  const settings = await StoreSettings.findOne();
  if (settings) {
    const fake = ['care@amberkclothing.com', 'hello@amberk.com', '+977 980-4050600', '+977 980-0000000', '9779804050600', '9779800000000'];
    let changed = false;
    ['email', 'phone', 'whatsapp'].forEach((k) => {
      if (fake.includes(settings.store[k])) {
        settings.store[k] = '';
        changed = true;
      }
    });
    if (/Main Road/.test(settings.store.address?.line || '')) {
      settings.store.address.line = '';
      changed = true;
    }
    ['facebook', 'instagram', 'tiktok'].forEach((k) => {
      if (/amberkclothing/.test(settings.social?.[k] || '')) {
        settings.social[k] = '';
        changed = true;
      }
    });
    if (/amberkclothing\.com/.test(settings.seo?.siteUrl || '')) {
      settings.seo.siteUrl = '';
      changed = true;
    }
    if (changed) {
      await settings.save();
      console.log('[upgrade] cleared unverified placeholder contact details');
    }
  }

  if (!(await Coupon.findOne({ code: 'AMBERK10' }))) {
    await Coupon.create({ code: 'AMBERK10', description: '10% off orders over NPR 1,500', type: 'percentage', value: 10, minOrderAmount: 1500, maxDiscount: 500 });
  }

  // Footer copy previously mentioned a non-verified claim; keep it neutral
  await HomepageSection.updateOne(
    { key: 'footer' },
    {
      $set: {
        'content.description':
          'Contemporary everyday fashion from Biratnagar, Nepal. Fresh styles, honest prices, delivered to your door.',
        'content.copyright': '© {year} Amberk Clothing. All rights reserved.',
      },
    }
  );

  // Best-seller ranking must reflect genuine orders: recompute salesCount from non-cancelled orders
  const Order = require('../models/Order');
  const Product = require('../models/Product');
  const sold = await Order.aggregate([
    { $match: { status: { $nin: ['cancelled', 'returned'] } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.productId', units: { $sum: '$items.quantity' } } },
  ]);
  await Product.updateMany({}, { $set: { salesCount: 0 } });
  for (const s of sold) await Product.updateOne({ _id: s._id }, { $set: { salesCount: s.units } });
  console.log(`[upgrade] recomputed sales counts from ${sold.length} sold products`);

  console.log('[upgrade] done');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

const StoreSettings = require('../models/StoreSettings');
const HomepageSection = require('../models/HomepageSection');
const { Category } = require('../models/Category');
const Product = require('../models/Product');
const { formatCards } = require('../services/catalogService');

const getSettingsDoc = async () => (await StoreSettings.findOne()) || StoreSettings.create({});

exports.getPublicSettings = async (req, res, next) => {
  try {
    const settings = await getSettingsDoc();
    const sections = await HomepageSection.find({ key: { $in: ['announcement', 'footer', 'offerPopup', 'about'] } });
    const byKey = Object.fromEntries(sections.map((s) => [s.key, s]));

    // Only COD is purchasable until an online gateway integration is verified server-side
    const paymentMethods = [];
    if (settings.payments?.cod?.enabled) {
      paymentMethods.push({ id: 'cod', label: settings.payments.cod.label, instructions: settings.payments.cod.instructions });
    }

    res.json({
      success: true,
      data: {
        store: settings.store,
        social: settings.social,
        currency: settings.currency,
        timezone: settings.timezone,
        delivery: settings.delivery,
        paymentMethods,
        policies: settings.policies,
        seo: settings.seo,
        announcement: byKey.announcement
          ? { ...byKey.announcement.content, isEnabled: byKey.announcement.isEnabled }
          : { messages: [], link: '', isEnabled: false },
        footer: byKey.footer?.content || { description: '', copyright: '© {year}', paymentInfo: '', deliveryInfo: '' },
        offerPopup: byKey.offerPopup ? { ...byKey.offerPopup.content, isEnabled: byKey.offerPopup.isEnabled } : { isEnabled: false },
        about: byKey.about?.content || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const populateCat = (q) => q.populate('category', 'name slug');

exports.getHomepagePayload = async (req, res, next) => {
  try {
    const sections = await HomepageSection.find({
      isEnabled: true,
      key: { $nin: ['announcement', 'footer', 'offerPopup', 'about'] },
    }).sort({ order: 1 });

    const out = [];
    for (const sec of sections) {
      const s = sec.toJSON();
      const c = sec.content || {};

      if (sec.key === 'featuredCategories') {
        const ids = c.categoryIds || [];
        s.categories = ids.length
          ? await Category.find({ _id: { $in: ids }, isActive: true })
          : await Category.find({ isActive: true, isFeatured: true }).sort({ displayOrder: 1 }).limit(8);
      }

      if (['newArrivals', 'bestSellers', 'featuredProducts'].includes(sec.key)) {
        const limit = Math.min(Number(c.limit) || 8, 16);
        const picks = c.productIds || [];
        let products = [];

        if (sec.key === 'newArrivals') {
          products = picks.length
            ? await populateCat(Product.find({ _id: { $in: picks }, status: 'published' }))
            : await populateCat(Product.find({ status: 'published' }).sort({ publishedAt: -1, createdAt: -1 }).limit(limit));
        } else if (sec.key === 'bestSellers') {
          // Manual picks + flagged bestsellers first, then genuine sales ranking (salesCount > 0 only)
          const manual = await populateCat(
            Product.find({ status: 'published', $or: [{ _id: { $in: picks } }, { bestSeller: true }] }).sort({ salesCount: -1 })
          );
          const ranked = await populateCat(
            Product.find({ status: 'published', salesCount: { $gt: 0 }, _id: { $nin: manual.map((m) => m._id) } })
              .sort({ salesCount: -1 })
              .limit(limit)
          );
          products = [...manual, ...ranked].slice(0, limit);
        } else {
          products = await populateCat(
            Product.find({ status: 'published', $or: [{ _id: { $in: picks } }, { featured: true }] }).limit(limit)
          );
        }
        s.products = await formatCards(products);
        if (!s.products.length) continue; // hide empty product sections
      }

      out.push(s);
    }

    res.json({ success: true, data: { sections: out } });
  } catch (error) {
    next(error);
  }
};

exports.getAdminSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAdminSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create(req.body);
    } else {
      settings = await StoreSettings.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};


exports.getAdminHomepageSections = async (req, res, next) => {
  try {
    const sections = await HomepageSection.find().sort({ order: 1 });
    res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAdminHomepageSection = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { isEnabled, order, content } = req.body;

    const section = await HomepageSection.findOneAndUpdate(
      { key },
      { isEnabled, order, content },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error) {
    next(error);
  }
};


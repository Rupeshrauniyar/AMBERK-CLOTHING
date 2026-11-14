const Product = require('../models/Product');
const { Category } = require('../models/Category');
const StoreSettings = require('../models/StoreSettings');
const { formatCards, formatProductCard, getRatingMap, toPlainOptions, escapeRegex } = require('../services/catalogService');

const csv = (v) =>
  String(v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);

const SORTS = {
  newest: { publishedAt: -1, createdAt: -1 },
  price_asc: { price: 1, createdAt: -1 },
  price_desc: { price: -1, createdAt: -1 },
  popular: { viewCount: -1, salesCount: -1 },
  best_selling: { salesCount: -1, viewCount: -1 },
};

/** Build a Mongo filter from storefront query params (all values sanitised to strings / numbers) */
const buildFilter = async (q) => {
  const filter = { status: 'published' };

  if (q.category) {
    const cat = await Category.findOne({ slug: String(q.category), isActive: true }).select('_id');
    if (!cat) return null;
    filter.category = cat._id;
  }

  if (q.q) {
    const rx = new RegExp(escapeRegex(String(q.q).slice(0, 80)), 'i');
    filter.$or = [{ name: rx }, { tags: rx }, { shortDescription: rx }];
  }

  const min = Number(q.minPrice);
  const max = Number(q.maxPrice);
  if (Number.isFinite(min) && min > 0) filter.price = { ...(filter.price || {}), $gte: min };
  if (Number.isFinite(max) && max > 0) filter.price = { ...(filter.price || {}), $lte: max };

  if (q.flag === 'new') filter.newArrival = true;
  if (q.flag === 'featured') filter.featured = true;
  if (q.flag === 'bestseller') filter.bestSeller = true;
  if (q.flag === 'sale') filter.$expr = { $gt: ['$compareAtPrice', '$price'] };

  // Variant-level filters combined in one $elemMatch so a matching variant satisfies all at once
  const elem = { isActive: true };
  const sizes = csv(q.sizes);
  const colors = csv(q.colors);
  if (sizes.length) elem['optionValues.Size'] = { $in: sizes };
  if (colors.length) elem['optionValues.Color'] = { $in: colors };
  if (q.availability === 'in_stock') elem.stock = { $gt: 0 };
  if (Object.keys(elem).length > 1) filter.variants = { $elemMatch: elem };

  return filter;
};

exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const filter = await buildFilter(req.query);
    const empty = { items: [], meta: { page, limit, total: 0, totalPages: 0 } };
    if (!filter) return res.json({ success: true, data: empty });

    const sort = SORTS[req.query.sort] || SORTS.newest;
    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      success: true,
      data: { items: await formatCards(products), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    next(error);
  }
};

/** Facets for the shop filter UI: sizes, colours (with swatches) and price range */
exports.getFilters = async (req, res, next) => {
  try {
    const base = { status: 'published' };
    if (req.query.category) {
      const cat = await Category.findOne({ slug: String(req.query.category) }).select('_id');
      if (cat) base.category = cat._id;
    }
    const products = await Product.find(base).select('price options variants');
    const sizes = new Set();
    const colors = new Map();
    let min = Infinity;
    let max = 0;

    products.forEach((p) => {
      min = Math.min(min, p.price);
      max = Math.max(max, p.price);
      (p.options || []).forEach((o) => {
        if (/^size$/i.test(o.name)) o.values.forEach((v) => sizes.add(v.value));
        if (/colou?r/i.test(o.name)) o.values.forEach((v) => colors.set(v.value, { value: v.value, swatch: v.swatch || '' }));
      });
    });

    const ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    const sortedSizes = [...sizes].sort((a, b) => {
      const ia = ORDER.indexOf(a);
      const ib = ORDER.indexOf(b);
      if (ia > -1 && ib > -1) return ia - ib;
      if (ia > -1) return -1;
      if (ib > -1) return 1;
      return String(a).localeCompare(String(b), undefined, { numeric: true });
    });

    res.json({
      success: true,
      data: {
        sizes: sortedSizes,
        colors: [...colors.values()],
        priceRange: { min: Number.isFinite(min) ? min : 0, max },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.searchSuggest = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 80);
    if (q.length < 2) return res.json({ success: true, data: { products: [], categories: [] } });
    const rx = new RegExp(escapeRegex(q), 'i');
    const [products, categories] = await Promise.all([
      Product.find({ status: 'published', $or: [{ name: rx }, { tags: rx }] })
        .populate('category', 'name slug')
        .sort({ salesCount: -1 })
        .limit(6),
      Category.find({ isActive: true, name: rx }).select('name slug').limit(4),
    ]);
    res.json({
      success: true,
      data: {
        products: await formatCards(products),
        categories: categories.map((c) => ({ id: c._id.toString(), name: c.name, slug: c.slug })),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductBySlug = async (req, res, next) => {
  try {
    const slug = String(req.params.slug).toLowerCase();
    const product = await Product.findOne({ slug, status: 'published' }).populate('category', 'name slug');

    if (!product) {
      const moved = await Product.findOne({ previousSlugs: slug, status: 'published' }).select('slug');
      if (moved) return res.json({ success: true, data: { redirectTo: moved.slug } });
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).catch(() => {});

    const ratingMap = await getRatingMap([product._id]);
    const card = formatProductCard(product, ratingMap);
    const settings = await StoreSettings.findOne().select('seo');
    const siteUrl = (settings?.seo?.siteUrl || process.env.FRONTEND_URL || '').replace(/\/$/, '');

    res.json({
      success: true,
      data: {
        ...card,
        images: product.images || [],
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        brand: product.brand,
        sku: product.sku,
        options: product.options || [],
        variants: (product.variants || []).map((v) => ({
          id: v._id.toString(),
          sku: v.sku,
          optionValues: toPlainOptions(v.optionValues),
          price: product.price + (v.priceAdjustment || 0),
          compareAtPrice: product.compareAtPrice ? product.compareAtPrice + (v.priceAdjustment || 0) : null,
          stock: v.stock,
          isActive: v.isActive,
        })),
        specifications: product.specifications || [],
        tags: product.tags || [],
        seo: {
          title: product.seo?.title || product.name,
          description: product.seo?.description || product.shortDescription,
          ogImage: product.seo?.ogImage || product.images?.[0]?.url || null,
        },
        publishedAt: product.publishedAt,
        url: `${siteUrl}/item/${product.slug}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getRelated = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: String(req.params.slug), status: 'published' }).select('category tags');
    if (!product) return res.json({ success: true, data: [] });
    let related = await Product.find({
      _id: { $ne: product._id },
      status: 'published',
      $or: [{ category: product.category }, { tags: { $in: product.tags || [] } }],
    })
      .populate('category', 'name slug')
      .sort({ salesCount: -1 })
      .limit(8);
    if (related.length < 4) {
      const more = await Product.find({ _id: { $nin: [product._id, ...related.map((r) => r._id)] }, status: 'published' })
        .populate('category', 'name slug')
        .sort({ publishedAt: -1 })
        .limit(8 - related.length);
      related = related.concat(more);
    }
    res.json({ success: true, data: await formatCards(related) });
  } catch (error) {
    next(error);
  }
};


const Review = require('../models/Review');

const toPlainOptions = (ov) => (ov instanceof Map ? Object.fromEntries(ov) : ov || {});

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Build a lookup of colour swatches from product options */
const swatchMap = (p) => {
  const map = {};
  (p.options || []).forEach((o) => {
    if (/colou?r/i.test(o.name)) {
      (o.values || []).forEach((v) => {
        map[v.value] = v.swatch || '';
      });
    }
  });
  return map;
};

/**
 * Storefront product card DTO. Ratings come from approved reviews only (via ratingMap),
 * never invented.
 */
const formatProductCard = (p, ratingMap = {}) => {
  const swatches = swatchMap(p);
  const sizes = [];
  const colors = new Map();
  let inStock = false;
  let minAdj = null;
  const activeVariants = (p.variants || []).filter((v) => v.isActive);

  activeVariants.forEach((v) => {
    if (v.stock > 0) inStock = true;
    const adj = v.priceAdjustment || 0;
    if (minAdj === null || adj < minAdj) minAdj = adj;
    const opts = toPlainOptions(v.optionValues);
    Object.entries(opts).forEach(([k, val]) => {
      if (/^size$/i.test(k) && !sizes.includes(val)) sizes.push(val);
      if (/colou?r/i.test(k) && !colors.has(val)) colors.set(val, { value: val, swatch: swatches[val] || '' });
    });
  });

  const price = p.price + (minAdj || 0);
  const compareAtPrice = p.compareAtPrice && p.compareAtPrice + (minAdj || 0) > price ? p.compareAtPrice + (minAdj || 0) : null;
  const discountPercent = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
  const rating = ratingMap[p._id.toString()] || { avg: 0, count: 0 };

  return {
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    category: p.category && p.category.name
      ? { id: p.category._id.toString(), name: p.category.name, slug: p.category.slug }
      : null,
    images: (p.images || []).slice(0, 2),
    price,
    compareAtPrice,
    discountPercent,
    newArrival: !!p.newArrival,
    featured: !!p.featured,
    bestSeller: !!p.bestSeller,
    inStock,
    colors: Array.from(colors.values()),
    sizes,
    ratingAvg: rating.avg,
    ratingCount: rating.count,
    defaultVariantId: activeVariants.length === 1 ? activeVariants[0]._id.toString() : null,
  };
};

/** Aggregate approved review ratings for a set of product ids */
const getRatingMap = async (productIds) => {
  if (!productIds.length) return {};
  const rows = await Review.aggregate([
    { $match: { productId: { $in: productIds }, status: 'approved' } },
    { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const map = {};
  rows.forEach((r) => {
    map[r._id.toString()] = { avg: Math.round(r.avg * 10) / 10, count: r.count };
  });
  return map;
};

const formatCards = async (products) => {
  const ratingMap = await getRatingMap(products.map((p) => p._id));
  return products.map((p) => formatProductCard(p, ratingMap));
};

module.exports = { formatProductCard, formatCards, getRatingMap, toPlainOptions, escapeRegex };


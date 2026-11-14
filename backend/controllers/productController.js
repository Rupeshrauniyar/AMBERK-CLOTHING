const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');
const slugify = require('slugify');

exports.getAdminProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q, category, status } = req.query;
    const query = {};

    if (q) {
      query.$or = [{ name: { $regex: q, $options: 'i' } }, { sku: { $regex: q, $options: 'i' } }];
    }
    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const items = products.map((p) => {
      const totalStock = (p.variants || []).reduce((acc, v) => acc + (v.stock || 0), 0);
      return {
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        image: p.images && p.images.length > 0 ? p.images[0] : null,
        category: p.category ? { id: p.category._id.toString(), name: p.category.name, slug: p.category.slug } : null,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        status: p.status,
        totalStock,
        variantCount: (p.variants || []).length,
        salesCount: p.salesCount || 0,
        featured: p.featured,
        bestSeller: p.bestSeller,
        newArrival: p.newArrival,
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    res.status(200).json({
      success: true,
      data: {
        items,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    const totalStock = (product.variants || []).reduce((acc, v) => acc + (v.stock || 0), 0);
    const adminVariants = (product.variants || []).map((v) => ({
      id: v._id.toString(),
      sku: v.sku,
      optionValues: v.optionValues instanceof Map ? Object.fromEntries(v.optionValues) : v.optionValues || {},
      priceAdjustment: v.priceAdjustment,
      stock: v.stock,
      isActive: v.isActive,
      position: v.position,
    }));

    res.status(200).json({
      success: true,
      data: {
        id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        previousSlugs: product.previousSlugs || [],
        shortDescription: product.shortDescription,
        description: product.description,
        category: product.category
          ? { id: product.category._id.toString(), name: product.category.name, slug: product.category.slug }
          : null,
        brand: product.brand,
        images: product.images || [],
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        sku: product.sku,
        options: product.options || [],
        variants: adminVariants,
        specifications: product.specifications || [],
        tags: product.tags || [],
        featured: product.featured,
        bestSeller: product.bestSeller,
        newArrival: product.newArrival,
        status: product.status,
        seo: product.seo,
        totalStock,
        salesCount: product.salesCount,
        viewCount: product.viewCount,
        publishedAt: product.publishedAt,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        url: `${process.env.FRONTEND_URL || 'https://amberkclothing.com'}/item/${product.slug}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const data = req.body;
    let baseSlug = (data.slug || slugify(data.name, { lower: true, strict: true })).toLowerCase();

    // Ensure slug uniqueness
    let slug = baseSlug;
    let count = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const baseSku = data.sku || `AMB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Prepare variants if provided or default
    let variants = data.variants || [];
    if (variants.length === 0) {
      variants = [
        {
          sku: `${baseSku}-DEF`,
          optionValues: {},
          priceAdjustment: 0,
          stock: 10,
          isActive: true,
          position: 0,
        },
      ];
    } else {
      variants = variants.map((v, i) => ({
        ...v,
        sku: v.sku || `${baseSku}-${i + 1}`,
      }));
    }

    const product = await Product.create({
      ...data,
      slug,
      sku: baseSku,
      variants,
      category: data.categoryId || null,
      publishedAt: data.status === 'published' ? new Date() : null,
    });

    // Record initial inventory movements
    for (const v of product.variants) {
      if (v.stock > 0) {
        await InventoryMovement.create({
          productId: product._id,
          productName: product.name,
          variantId: v._id.toString(),
          sku: v.sku,
          change: v.stock,
          quantityBefore: 0,
          quantityAfter: v.stock,
          reason: 'initial',
          note: 'Initial product creation stock',
          by: { id: req.user ? req.user._id.toString() : '', name: req.user ? req.user.name : 'Admin', kind: 'admin' },
        });
      }
    }

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Product.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    const data = req.body;
    const updates = { ...data };

    if (data.categoryId !== undefined) {
      updates.category = data.categoryId || null;
    }

    // Slug management: preserve previous slug as alias if changed
    if (data.slug && data.slug.toLowerCase().trim() !== existing.slug) {
      const newSlug = data.slug.toLowerCase().trim();
      const slugExists = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
      if (slugExists) {
        return res.status(409).json({
          success: false,
          error: { code: 'SLUG_TAKEN', message: 'The specified URL slug is already in use.' },
        });
      }
      updates.previousSlugs = [...(existing.previousSlugs || []), existing.slug];
      updates.slug = newSlug;
    }

    // Status transition tracking
    if (data.status === 'published' && existing.status !== 'published') {
      updates.publishedAt = new Date();
    }

    // Inventory adjustments audit
    if (data.variants && Array.isArray(data.variants)) {
      const existingVariantsMap = new Map(existing.variants.map((v) => [v._id.toString(), v]));
      for (const v of data.variants) {
        if (v.id && existingVariantsMap.has(v.id)) {
          const oldVar = existingVariantsMap.get(v.id);
          const diff = Number(v.stock) - oldVar.stock;
          if (diff !== 0) {
            await InventoryMovement.create({
              productId: existing._id,
              productName: existing.name,
              variantId: oldVar._id.toString(),
              sku: oldVar.sku,
              change: diff,
              quantityBefore: oldVar.stock,
              quantityAfter: Number(v.stock),
              reason: 'adjustment',
              note: 'Stock manual update via product editor',
              by: { id: req.user._id.toString(), name: req.user.name, kind: 'admin' },
            });
          }
        }
      }
    }

    const updated = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    res.status(200).json({
      success: true,
      data: { message: 'Product deleted permanently.' },
    });
  } catch (error) {
    next(error);
  }
};


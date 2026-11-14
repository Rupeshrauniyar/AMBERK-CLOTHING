const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const InventoryMovement = require('../models/InventoryMovement');
const ContactMessage = require('../models/ContactMessage');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const Review = require('../models/Review');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    // Order aggregate for revenue and counts
    const orders = await Order.find({ createdAt: { $gte: fromDate } });
    const allOrdersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const publishedProductsCount = await Product.countDocuments({ status: 'published' });
    const customersCount = await User.countDocuments({ role: 'customer' });

    let revenue = 0;
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      packed: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };

    const allOrders = await Order.find();
    allOrders.forEach((o) => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
      if (!['cancelled', 'returned'].includes(o.status)) {
        revenue += o.total;
      }
    });

    const averageOrderValue = allOrdersCount > 0 ? Math.round(revenue / allOrdersCount) : 0;

    // Daily Sales Trends
    const salesTrendMap = new Map();
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split('T')[0];
      salesTrendMap.set(key, { date: key, revenue: 0, orders: 0 });
    }

    orders.forEach((o) => {
      const key = o.createdAt.toISOString().split('T')[0];
      if (salesTrendMap.has(key)) {
        const item = salesTrendMap.get(key);
        item.orders++;
        if (!['cancelled', 'returned'].includes(o.status)) {
          item.revenue += o.total;
        }
      }
    });

    const salesTrend = Array.from(salesTrendMap.values());

    // Low stock products query
    const productsWithVariants = await Product.find({ status: { $ne: 'archived' } });
    const lowStock = [];
    productsWithVariants.forEach((p) => {
      (p.variants || []).forEach((v) => {
        if (v.isActive && v.stock <= 5) {
          lowStock.push({
            variantId: v._id.toString(),
            productId: p._id.toString(),
            productName: p.name,
            productSlug: p.slug,
            productStatus: p.status,
            image: p.images && p.images.length > 0 ? p.images[0] : null,
            sku: v.sku,
            optionValues: v.optionValues instanceof Map ? Object.fromEntries(v.optionValues) : v.optionValues || {},
            stock: v.stock,
            isActive: v.isActive,
            lowStockThreshold: 5,
            stockStatus: v.stock === 0 ? 'out' : 'low',
          });
        }
      });
    });

    // Recent 8 orders
    const recentOrdersRaw = await Order.find().sort({ createdAt: -1 }).limit(8);
    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      createdAt: o.createdAt.toISOString(),
      customer: o.customer,
      itemCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      itemsPreview: o.items.map((i) => `${i.name} ×${i.quantity}`).join(', '),
      total: o.total,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      district: o.shippingAddress.district,
    }));

    // Top products by sales count
    const topProductsRaw = await Product.find({ status: 'published' }).sort({ salesCount: -1 }).limit(5);
    const topProducts = topProductsRaw.map((p) => ({
      productId: p._id.toString(),
      name: p.name,
      slug: p.slug,
      image: p.images && p.images.length > 0 ? p.images[0] : null,
      unitsSold: p.salesCount || 0,
      revenue: (p.salesCount || 0) * p.price,
    }));

    res.status(200).json({
      success: true,
      data: {
        range: { from: fromDate.toISOString(), to: new Date().toISOString(), days },
        totals: {
          revenue,
          orders: allOrdersCount,
          products: productsCount,
          publishedProducts: publishedProductsCount,
          customers: customersCount,
          averageOrderValue,
        },
        statusCounts,
        lowStock: lowStock.slice(0, 10),
        recentOrders,
        topProducts,
        salesTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getInventoryTable = async (req, res, next) => {
  try {
    const products = await Product.find({ status: { $ne: 'archived' } }).sort({ name: 1 });
    const inventoryRows = [];

    products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        inventoryRows.push({
          variantId: v._id.toString(),
          productId: p._id.toString(),
          productName: p.name,
          productSlug: p.slug,
          productStatus: p.status,
          image: p.images && p.images.length > 0 ? p.images[0] : null,
          sku: v.sku,
          optionValues: v.optionValues instanceof Map ? Object.fromEntries(v.optionValues) : v.optionValues || {},
          stock: v.stock,
          isActive: v.isActive,
          lowStockThreshold: 5,
          stockStatus: v.stock === 0 ? 'out' : v.stock <= 5 ? 'low' : 'in_stock',
        });
      });
    });

    res.status(200).json({
      success: true,
      data: inventoryRows,
    });
  } catch (error) {
    next(error);
  }
};

exports.adjustStock = async (req, res, next) => {
  try {
    const { variantId, change, reason, note } = req.body;
    const numChange = Number(change);

    const product = await Product.findOne({ 'variants._id': variantId });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Variant not found' },
      });
    }

    const variant = product.variants.id(variantId);
    const before = variant.stock;
    const after = Math.max(0, before + numChange);
    variant.stock = after;
    await product.save();

    await InventoryMovement.create({
      productId: product._id,
      productName: product.name,
      variantId,
      sku: variant.sku,
      change: numChange,
      quantityBefore: before,
      quantityAfter: after,
      reason: reason || 'adjustment',
      note: note || 'Manual admin inventory adjustment',
      by: { id: req.user._id.toString(), name: req.user.name, kind: 'admin' },
    });

    res.status(200).json({
      success: true,
      data: { variantId, stock: after },
    });
  } catch (error) {
    next(error);
  }
};

exports.getInventoryMovements = async (req, res, next) => {
  try {
    const movements = await InventoryMovement.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({
      success: true,
      data: movements,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });

    const customers = [];
    for (const u of users) {
      const orders = await Order.find({ userId: u._id });
      const totalSpent = orders.reduce((sum, o) => (!['cancelled', 'returned'].includes(o.status) ? sum + o.total : sum), 0);
      const lastOrder = orders.sort((a, b) => b.createdAt - a.createdAt)[0];

      customers.push({
        id: u._id.toString(),
        type: 'registered',
        name: u.name,
        email: u.email,
        phone: u.phone,
        orderCount: orders.length,
        totalSpent,
        lastOrderAt: lastOrder ? lastOrder.createdAt.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

exports.getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateContactMessageStatus = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.status(200).json({ success: true, data: msg });
  } catch (error) {
    next(error);
  }
};

exports.getNewsletterSubscribers = async (req, res, next) => {
  try {
    const subs = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: subs });
  } catch (error) {
    next(error);
  }
};

exports.getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().populate('productId', 'name slug').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

exports.updateReviewStatus = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};


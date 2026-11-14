const { calculateQuote } = require('../services/quoteService');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const InventoryMovement = require('../models/InventoryMovement');
const StoreSettings = require('../models/StoreSettings');
const { provinceOf } = require('../utils/nepal');
const { nanoid } = require('nanoid');

const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid item');
const itemsSchema = z
  .array(z.object({ variantId: objectId, quantity: z.coerce.number().int().min(1).max(20) }))
  .min(1, 'Your bag is empty')
  .max(30);

const quoteSchema = z.object({
  items: itemsSchema,
  couponCode: z.string().trim().max(40).optional().nullable(),
  district: z.string().trim().max(60).optional().nullable(),
  municipality: z.string().trim().max(80).optional().nullable(),
});

const nepalPhone = z
  .string()
  .trim()
  .refine((v) => {
    const d = v.replace(/\D/g, '');
    return /^(977)?9[678]\d{8}$/.test(d) || /^(977)?0?\d{7,9}$/.test(d) || (v.startsWith('+') && d.length >= 8 && d.length <= 15);
  }, 'Enter a valid mobile number (e.g. 98XXXXXXXX)');

const checkoutSchema = z.object({
  items: itemsSchema,
  customer: z.object({
    fullName: z.string().trim().min(2, 'Enter your name').max(80),
    phone: nepalPhone,
    email: z.union([z.string().trim().email('Invalid email'), z.literal('')]).optional(),
  }),
  shippingAddress: z.object({
    province: z.string().trim().max(60).optional().default(''),
    district: z.string().trim().min(2, 'Select your district').max(60),
    municipality: z.string().trim().min(2, 'Enter your city').max(80),
    area: z.string().trim().max(120).optional().default(''),
    address: z.string().trim().min(3, 'Enter your delivery address').max(240),
    landmark: z.string().trim().max(160).optional().default(''),
  }),
  paymentMethod: z.enum(['cod', 'esewa', 'khalti']).default('cod'),
  couponCode: z.string().trim().max(40).optional().nullable(),
  customerNote: z.string().trim().max(500).optional().default(''),
  website: z.string().optional(),
});

exports.getQuote = async (req, res, next) => {
  try {
    const { items, couponCode, district, municipality } = quoteSchema.parse(req.body);
    const quote = await calculateQuote({ items, couponCode, district, municipality });
    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    // Honeypot spam check (checked before validation so bots get a generic error)
    if (req.body && req.body.website) {
      return res.status(400).json({
        success: false,
        error: { code: 'SPAM_DETECTED', message: 'Spam submission detected.' },
      });
    }

    const parsed = checkoutSchema.parse(req.body);
    const { items, customer, paymentMethod, couponCode, customerNote } = parsed;
    customer.phone = normalizePhone(customer.phone) || customer.phone;
    const shippingAddress = {
      ...parsed.shippingAddress,
      province: parsed.shippingAddress.province || provinceOf(parsed.shippingAddress.district) || 'Nepal',
      fullName: customer.fullName,
      phone: customer.phone,
      area: parsed.shippingAddress.area || parsed.shippingAddress.municipality,
    };

    // Payment method must be enabled AND configured server-side
    const settingsDoc = await StoreSettings.findOne().select('payments');
    const pm = settingsDoc?.payments?.[paymentMethod];
    const gatewayReady = paymentMethod === 'cod' || false; // online gateways require verified integrations
    if (!pm?.enabled || !gatewayReady) {
      return res.status(400).json({
        success: false,
        error: { code: 'PAYMENT_METHOD_UNAVAILABLE', message: 'This payment method is not available right now.' },
      });
    }
    // Always recalculate on backend - NEVER trust client prices
    const quote = await calculateQuote({
      items,
      couponCode,
      district: shippingAddress.district,
      municipality: shippingAddress.municipality,
    });

    if (quote.hasIssues || quote.lines.some((l) => l.status !== 'ok')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'STOCK_OR_PRICE_CHANGED',
          message: 'Some items in your cart are out of stock or quantities are no longer available.',
          details: quote.lines,
        },
      });
    }

    // Atomically reserve inventory � $elemMatch guarantees the SAME variant has enough stock.
    // If any line fails, previously reserved lines are released.
    const reserved = [];
    for (const line of quote.lines) {
      const resUpdate = await Product.updateOne(
        { variants: { $elemMatch: { _id: line.variantId, isActive: true, stock: { $gte: line.quantity } } } },
        { $inc: { 'variants.$.stock': -line.quantity, salesCount: line.quantity } }
      );

      if (resUpdate.modifiedCount === 0) {
        for (const r of reserved) {
          await Product.updateOne(
            { 'variants._id': r.variantId },
            { $inc: { 'variants.$.stock': r.quantity, salesCount: -r.quantity } }
          );
        }
        return res.status(409).json({
          success: false,
          error: {
            code: 'OUT_OF_STOCK',
            message: `Sorry, ${line.name} just sold out in that option. Please update your bag.`,
          },
        });
      }
      reserved.push(line);
    }

    const orderNumber = `AMB-${new Date().getFullYear().toString().slice(2)}${nanoid(6).toUpperCase().replace(/[-_]/g, 'X')}`;
    const accessKey = nanoid(24);

    const releaseReserved = async () => {
      for (const r of reserved) {
        await Product.updateOne({ 'variants._id': r.variantId }, { $inc: { 'variants.$.stock': r.quantity, salesCount: -r.quantity } });
      }
    };

    let order;
    try {
      order = await Order.create({
      orderNumber,
      accessKey,
      userId: req.user ? req.user._id : null,
      customer: {
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email || '',
      },
      items: quote.lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        name: l.name,
        slug: l.slug,
        sku: l.sku,
        image: l.image,
        optionValues: l.optionValues,
        unitPrice: l.unitPrice,
        compareAtPrice: l.compareAtPrice,
        quantity: l.quantity,
        lineTotal: l.lineTotal,
      })),
      subtotal: quote.subtotal,
      discount: quote.discount,
      deliveryCharge: quote.delivery.charge,
      total: quote.total,
      coupon: quote.coupon ? { code: quote.coupon.code, type: quote.coupon.type, value: quote.coupon.value } : undefined,
      shippingAddress,
      deliveryZone: quote.delivery.zoneName,
      estimatedDelivery: quote.delivery.estimatedDays,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'cod_due' : 'pending',
      status: 'pending',
      customerNote: customerNote || '',
      statusHistory: [
        {
          type: 'fulfilment',
          from: null,
          to: 'pending',
          note: 'Order placed by customer',
          by: {
            id: req.user ? req.user._id.toString() : '',
            name: customer.fullName,
            kind: req.user ? 'customer' : 'system',
          },
          at: new Date(),
        },
      ],
    });
    } catch (createError) {
      // Never leak reserved stock if the order document cannot be saved
      await releaseReserved();
      throw createError;
    }

    // Record inventory audit logs
    for (const line of quote.lines) {
      await InventoryMovement.create({
        productId: line.productId,
        productName: line.name,
        variantId: line.variantId,
        sku: line.sku,
        change: -line.quantity,
        quantityBefore: line.available,
        quantityAfter: line.available - line.quantity,
        reason: 'order',
        orderNumber: order.orderNumber,
        note: `Order ${order.orderNumber} placed`,
        by: { id: req.user ? req.user._id.toString() : '', name: customer.fullName, kind: 'customer' },
      });
    }

    // Increment coupon usage
    if (quote.coupon) {
      await Coupon.updateOne({ code: quote.coupon.code }, { $inc: { usageCount: 1 } });
    }

    res.status(201).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        accessKey: order.accessKey,
        total: order.total,
        paymentMethod: order.paymentMethod,
        payment: { type: 'none' },
      },
    });
  } catch (error) {
    next(error);
  }
};

/** Normalise Nepali phone numbers to their 10-digit local form when possible */
const normalizePhone = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('977')) return digits.slice(3);
  return digits;
};
exports.normalizePhone = normalizePhone;

const phoneCandidates = (raw) => {
  const n = normalizePhone(raw);
  return [...new Set([String(raw || '').trim(), n, `+977 ${n}`, `+977${n}`, `977${n}`])];
};

/** Customer-safe order DTO � strips access keys, internal notes and payment audit entries */
const toPublicOrder = (o) => {
  const j = o.toJSON();
  return {
    id: j.id,
    orderNumber: j.orderNumber,
    createdAt: j.createdAt,
    customer: j.customer,
    items: j.items,
    subtotal: j.subtotal,
    discount: j.discount,
    deliveryCharge: j.deliveryCharge,
    total: j.total,
    coupon: j.coupon && j.coupon.code ? { code: j.coupon.code } : null,
    shippingAddress: j.shippingAddress,
    deliveryZone: j.deliveryZone,
    estimatedDelivery: j.estimatedDelivery,
    paymentMethod: j.paymentMethod,
    paymentStatus: j.paymentStatus,
    status: j.status,
    statusHistory: (j.statusHistory || [])
      .filter((h) => h.type === 'fulfilment')
      .map((h) => ({ type: h.type, from: h.from, to: h.to, note: h.note, at: h.at })),
    customerNote: j.customerNote,
  };
};

exports.getPublicOrder = async (req, res, next) => {
  try {
    const orderNumber = String(req.params.orderNumber).toUpperCase();
    const key = req.query.key ? String(req.query.key) : '';
    const query = { orderNumber };
    if (key) query.accessKey = key;
    else if (req.user) query.userId = req.user._id;
    else {
      return res.status(403).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'This order link is missing its access key.' },
      });
    }

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found.' } });
    }
    res.json({ success: true, data: toPublicOrder(order) });
  } catch (error) {
    next(error);
  }
};

/** Batch lookup for orders saved on a guest's device: [{ orderNumber, accessKey }] */
exports.lookupOrders = async (req, res, next) => {
  try {
    const list = Array.isArray(req.body?.orders) ? req.body.orders.slice(0, 50) : [];
    const pairs = list
      .filter((o) => o && typeof o.orderNumber === 'string' && typeof o.accessKey === 'string')
      .map((o) => ({ orderNumber: o.orderNumber.toUpperCase(), accessKey: o.accessKey }));
    if (!pairs.length) return res.json({ success: true, data: [] });
    const orders = await Order.find({ $or: pairs }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders.map(toPublicOrder) });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: orders.map(toPublicOrder) });
  } catch (error) {
    next(error);
  }
};

exports.trackOrder = async (req, res, next) => {
  try {
    const orderNumber = String(req.body?.orderNumber || '').trim().toUpperCase();
    const phone = String(req.body?.phone || '').trim();
    if (!orderNumber || !phone) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Order number and phone number are required.' },
      });
    }
    const order = await Order.findOne({ orderNumber, 'customer.phone': { $in: phoneCandidates(phone) } });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No order matches that number and phone.' },
      });
    }
    res.json({ success: true, data: toPublicOrder(order) });
  } catch (error) {
    next(error);
  }
};

exports.getAdminOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, q } = req.query;
    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (q) {
      query.$or = [
        { orderNumber: { $regex: q, $options: 'i' } },
        { 'customer.fullName': { $regex: q, $options: 'i' } },
        { 'customer.phone': { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    const items = orders.map((o) => ({
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

exports.getAdminOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' },
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, note } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' },
      });
    }

    const actor = {
      id: req.user._id.toString(),
      name: req.user.name,
      kind: 'admin',
    };

    if (status && status !== order.status) {
      order.statusHistory.push({
        type: 'fulfilment',
        from: order.status,
        to: status,
        note: note || `Status updated to ${status}`,
        by: actor,
        at: new Date(),
      });
      order.status = status;

      // Handle cancellation inventory restock
      if (status === 'cancelled') {
        for (const item of order.items) {
          await Product.updateOne(
            { 'variants._id': item.variantId },
            {
              $inc: {
                'variants.$.stock': item.quantity,
                salesCount: -item.quantity,
              },
            }
          );
          await InventoryMovement.create({
            productId: item.productId,
            productName: item.name,
            variantId: item.variantId,
            sku: item.sku,
            change: item.quantity,
            quantityBefore: 0,
            quantityAfter: item.quantity,
            reason: 'order_cancelled',
            orderNumber: order.orderNumber,
            note: `Restocked due to order cancellation`,
            by: actor,
          });
        }
      }
    }

    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      order.statusHistory.push({
        type: 'payment',
        from: order.paymentStatus,
        to: paymentStatus,
        note: note || `Payment status changed to ${paymentStatus}`,
        by: actor,
        at: new Date(),
      });
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

exports.addOrderNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_NOTE', message: 'Note text is required.' },
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' },
      });
    }

    order.internalNotes.push({
      note,
      by: { id: req.user._id.toString(), name: req.user.name, kind: 'admin' },
      at: new Date(),
    });

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};


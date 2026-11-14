const mongoose = require('mongoose');
const { imageAssetSchema } = require('./Category');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: imageAssetSchema, default: null },
    optionValues: { type: Map, of: String, default: {} },
    unitPrice: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    municipality: { type: String, required: true },
    area: { type: String, required: true },
    address: { type: String, required: true },
    landmark: { type: String, default: '' },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['fulfilment', 'payment'], default: 'fulfilment' },
    from: { type: String, default: null },
    to: { type: String, required: true },
    note: { type: String, default: '' },
    by: {
      id: { type: String, default: '' },
      name: { type: String, default: 'System' },
      kind: { type: String, enum: ['admin', 'customer', 'system'], default: 'system' },
    },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const internalNoteSchema = new mongoose.Schema(
  {
    note: { type: String, required: true },
    by: {
      id: { type: String, default: '' },
      name: { type: String, default: 'Admin' },
      kind: { type: String, default: 'admin' },
    },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accessKey: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true, index: true },
      email: { type: String, default: '', lowercase: true },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    deliveryCharge: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    coupon: {
      code: { type: String, default: '' },
      type: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
      value: { type: Number, default: 0 },
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
    deliveryZone: { type: String, default: null },
    estimatedDelivery: { type: String, default: '2-4 business days' },
    paymentMethod: {
      type: String,
      enum: ['cod', 'esewa', 'khalti'],
      default: 'cod',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'cod_due', 'paid', 'failed', 'refunded'],
      default: 'cod_due',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'pending',
      index: true,
    },
    customerNote: { type: String, default: '' },
    internalNotes: [internalNoteSchema],
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        if (ret.items) {
          ret.items.forEach((item) => {
            if (item.optionValues instanceof Map) {
              item.optionValues = Object.fromEntries(item.optionValues);
            }
          });
        }
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Order', orderSchema);


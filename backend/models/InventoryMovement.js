const mongoose = require('mongoose');

const inventoryMovementSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productName: { type: String, required: true },
    variantId: { type: String, required: true, index: true },
    sku: { type: String, required: true },
    change: { type: Number, required: true },
    quantityBefore: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    reason: {
      type: String,
      enum: ['initial', 'adjustment', 'restock', 'order', 'order_cancelled', 'return', 'damage', 'correction'],
      default: 'adjustment',
    },
    orderNumber: { type: String, default: null },
    note: { type: String, default: '' },
    by: {
      id: { type: String, default: '' },
      name: { type: String, default: 'Admin' },
      kind: { type: String, enum: ['admin', 'customer', 'system'], default: 'admin' },
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

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema);


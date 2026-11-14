const mongoose = require('mongoose');
const { imageAssetSchema } = require('./Category');

const optionValueSchema = new mongoose.Schema(
  {
    value: { type: String, required: true },
    swatch: { type: String, default: '' },
  },
  { _id: false }
);

const productOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    values: [optionValueSchema],
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    optionValues: {
      type: Map,
      of: String,
      default: {},
    },
    priceAdjustment: { type: Number, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    position: { type: Number, default: 0 },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        // convert Map to regular object
        if (ret.optionValues instanceof Map) {
          ret.optionValues = Object.fromEntries(ret.optionValues);
        }
        delete ret._id;
        return ret;
      },
    },
  }
);

const specificationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    previousSlugs: [{ type: String, lowercase: true, trim: true }],
    shortDescription: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    brand: {
      type: String,
      default: 'Amberk Clothing',
      trim: true,
    },
    images: [imageAssetSchema],
    price: {
      type: Number,
      required: [true, 'Base selling price is required'],
      min: 0,
      index: true,
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    options: [productOptionSchema],
    variants: [variantSchema],
    specifications: [specificationSchema],
    tags: [{ type: String, trim: true }],
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    bestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    newArrival: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      ogImage: { type: String, default: null },
    },
    salesCount: {
      type: Number,
      default: 0,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
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

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);


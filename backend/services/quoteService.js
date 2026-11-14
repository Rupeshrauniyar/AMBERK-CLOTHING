const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const StoreSettings = require('../models/StoreSettings');

const calculateQuote = async ({ items, couponCode, district, municipality }) => {
  const settings = (await StoreSettings.findOne()) || new StoreSettings();
  const deliverySettings = settings.delivery;

  let subtotal = 0;
  let savings = 0;
  const lines = [];
  let hasIssues = false;

  for (const item of items || []) {
    const product = await Product.findOne({ 'variants._id': item.variantId });
    if (!product || product.status !== 'published') {
      hasIssues = true;
      continue;
    }

    const variant = product.variants.id(item.variantId);
    if (!variant || !variant.isActive) {
      hasIssues = true;
      continue;
    }

    const unitPrice = product.price + (variant.priceAdjustment || 0);
    const availableStock = variant.stock;
    const requestedQty = Math.max(1, Number(item.quantity) || 1);
    const qty = Math.min(requestedQty, Math.max(0, availableStock));

    let status = 'ok';
    if (availableStock <= 0) {
      status = 'out_of_stock';
      hasIssues = true;
    } else if (requestedQty > availableStock) {
      status = 'limited';
      hasIssues = true;
    }

    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;

    if (product.compareAtPrice && product.compareAtPrice > unitPrice) {
      savings += (product.compareAtPrice - unitPrice) * qty;
    }

    lines.push({
      variantId: variant._id.toString(),
      productId: product._id.toString(),
      name: product.name,
      slug: product.slug,
      sku: variant.sku,
      image: product.images && product.images.length > 0 ? product.images[0] : null,
      optionValues: variant.optionValues instanceof Map ? Object.fromEntries(variant.optionValues) : variant.optionValues || {},
      unitPrice,
      compareAtPrice: product.compareAtPrice,
      requestedQuantity: requestedQty,
      quantity: qty,
      available: availableStock,
      lineTotal,
      status,
    });
  }

  // Calculate Coupon discount
  let discount = 0;
  let appliedCoupon = null;
  let couponError = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase().trim(), isActive: true });
    const now = new Date();
    if (!coupon) {
      couponError = 'Invalid or expired promo code';
    } else if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      couponError = 'This code is not active yet';
    } else if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      couponError = 'This code has reached its usage limit';
    } else if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      couponError = `Minimum order amount for this code is NPR ${coupon.minOrderAmount}`;
    } else if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      couponError = 'This coupon has expired';
    } else {
      if (coupon.type === 'percentage') {
        discount = Math.round((subtotal * coupon.value) / 100);
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = Math.min(coupon.value, subtotal);
      }
      appliedCoupon = {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
      };
    }
  }

  // Delivery Quote Calculation
  let deliveryCharge = 0;
  let isFree = false;
  let zoneName = null;
  let estimatedDays = '2-4 business days';
  let freeDeliveryMinimum = null;
  let amountToFree = null;
  let deliveryMessage = 'Standard delivery';

  if (district) {
    const matchedZone = (deliverySettings.zones || []).find((z) => {
      if (!z.isActive) return false;
      const matchDistrict = (z.districts || []).some((d) => d.toLowerCase() === district.toLowerCase().trim());
      if (!matchDistrict) return false;
      if (z.municipalities && z.municipalities.length > 0 && municipality) {
        return z.municipalities.some((m) => m.toLowerCase() === municipality.toLowerCase().trim());
      }
      return true;
    });

    if (matchedZone) {
      zoneName = matchedZone.name;
      estimatedDays = matchedZone.estimatedDays || '1-2 days';
      if (matchedZone.freeDelivery) {
        isFree = true;
        deliveryCharge = 0;
        deliveryMessage = `Free delivery in ${matchedZone.name}`;
      } else if (matchedZone.freeDeliveryMinimum && subtotal >= matchedZone.freeDeliveryMinimum) {
        isFree = true;
        deliveryCharge = 0;
        deliveryMessage = `Free delivery on orders over NPR ${matchedZone.freeDeliveryMinimum}`;
      } else {
        deliveryCharge = matchedZone.charge;
        freeDeliveryMinimum = matchedZone.freeDeliveryMinimum;
        if (freeDeliveryMinimum && subtotal < freeDeliveryMinimum) {
          amountToFree = freeDeliveryMinimum - subtotal;
          deliveryMessage = `Add NPR ${amountToFree} more for free delivery`;
        }
      }
    } else if (deliverySettings.allowOutsideZones) {
      zoneName = 'Nationwide Courier';
      estimatedDays = deliverySettings.outsideZoneEstimatedDays || '3-5 days';
      if (deliverySettings.outsideZoneFreeMinimum && subtotal >= deliverySettings.outsideZoneFreeMinimum) {
        isFree = true;
        deliveryCharge = 0;
        deliveryMessage = `Free delivery on orders over NPR ${deliverySettings.outsideZoneFreeMinimum}`;
      } else {
        deliveryCharge = deliverySettings.outsideZoneCharge || 150;
        freeDeliveryMinimum = deliverySettings.outsideZoneFreeMinimum;
        if (freeDeliveryMinimum && subtotal < freeDeliveryMinimum) {
          amountToFree = freeDeliveryMinimum - subtotal;
          deliveryMessage = `Add NPR ${amountToFree} more for free nationwide delivery`;
        }
      }
    }
  }

  const total = Math.max(0, subtotal - discount + deliveryCharge);

  return {
    lines,
    subtotal,
    savings,
    discount,
    coupon: appliedCoupon,
    couponError,
    delivery: {
      available: true,
      zoneName,
      charge: deliveryCharge,
      isFree,
      freeDeliveryMinimum,
      amountToFree,
      estimatedDays,
      message: deliveryMessage,
    },
    total,
    hasIssues,
  };
};

module.exports = {
  calculateQuote,
};


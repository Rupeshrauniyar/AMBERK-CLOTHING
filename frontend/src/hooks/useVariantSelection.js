import { useMemo, useState } from 'react';

const isSize = (n) => /^size$/i.test(n);

/**
 * Variant selection state for a product detail DTO.
 * Colour-like options are preselected with the first in-stock value; size must be chosen
 * (unless only one value exists) so customers consciously pick a fit.
 */
export function useVariantSelection(product) {
  const options = product?.options || [];
  const variants = (product?.variants || []).filter((v) => v.isActive);

  const initial = useMemo(() => {
    const sel = {};
    const firstInStock = variants.find((v) => v.stock > 0) || variants[0];
    options.forEach((o) => {
      if (o.values.length === 1) sel[o.name] = o.values[0].value;
      else if (!isSize(o.name) && firstInStock) sel[o.name] = firstInStock.optionValues[o.name];
    });
    return sel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const [selected, setSelected] = useState(initial);
  const [forId, setForId] = useState(product?.id);
  if (product?.id !== forId) {
    setForId(product?.id);
    setSelected(initial);
  }

  const missing = options.filter((o) => !selected[o.name]).map((o) => o.name);

  const variant = useMemo(() => {
    if (!options.length) return variants[0] || null;
    if (missing.length) return null;
    return variants.find((v) => options.every((o) => v.optionValues[o.name] === selected[o.name])) || null;
  }, [selected, product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Is `value` of option `name` purchasable given the other current selections? */
  const isAvailable = (name, value) =>
    variants.some(
      (v) =>
        v.stock > 0 &&
        v.optionValues[name] === value &&
        options.every((o) => o.name === name || !selected[o.name] || v.optionValues[o.name] === selected[o.name])
    );

  const choose = (name, value) => setSelected((s) => ({ ...s, [name]: s[name] === value && isSize(name) ? s[name] : value }));

  const price = variant ? variant.price : product?.price;
  const compareAt = variant ? variant.compareAtPrice : product?.compareAtPrice;
  const stock = variant ? variant.stock : null;

  return { options, selected, choose, variant, missing, isAvailable, price, compareAt, stock, variants };
}

/** Build a cart line from a product detail DTO + chosen variant */
export function toCartLine(product, variant, quantity = 1) {
  return {
    variantId: variant.id,
    productId: product.id,
    name: product.name,
    slug: product.slug,
    image: product.images?.[0] || null,
    optionValues: variant.optionValues,
    unitPrice: variant.price,
    compareAtPrice: variant.compareAtPrice,
    available: variant.stock,
    quantity,
    options: product.options,
    variants: (product.variants || [])
      .filter((v) => v.isActive)
      .map((v) => ({ id: v.id, optionValues: v.optionValues, price: v.price, compareAtPrice: v.compareAtPrice, stock: v.stock })),
  };
}


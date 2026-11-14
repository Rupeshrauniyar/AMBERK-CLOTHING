import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Cart line shape:
 * { variantId, productId, name, slug, image, optionValues, unitPrice, compareAtPrice, quantity, available,
 *   variants?: [{ id, optionValues, price, compareAtPrice, stock, isActive }] }
 * Prices here are for display only — the server recalculates everything at checkout.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = [...get().items];
        const i = items.findIndex((x) => x.variantId === item.variantId);
        const cap = (q, avail) => (avail ? Math.min(q, avail) : q);
        if (i > -1) {
          items[i] = { ...items[i], ...item, quantity: cap(items[i].quantity + (item.quantity || 1), item.available) };
        } else {
          items.unshift({ ...item, quantity: cap(item.quantity || 1, item.available) });
        }
        set({ items });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: i.available ? Math.min(quantity, i.available) : quantity } : i
          ),
        });
      },

      /** Swap a line to a different variant of the same product (size / colour change) */
      changeVariant: (variantId, next) => {
        const items = get().items;
        const line = items.find((i) => i.variantId === variantId);
        if (!line || !next) return;
        const existing = items.find((i) => i.variantId === next.id);
        const quantity = Math.min(line.quantity + (existing ? existing.quantity : 0), next.stock || 1);
        const updated = {
          ...line,
          variantId: next.id,
          optionValues: next.optionValues,
          unitPrice: next.price,
          compareAtPrice: next.compareAtPrice,
          available: next.stock,
          quantity,
        };
        set({
          items: items
            .filter((i) => i.variantId !== next.id)
            .map((i) => (i.variantId === variantId ? updated : i)),
        });
      },

      /** Apply authoritative server quote (stock/price) to local lines */
      syncFromQuote: (lines = []) => {
        const byId = Object.fromEntries(lines.map((l) => [l.variantId, l]));
        set({
          items: get().items.map((i) => {
            const l = byId[i.variantId];
            return l ? { ...i, unitPrice: l.unitPrice, compareAtPrice: l.compareAtPrice, available: l.available } : i;
          }),
        });
      },

      removeItem: (variantId) => set({ items: get().items.filter((i) => i.variantId !== variantId) }),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'amberk_cart_v2' }
  )
);

export const selectCount = (s) => s.items.reduce((n, i) => n + i.quantity, 0);
export const selectSubtotal = (s) => s.items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);

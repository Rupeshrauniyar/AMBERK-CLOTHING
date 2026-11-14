import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Transient UI state: drawers, overlays and quick view */
export const useUiStore = create((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  quickViewSlug: null,
  offerOpen: false,
  openCart: () => set({ cartOpen: true, menuOpen: false, searchOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  openSearch: () => set({ searchOpen: true, menuOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  setMenu: (menuOpen) => set({ menuOpen }),
  openQuickView: (slug) => set({ quickViewSlug: slug }),
  closeQuickView: () => set({ quickViewSlug: null }),
  setOfferOpen: (offerOpen) => set({ offerOpen }),
}));

/**
 * Orders placed on this device. Lets guests revisit what they bought without an account.
 * Each entry holds the private access key returned at checkout.
 */
export const useOrdersStore = create(
  persist(
    (set, get) => ({
      orders: [], // [{ orderNumber, accessKey, total, createdAt, itemCount, preview, image }]
      saveOrder: (o) =>
        set({ orders: [o, ...get().orders.filter((x) => x.orderNumber !== o.orderNumber)].slice(0, 50) }),
      removeOrder: (orderNumber) => set({ orders: get().orders.filter((o) => o.orderNumber !== orderNumber) }),
      keyFor: (orderNumber) => get().orders.find((o) => o.orderNumber === orderNumber)?.accessKey,
    }),
    { name: 'amberk_my_orders' }
  )
);

/** Recently viewed product cards (max 12) */
export const useRecentStore = create(
  persist(
    (set, get) => ({
      items: [],
      push: (card) => set({ items: [card, ...get().items.filter((i) => i.id !== card.id)].slice(0, 12) }),
    }),
    { name: 'amberk_recent' }
  )
);

/** Delivery details remembered on this device to make the next checkout one tap */
export const useCustomerStore = create(
  persist(
    (set) => ({
      details: null,
      remember: (details) => set({ details }),
      forget: () => set({ details: null }),
    }),
    { name: 'amberk_customer' }
  )
);


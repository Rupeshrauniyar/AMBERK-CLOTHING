import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const npr = (n) => `Rs. ${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

export const optionsLabel = (ov = {}) =>
  Object.values(ov || {})
    .filter(Boolean)
    .join(' · ');

export const formatDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-GB', opts) : '';

export const ORDER_STATUS = {
  pending: { label: 'Order placed', tone: 'brand' },
  confirmed: { label: 'Confirmed', tone: 'brand' },
  processing: { label: 'Preparing', tone: 'brand' },
  packed: { label: 'Packed', tone: 'brand' },
  shipped: { label: 'Shipped', tone: 'ink' },
  out_for_delivery: { label: 'Out for delivery', tone: 'ink' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  returned: { label: 'Returned', tone: 'danger' },
};

export const ORDER_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

/** Resolve a progress index for the order timeline */
export const stepIndex = (status) => {
  const map = { pending: 0, confirmed: 1, processing: 1, packed: 2, shipped: 3, out_for_delivery: 3, delivered: 4 };
  return map[status] ?? 0;
};

/** Build a WhatsApp deep link when a number is configured */
export const waLink = (number, text = '') => {
  const digits = String(number || '').replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};


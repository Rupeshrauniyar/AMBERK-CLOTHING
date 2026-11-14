import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Package, ArrowRight, Smartphone, Search, Trash2 } from 'lucide-react';
import { fetchApi } from '../../services/api';
import { useOrdersStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Img from '../../components/ui/Img';
import { Badge, EmptyState, Seo, Skeleton } from '../../components/ui/Primitives';
import { ORDER_STATUS, formatDate, npr, stepIndex } from '../../lib/utils';

/**
 * Orders saved on this device (guest checkout) merged with account orders when signed in.
 * Live statuses come from the server using each order's private access key.
 */
export default function MyOrdersPage() {
  const saved = useOrdersStore((s) => s.orders);
  const removeOrder = useOrdersStore((s) => s.removeOrder);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: live = [], isLoading } = useQuery({
    queryKey: ['my-orders-local', saved.map((o) => o.orderNumber).join(',')],
    queryFn: () =>
      fetchApi('/orders/lookup', {
        method: 'POST',
        body: JSON.stringify({ orders: saved.map(({ orderNumber, accessKey }) => ({ orderNumber, accessKey })) }),
      }),
    enabled: saved.length > 0,
  });

  const { data: mine = [] } = useQuery({
    queryKey: ['my-orders-account'],
    queryFn: () => fetchApi('/orders/mine'),
    enabled: isAuthenticated,
  });

  const map = new Map();
  [...mine, ...live].forEach((o) => map.set(o.orderNumber, o));
  const orders = [...map.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const keyOf = (num) => saved.find((s) => s.orderNumber === num)?.accessKey;

  return (
    <div className="container-x max-w-5xl pb-10 pt-10 md:pt-16">
      <Seo title="My orders" />
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="eyebrow mb-3 text-brand">Your purchases</div>
          <h1 className="text-[clamp(2.4rem,6vw,4.6rem)] font-medium leading-none">My orders</h1>
        </div>
        <Button to="/track-order" variant="outline" size="sm"><Search className="h-4 w-4" /> Find another order</Button>
      </div>

      {!isAuthenticated && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl bg-sand p-4 text-sm text-mute">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <span>
            Orders you place are saved securely on this device — no account needed.{' '}
            <Link to="/account/login" className="font-medium text-ink underline underline-offset-4">Sign in</Link> to see orders from other devices too.
          </span>
        </div>
      )}

      {isLoading && saved.length > 0 ? (
        <div className="space-y-4">{saved.map((o) => <Skeleton key={o.orderNumber} className="h-36 rounded-[24px]" />)}</div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          body="When you place an order, it will appear here so you can follow its delivery."
          action={<Button to="/shop">Start shopping</Button>}
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((o, i) => {
            const st = ORDER_STATUS[o.status] || { label: o.status, tone: 'ink' };
            const key = keyOf(o.orderNumber);
            const href = `/orders/${o.orderNumber}${key ? `?key=${key}` : ''}`;
            const pct = ['cancelled', 'returned'].includes(o.status) ? 0 : (stepIndex(o.status) / 4) * 100;
            return (
              <motion.li key={o.orderNumber} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                <div className="group relative rounded-[24px] border border-line bg-white p-5 transition hover:border-ink/30 hover:shadow-[0_20px_50px_-30px_rgba(36,35,31,0.35)] md:p-6">
                  <Link to={href} className="absolute inset-0 z-0 rounded-[24px]" aria-label={`View order ${o.orderNumber}`} />
                  <div className="pointer-events-none relative flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="flex -space-x-3">
                      {o.items.slice(0, 3).map((it, j) => (
                        <div key={j} className="w-14 overflow-hidden rounded-xl border-2 border-white">
                          <Img src={it.image?.url} ratio="4/5" width={140} sizes="56px" />
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-medium tracking-wide">{o.orderNumber}</span>
                        <Badge tone={st.tone === 'success' ? 'success' : st.tone === 'danger' ? 'danger' : 'soft'}>{st.label}</Badge>
                      </div>
                      <div className="mt-1 truncate text-sm text-mute">
                        {formatDate(o.createdAt)} · {o.items.reduce((n, it) => n + it.quantity, 0)} items · {o.items.map((it) => it.name).join(', ')}
                      </div>
                      <div className="mt-3 h-1 max-w-sm overflow-hidden rounded-full bg-line">
                        <motion.div className="h-full rounded-full bg-brand" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.2 }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                      <span className="font-display text-xl font-medium">{npr(o.total)}</span>
                      <span className="flex items-center gap-1 text-sm font-medium">View <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                    </div>
                  </div>
                  {key && (
                    <button
                      onClick={() => confirm('Remove this order from this device? You can still track it with your order number and phone.') && removeOrder(o.orderNumber)}
                      className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-mute opacity-0 transition hover:bg-ink/5 hover:text-danger group-hover:opacity-100"
                      aria-label="Remove from this device"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}


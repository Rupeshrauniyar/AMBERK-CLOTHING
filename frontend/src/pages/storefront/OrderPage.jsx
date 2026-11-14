import { useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Copy, Check, Smartphone, Phone, MessageCircle, ArrowRight, Package, MapPin, Banknote } from 'lucide-react';
import { fetchApi } from '../../services/api';
import { useOrdersStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useSettings } from '../../hooks/useStore';
import OrderTimeline from '../../components/order/OrderTimeline';
import Button from '../../components/ui/Button';
import Img from '../../components/ui/Img';
import { EmptyState, Seo, Skeleton, Badge } from '../../components/ui/Primitives';
import { ORDER_STATUS, formatDate, npr, waLink } from '../../lib/utils';

function Celebration() {
  const dots = Array.from({ length: 14 });
  return (
    <div className="relative mx-auto mb-8 h-24 w-24">
      {dots.map((_, i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
            style={{ background: i % 3 === 0 ? '#C58A38' : i % 3 === 1 ? '#EAD9BA' : '#24231F' }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ x: Math.cos(angle) * 78, y: Math.sin(angle) * 78, opacity: [0, 1, 0], scale: [0, 1.2, 0.6] }}
            transition={{ duration: 1.3, delay: 0.45, ease: 'easeOut' }}
          />
        );
      })}
      <motion.div
        className="grid h-24 w-24 place-items-center rounded-full bg-brand text-white shadow-[0_20px_60px_-10px_rgba(197,138,56,0.6)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
      >
        <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }} />
        </svg>
      </motion.div>
    </div>
  );
}

export default function OrderPage() {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced || location.pathname.startsWith('/order-success');
  const localKey = useOrdersStore((s) => s.keyFor(orderId));
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const key = params.get('key') || localKey;
  const { data: settings } = useSettings();
  const [copied, setCopied] = useState(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId, key],
    queryFn: () => fetchApi(`/orders/${orderId}${key ? `?key=${encodeURIComponent(key)}` : ''}`),
    enabled: !!orderId && (!!key || isAuthenticated),
    retry: 1,
    refetchInterval: 60_000,
  });

  if (!key && !isAuthenticated) {
    return (
      <EmptyState
        icon={Package}
        title="We can't open this order here"
        body="This order isn't saved on this device. You can still track it with your order number and phone."
        action={<Button to="/track-order">Track an order</Button>}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="container-x max-w-4xl space-y-6 py-16">
        <Skeleton className="mx-auto h-24 w-24 rounded-full" />
        <Skeleton className="mx-auto h-12 w-2/3" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (isError || !order) {
    return <EmptyState icon={Package} title="Order not found" body="Check the link or track your order with your phone number." action={<Button to="/track-order">Track an order</Button>} />;
  }

  const store = settings?.store || {};
  const wa = waLink(store.whatsapp, `Hi Amberk, I have a question about my order ${order.orderNumber}.`);
  const status = ORDER_STATUS[order.status] || { label: order.status, tone: 'ink' };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="container-x max-w-5xl pb-10 pt-10 md:pt-16">
      <Seo title={`Order ${order.orderNumber}`} />

      <div className="text-center">
        {justPlaced ? <Celebration /> : null}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: justPlaced ? 0.5 : 0, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="eyebrow text-brand">{justPlaced ? 'Thank you, ' + order.customer.fullName.split(' ')[0] : 'Order details'}</div>
          <h1 className="mx-auto mt-4 max-w-2xl text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.02]">
            {justPlaced ? (
              <>Your order is <span className="serif-accent text-brand-deep">confirmed.</span></>
            ) : (
              <>Order {order.orderNumber}</>
            )}
          </h1>
          {justPlaced && (
            <p className="mx-auto mt-4 max-w-md text-mute">
              We'll call {order.customer.phone} to confirm delivery. Pay {npr(order.total)} in cash when it arrives.
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button onClick={copy} className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium hover:border-ink">
              <span className="text-mute">Order</span> <span className="font-mono tracking-wide">{order.orderNumber}</span>
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-mute" />}
            </button>
            <Badge tone={status.tone === 'success' ? 'success' : status.tone === 'danger' ? 'danger' : 'soft'} className="py-2">{status.label}</Badge>
          </div>
        </motion.div>
      </div>

      {justPlaced && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="mx-auto mt-10 flex max-w-xl items-start gap-3 rounded-2xl bg-champagne/40 p-4 text-sm"
        >
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-brand-deep" />
          <div>
            <b className="font-semibold">Saved to this device.</b> No account needed — you can come back anytime from{' '}
            <Link to="/orders" className="font-medium underline underline-offset-4">My orders</Link> to check your delivery status.
          </div>
        </motion.div>
      )}

      <div className="mt-12 rounded-[28px] border border-line bg-white p-6 md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-medium">Delivery progress</h2>
          {order.estimatedDelivery && <span className="text-sm text-mute">Est. {order.estimatedDelivery}</span>}
        </div>
        <OrderTimeline order={order} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[28px] border border-line bg-white p-6 md:p-8">
          <h2 className="mb-5 text-xl font-medium">Items</h2>
          <ul className="divide-y divide-line">
            {order.items.map((it, i) => (
              <li key={i} className="flex gap-4 py-4 first:pt-0">
                <Link to={`/item/${it.slug}`} className="w-16 shrink-0">
                  <Img src={it.image?.url} alt={it.name} ratio="4/5" width={160} sizes="64px" className="rounded-xl" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/item/${it.slug}`} className="font-medium hover:text-brand-deep">{it.name}</Link>
                  <div className="text-[13px] text-mute">
                    {[...Object.values(it.optionValues || {}), `Qty ${it.quantity}`].join(' · ')}
                  </div>
                </div>
                <div className="text-right font-medium tabular-nums">{npr(it.lineTotal)}</div>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[15px]">
            <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{npr(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-success"><dt>Discount{order.coupon ? ` (${order.coupon.code})` : ''}</dt><dd>−{npr(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-mute">Delivery</dt><dd>{order.deliveryCharge ? npr(order.deliveryCharge) : 'Free'}</dd></div>
            <div className="flex items-baseline justify-between border-t border-line pt-3"><dt className="font-medium">Total</dt><dd className="font-display text-2xl font-medium">{npr(order.total)}</dd></div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] bg-sand p-6 md:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-brand" /> Delivering to</div>
            <p className="mt-3 leading-relaxed text-mute">
              <span className="font-medium text-ink">{order.shippingAddress.fullName}</span><br />
              {order.shippingAddress.address}<br />
              {[order.shippingAddress.municipality, order.shippingAddress.district].filter(Boolean).join(', ')}<br />
              {order.shippingAddress.phone}
            </p>
            <div className="mt-5 flex items-center gap-2 border-t border-line pt-5 text-sm font-semibold"><Banknote className="h-4 w-4 text-brand" /> Payment</div>
            <p className="mt-2 text-mute">{order.paymentMethod === 'cod' ? 'Cash on delivery' : order.paymentMethod} · {order.paymentStatus === 'paid' ? 'Paid' : 'Pay on arrival'}</p>
            <p className="mt-4 text-[13px] text-mute">Placed {formatDate(order.createdAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          {(wa || store.phone || store.email) && (
            <div className="rounded-[28px] border border-line bg-white p-6 md:p-8">
              <div className="text-sm font-semibold">Need help with this order?</div>
              <div className="mt-4 flex flex-col gap-2">
                {wa && <Button href={wa} target="_blank" rel="noreferrer" variant="outline" size="sm"><MessageCircle className="h-4 w-4" /> Message on WhatsApp</Button>}
                {store.phone && <Button href={`tel:${store.phone}`} variant="ghost" size="sm"><Phone className="h-4 w-4" /> {store.phone}</Button>}
                {store.email && <a href={`mailto:${store.email}`} className="text-center text-sm text-mute underline underline-offset-4">{store.email}</a>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Button to="/shop" size="lg">Continue shopping <ArrowRight className="h-4 w-4" /></Button>
        <Button to="/orders" variant="outline" size="lg">All my orders</Button>
      </div>
    </div>
  );
}


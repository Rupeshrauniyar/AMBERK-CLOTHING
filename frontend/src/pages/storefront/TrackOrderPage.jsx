import { useState } from 'react';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { Search, ArrowRight } from 'lucide-react';
import { fetchApi } from '../../services/api';
import OrderTimeline from '../../components/order/OrderTimeline';
import Button from '../../components/ui/Button';
import Img from '../../components/ui/Img';
import { Badge, Seo } from '../../components/ui/Primitives';
import { ORDER_STATUS, formatDate, npr } from '../../lib/utils';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const track = useMutation({
    mutationFn: () => fetchApi('/orders/track', { method: 'POST', body: JSON.stringify({ orderNumber, phone }) }),
  });
  const order = track.data;
  const st = order ? ORDER_STATUS[order.status] || { label: order.status } : null;

  return (
    <div className="container-x max-w-4xl pb-10 pt-10 md:pt-16">
      <Seo title="Track your order" />
      <div className="text-center">
        <div className="eyebrow text-brand">Order status</div>
        <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-none">
          Track your <span className="serif-accent text-brand-deep">order</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-mute">
          Enter the order number from your confirmation and the phone number you used. Ordered on this device?{' '}
          <Link to="/orders" className="font-medium text-ink underline underline-offset-4">See My orders</Link>.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          track.mutate();
        }}
        className="mx-auto mt-10 grid max-w-2xl gap-3 rounded-[28px] border border-line bg-white p-3 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input required value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())} placeholder="Order number" className="field border-0 bg-sand font-mono" aria-label="Order number" />
        <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="field border-0 bg-sand" aria-label="Phone number" />
        <Button type="submit" loading={track.isPending} size="lg">
          <Search className="h-4 w-4" /> Track
        </Button>
      </form>
      <AnimatePresence>
        {track.isError && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 text-center text-sm text-danger">
            {track.error.message}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {order && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mt-12 rounded-[28px] border border-line bg-white p-6 md:p-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono text-lg font-medium">{order.orderNumber}</div>
                <div className="text-sm text-mute">Placed {formatDate(order.createdAt)} · {npr(order.total)}</div>
              </div>
              <Badge tone="soft" className="py-2">{st.label}</Badge>
            </div>
            <OrderTimeline order={order} />
            <ul className="mt-10 space-y-3 border-t border-line pt-6">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-12 shrink-0"><Img src={it.image?.url} ratio="4/5" width={120} sizes="48px" className="rounded-lg" /></div>
                  <span className="flex-1">{it.name} <span className="text-mute">× {it.quantity}</span></span>
                  <span>{npr(it.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <Button to="/shop" variant="ghost" className="mt-6">Continue shopping <ArrowRight className="h-4 w-4" /></Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

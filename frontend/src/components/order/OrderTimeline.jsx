import { motion } from 'motion/react';
import { Check, Package, Truck, Home, ClipboardCheck } from 'lucide-react';
import { ORDER_STEPS, stepIndex, formatDate, cn } from '../../lib/utils';

const ICONS = [ClipboardCheck, Check, Package, Truck, Home];
const LABELS = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

/** Visual 5-step delivery progress; cancelled/returned orders show a notice instead. */
export default function OrderTimeline({ order }) {
  if (['cancelled', 'returned'].includes(order.status)) {
    return (
      <div className="rounded-2xl bg-danger/8 p-5 text-danger">
        <div className="font-medium">This order was {order.status}.</div>
        <div className="mt-1 text-sm opacity-80">If you have questions, please contact us with your order number.</div>
      </div>
    );
  }
  const current = stepIndex(order.status);
  const at = (status) => order.statusHistory?.slice().reverse().find((h) => h.to === status)?.at;

  return (
    <div>
      <div className="relative grid grid-cols-5">
        <div className="absolute left-[10%] right-[10%] top-5 h-0.5 bg-line" />
        <motion.div
          className="absolute left-[10%] top-5 h-0.5 bg-brand"
          initial={{ width: 0 }}
          animate={{ width: `${(current / (ORDER_STEPS.length - 1)) * 80}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
        {ORDER_STEPS.map((s, i) => {
          const Icon = ICONS[i];
          const done = i <= current;
          return (
            <div key={s} className="relative flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 260, damping: 18 }}
                className={cn(
                  'relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 transition-colors',
                  done ? 'border-brand bg-brand text-white' : 'border-line bg-ivory text-mute',
                  i === current && 'ring-4 ring-brand/20'
                )}
              >
                <Icon className="h-4 w-4" />
              </motion.div>
              <div className={cn('mt-3 text-[12px] font-medium sm:text-[13px]', done ? 'text-ink' : 'text-mute')}>{LABELS[i]}</div>
              <div className="mt-0.5 hidden text-[11px] text-mute sm:block">{formatDate(at(s), { day: 'numeric', month: 'short' })}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


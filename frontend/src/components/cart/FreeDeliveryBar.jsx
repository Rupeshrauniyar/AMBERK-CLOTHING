import { motion } from 'motion/react';
import { Truck } from 'lucide-react';
import { useSettings } from '../../hooks/useStore';
import { npr } from '../../lib/utils';

/**
 * Progress towards the nationwide free-delivery threshold configured in admin settings.
 * Renders nothing when no threshold is configured.
 */
export default function FreeDeliveryBar({ subtotal }) {
  const { data: settings } = useSettings();
  const d = settings?.delivery;
  const freeZones = (d?.zones || []).filter((z) => z.isActive && z.freeDelivery).map((z) => z.name);
  const threshold = d?.allowOutsideZones ? d?.outsideZoneFreeMinimum : null;
  if (!d?.enabled || (!threshold && !freeZones.length)) return null;

  const pct = threshold ? Math.min(100, Math.round((subtotal / threshold) * 100)) : 0;
  const remaining = threshold ? Math.max(0, threshold - subtotal) : 0;

  return (
    <div className="rounded-2xl bg-sand px-4 py-3.5">
      <div className="flex items-start gap-3 text-[13px] leading-snug">
        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <div className="flex-1">
          {threshold ? (
            remaining > 0 ? (
              <span>
                You're <b className="font-semibold">{npr(remaining)}</b> away from free delivery anywhere in Nepal
              </span>
            ) : (
              <span className="font-semibold text-success">You've unlocked free delivery across Nepal</span>
            )
          ) : null}
          {freeZones.length > 0 && <div className="mt-0.5 text-mute">Always free in {freeZones.join(', ')}</div>}
        </div>
      </div>
      {threshold ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
          <motion.div className="h-full rounded-full bg-brand" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
        </div>
      ) : null}
    </div>
  );
}


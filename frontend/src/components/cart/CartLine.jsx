import { Link } from 'react-router';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import Img from '../ui/Img';
import { Stepper } from '../ui/Primitives';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { cn, npr } from '../../lib/utils';

/** A bag line with inline size/colour switching, quantity and remove. */
export default function CartLine({ item, compact = false }) {
  const { updateQuantity, removeItem, changeVariant } = useCartStore();
  const closeCart = useUiStore((s) => s.closeCart);
  const options = item.options || [];
  const variants = item.variants || [];

  const onOption = (name, value) => {
    const want = { ...item.optionValues, [name]: value };
    const exact = variants.find((v) => options.every((o) => v.optionValues[o.name] === want[o.name]));
    const fallback = variants.find((v) => v.optionValues[name] === value && v.stock > 0);
    changeVariant(item.variantId, exact && exact.stock > 0 ? exact : fallback || exact);
  };

  const limited = item.available !== undefined && item.available < item.quantity;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-4 py-5"
    >
      <Link to={`/item/${item.slug}`} onClick={closeCart} className={cn('shrink-0', compact ? 'w-20' : 'w-24 sm:w-28')}>
        <Img src={item.image?.url} alt={item.name} ratio="4/5" width={240} sizes="112px" className="rounded-xl" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/item/${item.slug}`} onClick={closeCart} className="line-clamp-2 text-[15px] font-medium leading-snug hover:text-brand-deep">
            {item.name}
          </Link>
          <button onClick={() => removeItem(item.variantId)} className="-mr-2 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-mute hover:bg-ink/5 hover:text-ink" aria-label={`Remove ${item.name}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {options.length > 0 && variants.length > 1 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((o) => (
              <label key={o.name} className="relative">
                <span className="sr-only">{o.name}</span>
                <select
                  value={item.optionValues?.[o.name] || ''}
                  onChange={(e) => onOption(o.name, e.target.value)}
                  className="appearance-none rounded-full border border-line bg-white py-1.5 pl-3 pr-7 text-[13px] font-medium hover:border-ink/40 focus:border-ink focus:outline-none"
                >
                  {o.values.map((v) => {
                    const ok = variants.some((x) => x.optionValues[o.name] === v.value && x.stock > 0);
                    return (
                      <option key={v.value} value={v.value} disabled={!ok}>
                        {o.name === 'Size' ? `Size ${v.value}` : v.value}
                        {!ok ? ' — sold out' : ''}
                      </option>
                    );
                  })}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-mute">▾</span>
              </label>
            ))}
          </div>
        ) : (
          Object.values(item.optionValues || {}).length > 0 && (
            <div className="mt-1 text-[13px] text-mute">{Object.values(item.optionValues).join(' · ')}</div>
          )
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <Stepper size="sm" value={item.quantity} onChange={(q) => updateQuantity(item.variantId, q)} max={Math.max(1, item.available ?? 20)} />
          <div className="text-right">
            <div className="font-medium tabular-nums">{npr(item.unitPrice * item.quantity)}</div>
            {item.quantity > 1 && <div className="text-[12px] text-mute">{npr(item.unitPrice)} each</div>}
          </div>
        </div>
        {limited && <div className="mt-2 text-[12px] font-medium text-danger">Only {item.available} available</div>}
      </div>
    </motion.li>
  );
}


import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Zap, Check } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../ui/Button';
import { Stepper } from '../ui/Primitives';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { toCartLine } from '../../hooks/useVariantSelection';

/** Size / colour / any option picker with stock-aware states */
export function OptionPicker({ selection, error }) {
  const { options, selected, choose, isAvailable } = selection;
  return (
    <div className="space-y-6">
      {options.map((o) => {
        const isColor = /colou?r/i.test(o.name);
        return (
          <div key={o.name}>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium">
                {o.name}
                {selected[o.name] && <span className="ml-2 font-normal text-mute">{selected[o.name]}</span>}
              </span>
              {error && !selected[o.name] && (
                <motion.span initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className="text-[13px] font-medium text-danger">
                  Please choose a {o.name.toLowerCase()}
                </motion.span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {o.values.map((v) => {
                const active = selected[o.name] === v.value;
                const available = isAvailable(o.name, v.value);
                if (isColor) {
                  return (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => choose(o.name, v.value)}
                      title={`${v.value}${available ? '' : ' — sold out'}`}
                      aria-label={`${v.value}${available ? '' : ' (sold out)'}`}
                      aria-pressed={active}
                      className={cn(
                        'relative flex h-11 items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-4 text-[13px] transition',
                        active ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-ink/40',
                        !available && 'opacity-45'
                      )}
                    >
                      <span className="h-8 w-8 rounded-full border border-black/10" style={{ background: v.swatch || '#ddd' }} />
                      {v.value}
                    </button>
                  );
                }
                return (
                  <button
                    key={v.value}
                    type="button"
                    disabled={!available}
                    onClick={() => choose(o.name, v.value)}
                    aria-pressed={active}
                    className={cn(
                      'relative h-12 min-w-14 rounded-full border px-4 text-sm font-medium transition',
                      active ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink',
                      !available && 'cursor-not-allowed border-dashed text-mute/60 line-through decoration-1 hover:border-line'
                    )}
                  >
                    {v.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Purchase block: picker, stock note, quantity, add-to-bag and buy-now.
 * Buy now adds the item and goes straight to the short checkout.
 */
export default function PurchasePanel({ product, selection, compact = false, onAdded }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUiStore((s) => s.openCart);
  const [qty, setQty] = useState(1);
  const [showError, setShowError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { variant, missing, stock } = selection;

  const soldOut = !selection.variants.some((v) => v.stock > 0);
  const variantOut = variant && variant.stock <= 0;

  const add = (buyNow = false) => {
    if (!variant) {
      setShowError(true);
      return;
    }
    if (variant.stock <= 0) return;
    addItem(toCartLine(product, variant, Math.min(qty, variant.stock)));
    onAdded?.();
    if (buyNow) {
      navigate('/checkout');
      return;
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
    toast.success('Added to your bag', {
      description: `${product.name}${Object.values(variant.optionValues).length ? ' · ' + Object.values(variant.optionValues).join(' / ') : ''}`,
      action: { label: 'View bag', onClick: openCart },
    });
  };

  return (
    <div className="space-y-6">
      {selection.options.length > 0 && <OptionPicker selection={selection} error={showError && missing.length > 0} />}

      <div className="min-h-5 text-sm">
        {soldOut ? (
          <span className="font-medium text-danger">Sold out — check back soon</span>
        ) : variantOut ? (
          <span className="font-medium text-danger">This option is sold out</span>
        ) : variant && stock <= 5 ? (
          <span className="flex items-center gap-2 font-medium text-brand-deep">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            Only {stock} left — order soon
          </span>
        ) : variant ? (
          <span className="flex items-center gap-2 text-success">
            <span className="h-2 w-2 rounded-full bg-success" /> In stock, ready to ship
          </span>
        ) : null}
      </div>

      <div className={cn('flex gap-3', compact ? 'flex-col sm:flex-row' : 'flex-col')}>
        <div className="flex gap-3">
          <Stepper value={qty} onChange={setQty} max={Math.max(1, stock || 10)} />
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => add(false)}
            disabled={soldOut || variantOut}
          >
            <AnimatePresence mode="wait" initial={false}>
              {justAdded ? (
                <motion.span key="ok" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Added
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  {soldOut ? 'Sold out' : missing.length ? `Select ${missing[0].toLowerCase()}` : 'Add to bag'}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
        {!soldOut && (
          <Button variant="accent" size="lg" className={compact ? 'flex-1' : 'w-full'} onClick={() => add(true)} disabled={variantOut}>
            <Zap className="h-4 w-4" /> Buy now — pay on delivery
          </Button>
        )}
      </div>
    </div>
  );
}


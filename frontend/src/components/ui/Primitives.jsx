import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import { cn, npr } from '../../lib/utils';

export function Price({ price, compareAt, className, size = 'md' }) {
  const discount = compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  const sz = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-[15px]';
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('font-medium tabular-nums', sz, discount && 'text-brand-deep')}>{npr(price)}</span>
      {discount > 0 && (
        <>
          <span className="text-[13px] text-mute line-through tabular-nums">{npr(compareAt)}</span>
          {size === 'lg' && (
            <span className="rounded-full bg-brand/12 px-2.5 py-0.5 text-xs font-bold text-brand-deep">Save {discount}%</span>
          )}
        </>
      )}
    </div>
  );
}

export function Stepper({ value, onChange, min = 1, max = 99, size = 'md' }) {
  const h = size === 'sm' ? 'h-9' : 'h-12';
  return (
    <div className={cn('inline-flex items-center rounded-full border border-line bg-white', h)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn('grid place-items-center rounded-full text-ink transition hover:bg-ink/5 disabled:opacity-30', size === 'sm' ? 'h-9 w-9' : 'h-12 w-12')}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-7 text-center text-sm font-medium tabular-nums" aria-live="polite">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn('grid place-items-center rounded-full text-ink transition hover:bg-ink/5 disabled:opacity-30', size === 'sm' ? 'h-9 w-9' : 'h-12 w-12')}
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function Badge({ children, tone = 'ink', className }) {
  const tones = {
    ink: 'bg-ink text-ivory',
    brand: 'bg-brand text-white',
    light: 'bg-ivory/95 text-ink',
    success: 'bg-success/12 text-success',
    danger: 'bg-danger/10 text-danger',
    soft: 'bg-champagne/60 text-brand-deep',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]', tones[tone], className)}>
      {children}
    </span>
  );
}

export function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left" aria-expanded={open}>
        <span className="font-medium">{title}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-[15px] leading-relaxed text-mute">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-2xl', className)} />;
}

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      {Icon && (
        <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-sand">
          <Icon className="h-8 w-8 text-brand" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-2xl font-medium">{title}</h3>
      {body && <p className="mt-2 text-mute">{body}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

/** Section heading with eyebrow and optional right-side slot */
export function SectionHead({ eyebrow, title, accent, sub, right, className }) {
  return (
    <div className={cn('mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow && <div className="eyebrow mb-4 text-brand">{eyebrow}</div>}
        <h2 className="text-[clamp(2rem,4.4vw,3.6rem)] font-medium leading-[1.02]">
          {title} {accent && <span className="serif-accent text-brand-deep">{accent}</span>}
        </h2>
        {sub && <p className="mt-4 max-w-lg text-mute">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/** Document head tags using React 19 metadata hoisting */
export function Seo({ title, description, image, url, type = 'website' }) {
  const full = title ? `${title} — Amberk Clothing` : 'Amberk Clothing — Wear Your Everyday Better';
  return (
    <>
      <title>{full}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={full} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      {url && <link rel="canonical" href={url} />}
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
    </>
  );
}


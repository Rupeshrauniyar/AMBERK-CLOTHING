import { useId } from 'react';
import { AlertCircle, Search, X } from 'lucide-react';
import { cn, ORDER_STATUS } from '../../lib/utils';
import Button from '../ui/Button';

/* ------------------------------------------------------------------ */
/* Layout primitives                                                   */
/* ------------------------------------------------------------------ */

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <div className="eyebrow mb-2 text-brand">{eyebrow}</div>}
        <h1 className="text-[clamp(1.75rem,3vw,2.4rem)] font-medium leading-tight">{title}</h1>
        {description && <p className="mt-2 text-[15px] text-mute">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children, as: Comp = 'div', ...props }) {
  return (
    <Comp className={cn('rounded-3xl border border-line bg-white', className)} {...props}>
      {children}
    </Comp>
  );
}

export function CardHeader({ title, description, action, icon: Icon, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sand text-brand-deep">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-medium leading-snug">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-mute">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Form section used inside editors: title on the left (desktop), fields on the right */
export function FormSection({ title, description, children, className }) {
  return (
    <section className={cn('grid gap-5 border-b border-line py-7 last:border-b-0 lg:grid-cols-[220px_1fr] lg:gap-10', className)}>
      <div>
        <h3 className="text-base font-medium">{title}</h3>
        {description && <p className="mt-1 text-sm leading-relaxed text-mute">{description}</p>}
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Form controls                                                       */
/* ------------------------------------------------------------------ */

const control = 'field !rounded-xl !px-3.5 !py-2.5 !text-sm disabled:bg-sand disabled:text-mute';

export function Field({ label, hint, error, children, className, htmlFor, required }) {
  return (
    <div className={cn('min-w-0', className)}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-ink-soft">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-mute">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ label, hint, error, className, inputClassName, required, ...props }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} className={className} htmlFor={id} required={required}>
      <input id={id} required={required} aria-invalid={error ? 'true' : undefined} className={cn(control, inputClassName)} {...props} />
    </Field>
  );
}

export function Textarea({ label, hint, className, rows = 3, inputClassName, ...props }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} className={className} htmlFor={id}>
      <textarea id={id} rows={rows} className={cn(control, 'resize-y leading-relaxed', inputClassName)} {...props} />
    </Field>
  );
}

export function Select({ label, hint, className, children, inputClassName, ...props }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} className={className} htmlFor={id}>
      <select id={id} className={cn(control, 'cursor-pointer pr-8', inputClassName)} {...props}>
        {children}
      </select>
    </Field>
  );
}

/** Accessible switch */
export function Toggle({ checked, onChange, label, description, disabled, className, size = 'md' }) {
  const id = useId();
  const track = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const knob = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const shift = size === 'sm' ? 'translate-x-4' : 'translate-x-5';
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      {(label || description) && (
        <label htmlFor={id} className={cn('min-w-0', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}>
          {label && <span className="block text-sm font-medium">{label}</span>}
          {description && <span className="mt-0.5 block text-xs leading-relaxed text-mute">{description}</span>}
        </label>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 disabled:opacity-50',
          track,
          checked ? 'bg-success' : 'bg-line'
        )}
      >
        <span className={cn('rounded-full bg-white shadow-sm transition-transform duration-300', knob, checked && shift)} />
      </button>
    </div>
  );
}

export function Checkbox({ checked, onChange, label, className }) {
  return (
    <label className={cn('inline-flex cursor-pointer select-none items-center gap-2.5 text-sm', className)}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 cursor-pointer rounded border-line accent-ink"
      />
      <span>{label}</span>
    </label>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={cn('relative min-w-0 flex-1', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(control, '!pl-10 !pr-9 [&::-webkit-search-cancel-button]:hidden')}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-mute hover:bg-ink/5"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/** Segmented tabs / pill switcher */
export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1', className)} role="tablist">
      {tabs.map((t) => {
        const active = t.value === value;
        const Icon = t.icon;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active ? 'bg-ink text-ivory' : 'text-mute hover:bg-ink/5 hover:text-ink'
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {t.label}
            {t.badge !== undefined && t.badge !== null && (
              <span className={cn('rounded-full px-1.5 text-[11px] tabular-nums', active ? 'bg-ivory/20' : 'bg-sand')}>{t.badge}</span>
            )}
            {t.dot !== undefined && (
              <span className={cn('h-1.5 w-1.5 rounded-full', t.dot ? 'bg-success' : 'bg-line')} aria-hidden />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status / feedback                                                   */
/* ------------------------------------------------------------------ */

const PILL_TONES = {
  neutral: 'bg-sand text-ink-soft',
  brand: 'bg-champagne/70 text-brand-deep',
  ink: 'bg-ink text-ivory',
  success: 'bg-success/12 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-sky-100 text-sky-800',
};

export function Pill({ tone = 'neutral', children, className, dot = true }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', PILL_TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />}
      {children}
    </span>
  );
}

const ORDER_TONES = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  packed: 'brand',
  shipped: 'brand',
  out_for_delivery: 'brand',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'danger',
};

export const ORDER_STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
];

export const ADMIN_STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export function OrderStatusPill({ status, className }) {
  return (
    <Pill tone={ORDER_TONES[status] || 'neutral'} className={className}>
      {ADMIN_STATUS_LABEL[status] || ORDER_STATUS[status]?.label || status}
    </Pill>
  );
}

export const PAYMENT_STATUS = {
  pending: { label: 'Pending', tone: 'warning' },
  cod_due: { label: 'COD due', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  refunded: { label: 'Refunded', tone: 'neutral' },
};

export function PaymentStatusPill({ status, className }) {
  const s = PAYMENT_STATUS[status] || { label: status, tone: 'neutral' };
  return (
    <Pill tone={s.tone} className={className}>
      {s.label}
    </Pill>
  );
}

export function StockPill({ stock, threshold = 5 }) {
  if (stock <= 0) return <Pill tone="danger">Out of stock</Pill>;
  if (stock <= threshold) return <Pill tone="warning">{stock} left</Pill>;
  return <Pill tone="success">{stock} in stock</Pill>;
}

export function ErrorState({ error, onRetry, className }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-danger/10 text-danger">
        <AlertCircle className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-medium">Couldn’t load this data</h3>
      <p className="mt-1 max-w-sm text-sm text-mute">{error?.message || 'Something went wrong.'}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyBlock({ icon: Icon, title, body, action, className }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      {Icon && (
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-sand text-brand">
          <Icon className="h-6 w-6" strokeWidth={1.6} />
        </span>
      )}
      <h3 className="text-lg font-medium">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-mute">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

/** Desktop table wrapper with sticky header. Hidden on small screens when `mobile` cards are provided. */
export function DataTable({ columns, children, className, hideOnMobile = true }) {
  return (
    <div className={cn('max-h-[70vh] overflow-auto', hideOnMobile && 'hidden md:block', className)}>
      <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                className={cn(
                  'sticky top-0 z-10 border-b border-line bg-ivory/95 px-5 py-3 text-xs font-medium uppercase tracking-[0.08em] text-mute backdrop-blur',
                  c.className
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0 [&>tr>td]:border-b [&>tr>td]:border-line [&>tr>td]:px-5 [&>tr>td]:py-3.5 [&>tr]:transition-colors [&>tr:hover]:bg-ivory/70">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="skeleton h-11 w-11 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-2/5 rounded-full" />
            <div className="skeleton h-3 w-1/4 rounded-full" />
          </div>
          <div className="skeleton hidden h-6 w-20 rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}

/** Mobile list of stacked cards */
export function MobileList({ children, className }) {
  return <div className={cn('divide-y divide-line md:hidden', className)}>{children}</div>;
}

export function IconButton({ label, className, children, tone = 'default', ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-grid h-9 w-9 place-items-center rounded-full text-mute transition-colors disabled:opacity-40',
        tone === 'danger' ? 'hover:bg-danger/10 hover:text-danger' : 'hover:bg-ink/5 hover:text-ink',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Thumb({ src, alt = '', className }) {
  return (
    <div className={cn('h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-sand', className)}>
      {src ? <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" /> : null}
    </div>
  );
}

/** Small helper to produce collision-safe ids for new list items */
export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

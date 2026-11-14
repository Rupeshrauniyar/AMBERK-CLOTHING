import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { Banknote, ChevronDown, Lock, Plus, ShoppingBag, Tag, Truck, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchApi } from '../../services/api';
import { useCartStore, selectSubtotal } from '../../store/cartStore';
import { useCustomerStore, useOrdersStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useSettings } from '../../hooks/useStore';
import Button from '../../components/ui/Button';
import Img from '../../components/ui/Img';
import { EmptyState, Seo } from '../../components/ui/Primitives';
import { DISTRICT_LIST, provinceOf } from '../../lib/nepal';
import { cn, npr } from '../../lib/utils';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your name'),
  phone: z
    .string()
    .trim()
    .refine((v) => /^(\+?977[- ]?)?9[678]\d{8}$/.test(v.replace(/[\s-]/g, '')) || /^\+\d{8,15}$/.test(v.replace(/[\s-]/g, '')), 'Enter a valid mobile number, e.g. 98XXXXXXXX'),
  district: z.string().trim().min(2, 'Choose your district'),
  municipality: z.string().trim().min(2, 'Enter your city or municipality'),
  address: z.string().trim().min(3, 'Add your street, tole or a landmark'),
  email: z.union([z.string().trim().email('That email doesn’t look right'), z.literal('')]).optional(),
  note: z.string().max(500).optional(),
  remember: z.boolean().optional(),
  website: z.string().optional(),
});

function useDebounced(value, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function Field({ label, error, hint, children, optional }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-[13px] font-medium">
        {label}
        {optional && <span className="font-normal text-mute">Optional</span>}
      </span>
      {children}
      <AnimatePresence>
        {error ? (
          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 flex items-center gap-1 text-[13px] text-danger">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </motion.span>
        ) : hint ? (
          <span className="mt-1.5 block text-[12px] text-mute">{hint}</span>
        ) : null}
      </AnimatePresence>
    </label>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const localSubtotal = useCartStore(selectSubtotal);
  const { clearCart, syncFromQuote, updateQuantity, removeItem } = useCartStore();
  const saveOrder = useOrdersStore((s) => s.saveOrder);
  const { details, remember, forget } = useCustomerStore();
  const user = useAuthStore((s) => s.user);
  const { data: settings } = useSettings();
  const methods = settings?.paymentMethods || [];
  const [payment, setPayment] = useState('cod');
  const [showEmail, setShowEmail] = useState(!!details?.email);
  const [showNote, setShowNote] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [coupon, setCoupon] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: details?.fullName || user?.name || '',
      phone: details?.phone || user?.phone || '',
      district: details?.district || defaultAddr?.district || '',
      municipality: details?.municipality || defaultAddr?.municipality || '',
      address: details?.address || defaultAddr?.address || '',
      email: details?.email || user?.email || '',
      note: '',
      remember: true,
      website: '',
    },
  });

  // Fill from account once it loads (only empty fields)
  useEffect(() => {
    if (!user || details) return;
    if (user.name) setValue('fullName', user.name);
    if (user.phone) setValue('phone', user.phone);
    if (user.email) setValue('email', user.email);
    if (defaultAddr) {
      setValue('district', defaultAddr.district);
      setValue('municipality', defaultAddr.municipality);
      setValue('address', defaultAddr.address);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const district = useDebounced(useWatch({ control, name: 'district' }));
  const municipality = useDebounced(useWatch({ control, name: 'municipality' }));
  const lineKey = items.map((i) => `${i.variantId}:${i.quantity}`).join('|');

  const { data: quote, isFetching: quoting } = useQuery({
    queryKey: ['quote', lineKey, district, municipality, coupon],
    queryFn: () =>
      fetchApi('/orders/quote', {
        method: 'POST',
        body: JSON.stringify({ items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })), couponCode: coupon || undefined, district, municipality }),
      }),
    enabled: items.length > 0,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (quote?.lines) syncFromQuote(quote.lines);
  }, [quote]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (coupon && quote?.couponError) toast.error(quote.couponError);
  }, [quote?.couponError, coupon]);

  const issues = useMemo(() => (quote?.lines || []).filter((l) => l.status !== 'ok'), [quote]);
  const unavailable = items.filter((i) => quote && !quote.lines.some((l) => l.variantId === i.variantId));

  const fixBag = () => {
    issues.forEach((l) => (l.status === 'limited' ? updateQuantity(l.variantId, l.available) : removeItem(l.variantId)));
    unavailable.forEach((i) => removeItem(i.variantId));
    toast.success('Your bag has been updated');
  };

  const place = useMutation({
    mutationFn: (v) =>
      fetchApi('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          customer: { fullName: v.fullName, phone: v.phone, email: v.email || '' },
          shippingAddress: {
            province: provinceOf(v.district),
            district: v.district,
            municipality: v.municipality,
            area: v.municipality,
            address: v.address,
            landmark: '',
          },
          paymentMethod: payment,
          couponCode: quote?.coupon?.code || undefined,
          customerNote: v.note || '',
          website: v.website,
        }),
      }),
    onSuccess: (res, v) => {
      saveOrder({
        orderNumber: res.orderNumber,
        accessKey: res.accessKey,
        total: res.total,
        createdAt: new Date().toISOString(),
        itemCount: items.reduce((n, i) => n + i.quantity, 0),
        preview: items.map((i) => i.name).slice(0, 2).join(', '),
        image: items[0]?.image?.url || '',
      });
      if (v.remember) {
        remember({ fullName: v.fullName, phone: v.phone, district: v.district, municipality: v.municipality, address: v.address, email: v.email });
      } else forget();
      clearCart();
      navigate(`/order-success/${res.orderNumber}?key=${res.accessKey}`, { replace: true, state: { justPlaced: true } });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  if (!items.length && !place.isSuccess) {
    return (
      <EmptyState icon={ShoppingBag} title="Your bag is empty" body="Add a few pieces and come back to check out." action={<Button to="/shop">Browse the collection</Button>} />
    );
  }

  const subtotal = quote?.subtotal ?? localSubtotal;
  const total = quote?.total ?? localSubtotal;
  const blocked = issues.length > 0 || unavailable.length > 0;
  const onSubmit = handleSubmit((v) => {
    if (blocked) {
      toast.error('Some items in your bag changed — please review them.');
      return;
    }
    place.mutate(v);
  });

  const Summary = (
    <div className="space-y-5">
      <ul className="space-y-4">
        {items.map((i) => {
          const issue = issues.find((l) => l.variantId === i.variantId);
          const gone = unavailable.includes(i);
          return (
            <li key={i.variantId} className="flex gap-3">
              <div className="relative w-16 shrink-0">
                <Img src={i.image?.url} alt={i.name} ratio="4/5" width={160} sizes="64px" className="rounded-xl" />
                <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-ivory">{i.quantity}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{i.name}</div>
                {Object.values(i.optionValues || {}).length > 0 && <div className="text-[13px] text-mute">{Object.values(i.optionValues).join(' · ')}</div>}
                {(issue || gone) && (
                  <div className="mt-1 text-[12px] font-medium text-danger">
                    {gone || issue.status !== 'limited' ? 'No longer available' : `Only ${issue.available} left`}
                  </div>
                )}
              </div>
              <div className="text-sm font-medium tabular-nums">{npr(i.unitPrice * i.quantity)}</div>
            </li>
          );
        })}
      </ul>

      {blocked && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-danger/8 p-3 text-[13px] text-danger">
          Some items changed since you added them.
          <button type="button" onClick={fixBag} className="shrink-0 rounded-full bg-danger px-3 py-1.5 font-medium text-white">Update bag</button>
        </div>
      )}

      <div className="border-t border-line pt-4">
        {quote?.coupon ? (
          <div className="flex items-center justify-between rounded-2xl bg-success/10 px-4 py-3 text-sm text-success">
            <span className="flex items-center gap-2"><Tag className="h-4 w-4" /> <b>{quote.coupon.code}</b> applied</span>
            <button type="button" onClick={() => { setCoupon(''); setPromoInput(''); }} aria-label="Remove code"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <>
            <button type="button" onClick={() => setPromoOpen(!promoOpen)} className="flex w-full items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2"><Tag className="h-4 w-4 text-brand" /> Have a promo code?</span>
              <ChevronDown className={cn('h-4 w-4 transition', promoOpen && 'rotate-180')} />
            </button>
            <AnimatePresence initial={false}>
              {promoOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex gap-2 pt-3">
                    <input value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="Enter code" className="field py-2.5 uppercase" aria-label="Promo code" />
                    <Button type="button" variant="outline" onClick={() => setCoupon(promoInput.trim())} disabled={!promoInput.trim()}>Apply</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <dl className="space-y-2.5 border-t border-line pt-4 text-[15px]">
        <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd className="tabular-nums">{npr(subtotal)}</dd></div>
        {quote?.discount > 0 && (
          <div className="flex justify-between text-success"><dt>Discount</dt><dd className="tabular-nums">−{npr(quote.discount)}</dd></div>
        )}
        <div className="flex justify-between">
          <dt className="text-mute">Delivery</dt>
          <dd className="tabular-nums">
            {!district ? <span className="text-[13px] text-mute">Add district</span> : quote?.delivery?.isFree ? <span className="font-medium text-success">Free</span> : npr(quote?.delivery?.charge)}
          </dd>
        </div>
        {district && quote?.delivery && (
          <div className="flex items-start gap-2 rounded-xl bg-sand px-3 py-2.5 text-[12.5px] leading-snug text-mute">
            <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            <span>{quote.delivery.message}{quote.delivery.estimatedDays ? ` · Arrives in ${quote.delivery.estimatedDays}` : ''}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <dt className="font-medium">Total</dt>
          <dd className="flex items-center gap-2 font-display text-[1.7rem] font-medium tabular-nums">
            {quoting && <Loader2 className="h-4 w-4 animate-spin text-mute" />}
            {npr(total)}
          </dd>
        </div>
      </dl>
    </div>
  );

  return (
    <div className="container-x pb-32 pt-6 md:pb-16 md:pt-12">
      <Seo title="Checkout" />
      <div className="mb-8 flex items-end justify-between md:mb-12">
        <div>
          <div className="eyebrow mb-3 text-brand">Almost yours</div>
          <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-medium leading-none">Checkout</h1>
        </div>
        <span className="hidden items-center gap-2 text-sm text-mute sm:flex"><Lock className="h-4 w-4" /> No account needed</span>
      </div>

      {/* Mobile summary toggle */}
      <div className="mb-6 overflow-hidden rounded-[24px] border border-line bg-white md:hidden">
        <button type="button" onClick={() => setSummaryOpen(!summaryOpen)} className="flex w-full items-center justify-between px-5 py-4 text-sm font-medium">
          <span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> {summaryOpen ? 'Hide' : 'Show'} order summary</span>
          <span className="flex items-center gap-2 font-display text-lg">{npr(total)}<ChevronDown className={cn('h-4 w-4 transition', summaryOpen && 'rotate-180')} /></span>
        </button>
        <AnimatePresence initial={false}>
          {summaryOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="border-t border-line p-5">{Summary}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={onSubmit} noValidate className="grid gap-8 md:grid-cols-[1.25fr_1fr] lg:gap-14">
        <div className="space-y-6">
          <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register('website')} aria-hidden />

          <section className="rounded-[28px] border border-line bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm font-medium text-ivory">1</span>
              <h2 className="text-xl font-medium">Where should we deliver?</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" error={errors.fullName?.message}>
                <input className="field" autoComplete="name" placeholder="Your name" aria-invalid={!!errors.fullName} {...register('fullName')} />
              </Field>
              <Field label="Mobile number" error={errors.phone?.message} hint="We'll call to confirm delivery">
                <input className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="98XXXXXXXX" aria-invalid={!!errors.phone} {...register('phone')} />
              </Field>
              <Field label="District" error={errors.district?.message}>
                <input className="field" list="np-districts" autoComplete="address-level2" placeholder="e.g. Morang" aria-invalid={!!errors.district} {...register('district')} />
                <datalist id="np-districts">
                  {DISTRICT_LIST.map((d) => <option key={d} value={d} />)}
                </datalist>
              </Field>
              <Field label="City / Municipality" error={errors.municipality?.message}>
                <input className="field" autoComplete="address-level3" placeholder="e.g. Biratnagar" aria-invalid={!!errors.municipality} {...register('municipality')} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address & landmark" error={errors.address?.message}>
                  <textarea rows={2} className="field resize-none" autoComplete="street-address" placeholder="Tole / street, house no., near a landmark" aria-invalid={!!errors.address} {...register('address')} />
                </Field>
              </div>

              <div className="flex flex-wrap gap-2 sm:col-span-2">
                {!showEmail && (
                  <button type="button" onClick={() => setShowEmail(true)} className="flex items-center gap-1.5 rounded-full bg-sand px-4 py-2 text-[13px] font-medium hover:bg-champagne/50">
                    <Plus className="h-3.5 w-3.5" /> Email for updates
                  </button>
                )}
                {!showNote && (
                  <button type="button" onClick={() => setShowNote(true)} className="flex items-center gap-1.5 rounded-full bg-sand px-4 py-2 text-[13px] font-medium hover:bg-champagne/50">
                    <Plus className="h-3.5 w-3.5" /> Delivery note
                  </button>
                )}
              </div>
              <AnimatePresence>
                {showEmail && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden sm:col-span-2">
                    <Field label="Email" optional error={errors.email?.message}>
                      <input className="field" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!errors.email} {...register('email')} />
                    </Field>
                  </motion.div>
                )}
                {showNote && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden sm:col-span-2">
                    <Field label="Note for delivery" optional>
                      <input className="field" placeholder="e.g. Call before arriving" {...register('note')} />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-white p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm font-medium text-ivory">2</span>
              <h2 className="text-xl font-medium">Payment</h2>
            </div>
            <div className="space-y-3">
              {(methods.length ? methods : [{ id: 'cod', label: 'Cash on delivery', instructions: 'Pay when your order arrives.' }]).map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={cn('flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition', payment === m.id ? 'border-ink bg-ivory ring-1 ring-ink' : 'border-line hover:border-ink/40')}
                  aria-pressed={payment === m.id}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-champagne/60 text-brand-deep"><Banknote className="h-5 w-5" /></span>
                  <span className="flex-1">
                    <span className="block font-medium">{m.label}</span>
                    <span className="block text-[13px] text-mute">{m.instructions}</span>
                  </span>
                  <span className={cn('grid h-6 w-6 place-items-center rounded-full border-2', payment === m.id ? 'border-ink bg-ink text-ivory' : 'border-line')}>
                    {payment === m.id && <Check className="h-3.5 w-3.5" />}
                  </span>
                </button>
              ))}
            </div>
            <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" className="h-5 w-5 accent-ink" {...register('remember')} />
              Save my details on this device for faster checkout
            </label>
          </section>

          <Button type="submit" size="lg" className="hidden w-full md:flex" loading={place.isPending} disabled={blocked}>
            Place order · {npr(total)}
          </Button>
          <p className="hidden text-center text-[13px] text-mute md:block">
            Your order is saved to this device — find it anytime in <Link to="/orders" className="underline underline-offset-4">My orders</Link>.
          </p>
        </div>

        <aside className="hidden md:block">
          <div className="sticky top-24 rounded-[28px] bg-sand p-6 lg:p-8">
            <h2 className="mb-6 text-xl font-medium">Order summary</h2>
            {Summary}
          </div>
        </aside>

        {/* Mobile sticky submit */}
        <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-line bg-ivory/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
          <Button type="submit" size="lg" className="w-full" loading={place.isPending} disabled={blocked}>
            Place order · {npr(total)}
          </Button>
          <p className="mt-2 text-center text-[11.5px] text-mute">Pay cash when it arrives · Saved to this device</p>
        </div>
      </form>
    </div>
  );
}

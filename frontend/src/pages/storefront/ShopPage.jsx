import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { SlidersHorizontal, ChevronDown, X, Check, LayoutGrid, Grid3x3, SearchX, Loader2 } from 'lucide-react';
import { fetchApi } from '../../services/api';
import ProductCard, { ProductCardSkeleton } from '../../components/product/ProductCard';
import { Drawer } from '../../components/ui/Overlay';
import Button from '../../components/ui/Button';
import { EmptyState, Seo } from '../../components/ui/Primitives';
import { useCategories } from '../../hooks/useStore';
import { cn, npr } from '../../lib/utils';

const SORTS = [
  { id: 'newest', label: 'Newest' },
  { id: 'best_selling', label: 'Best selling' },
  { id: 'popular', label: 'Most popular' },
  { id: 'price_asc', label: 'Price: low to high' },
  { id: 'price_desc', label: 'Price: high to low' },
];
const PRICES = [
  { label: 'Under Rs. 1,500', min: '', max: '1500' },
  { label: 'Rs. 1,500 – 2,500', min: '1500', max: '2500' },
  { label: 'Rs. 2,500 – 3,500', min: '2500', max: '3500' },
  { label: 'Over Rs. 3,500', min: '3500', max: '' },
];
const FILTER_KEYS = ['sizes', 'colors', 'minPrice', 'maxPrice', 'availability', 'flag', 'q'];
const PAGE = 12;

export default function ShopPage() {
  const { categorySlug } = useParams();
  const [params, setParams] = useSearchParams();
  const legacyCategory = params.get('category');

  const { data: categories = [] } = useCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dense, setDense] = useState(false);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (categorySlug) q.set('category', categorySlug);
    FILTER_KEYS.concat('sort').forEach((k) => params.get(k) && q.set(k, params.get(k)));
    return q;
  }, [categorySlug, params]);
  const queryString = query.toString();

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, isError, refetch } = useInfiniteQuery({
    queryKey: ['shop', queryString],
    queryFn: ({ pageParam }) => fetchApi(`/products?${queryString}&limit=${PAGE}&page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
  });
  const products = data?.pages.flatMap((p) => p.items) || [];
  const total = data?.pages[0]?.meta.total ?? 0;

  const { data: facets } = useQuery({
    queryKey: ['facets', categorySlug || ''],
    queryFn: () => fetchApi(`/products/filters${categorySlug ? `?category=${categorySlug}` : ''}`),
    staleTime: 5 * 60 * 1000,
  });

  // Infinite scroll sentinel
  const sentinel = useRef(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && !isFetchingNextPage && fetchNextPage(), { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (legacyCategory) return <Navigate to={`/shop/${legacyCategory}`} replace />;

  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };
  const list = (k) => (params.get(k) ? params.get(k).split(',') : []);
  const toggleIn = (k, v) => {
    const cur = list(k);
    set({ [k]: (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(',') });
  };
  const clearAll = () => setParams(new URLSearchParams(params.get('sort') ? { sort: params.get('sort') } : {}), { replace: true });

  const chips = [
    ...list('sizes').map((v) => ({ label: `Size ${v}`, onRemove: () => toggleIn('sizes', v) })),
    ...list('colors').map((v) => ({ label: v, onRemove: () => toggleIn('colors', v) })),
    ...(params.get('minPrice') || params.get('maxPrice')
      ? [{ label: PRICES.find((p) => p.min === (params.get('minPrice') || '') && p.max === (params.get('maxPrice') || ''))?.label || 'Price', onRemove: () => set({ minPrice: '', maxPrice: '' }) }]
      : []),
    ...(params.get('availability') ? [{ label: 'In stock', onRemove: () => set({ availability: '' }) }] : []),
    ...(params.get('flag') === 'sale' ? [{ label: 'On sale', onRemove: () => set({ flag: '' }) }] : []),
    ...(params.get('flag') === 'new' ? [{ label: 'New in', onRemove: () => set({ flag: '' }) }] : []),
    ...(params.get('q') ? [{ label: `“${params.get('q')}”`, onRemove: () => set({ q: '' }) }] : []),
  ];
  const activeCount = chips.length;

  const title = params.get('q')
    ? `Results for “${params.get('q')}”`
    : category?.name || (params.get('flag') === 'new' ? 'New in' : params.get('flag') === 'sale' ? 'On sale' : 'All products');

  return (
    <div className="pb-10">
      <Seo title={title} description={category?.description || 'Shop contemporary everyday fashion at Amberk Clothing.'} />

      {/* Heading */}
      <section className="container-x pb-8 pt-10 md:pt-16">
        <nav className="mb-6 flex items-center gap-2 text-[13px] text-mute" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          {category && (
            <>
              <span>/</span>
              <span className="text-ink">{category.name}</span>
            </>
          )}
        </nav>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.6rem,7vw,6rem)] font-medium leading-[0.95] tracking-[-0.03em]"
          >
            {title}
            <sup className="ml-2 align-super font-sans text-base font-medium text-mute md:text-lg">{isLoading ? '' : total}</sup>
          </motion.h1>
          {category?.description && <p className="max-w-sm text-mute">{category.description}</p>}
        </div>
      </section>

      {/* Category pills */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-6 md:px-8 xl:px-12">
        <Pill to={`/shop${params.toString() ? '' : ''}`} active={!categorySlug}>All</Pill>
        {categories.map((c) => (
          <Pill key={c.id} to={`/shop/${c.slug}`} active={c.slug === categorySlug}>
            {c.name}
          </Pill>
        ))}
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-30 border-y border-line bg-ivory/90 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center gap-3">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-ink/80 px-4 text-sm font-medium transition hover:bg-ink hover:text-ivory"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">{activeCount}</span>}
          </button>

          <div className="no-scrollbar hidden min-w-0 flex-1 gap-2 overflow-x-auto md:flex">
            <AnimatePresence initial={false}>
              {chips.map((c) => (
                <motion.button
                  layout
                  key={c.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={c.onRemove}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-sand pl-3.5 pr-2.5 text-[13px] font-medium hover:bg-champagne/60"
                >
                  {c.label} <X className="h-3.5 w-3.5" />
                </motion.button>
              ))}
            </AnimatePresence>
            {chips.length > 1 && (
              <button onClick={clearAll} className="shrink-0 px-2 text-[13px] font-medium text-mute underline-offset-4 hover:text-ink hover:underline">
                Clear all
              </button>
            )}
          </div>
          <div className="flex-1 md:hidden" />

          <SortMenu value={params.get('sort') || 'newest'} onChange={(v) => set({ sort: v === 'newest' ? '' : v })} />
          <div className="hidden items-center rounded-full border border-line p-1 lg:flex">
            <button onClick={() => setDense(false)} className={cn('grid h-8 w-8 place-items-center rounded-full', !dense && 'bg-ink text-ivory')} aria-label="Large grid">
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setDense(true)} className={cn('grid h-8 w-8 place-items-center rounded-full', dense && 'bg-ink text-ivory')} aria-label="Compact grid">
              <Grid3x3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="container-x pt-10">
        {isError ? (
          <EmptyState title="Something went wrong" body="We couldn't load products." action={<Button onClick={() => refetch()}>Try again</Button>} />
        ) : isLoading ? (
          <div className={cn('grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6', dense ? 'lg:grid-cols-5' : 'md:grid-cols-3 lg:grid-cols-4')}>
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No matches found"
            body="Try removing a filter or browsing another collection."
            action={<Button onClick={clearAll}>Clear filters</Button>}
          />
        ) : (
          <>
            <motion.div layout className={cn('grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6', dense ? 'md:grid-cols-4 lg:grid-cols-5' : 'md:grid-cols-3 lg:grid-cols-4')}>
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: (i % PAGE) * 0.035 }}
                >
                  <ProductCard product={p} priority={i < 4} />
                </motion.div>
              ))}
            </motion.div>
            <div ref={sentinel} className="flex justify-center py-14">
              {isFetchingNextPage ? (
                <Loader2 className="h-6 w-6 animate-spin text-mute" />
              ) : hasNextPage ? (
                <Button variant="outline" onClick={() => fetchNextPage()}>Load more</Button>
              ) : (
                <p className="text-sm text-mute">You've seen all {total} pieces</p>
              )}
            </div>
          </>
        )}
      </section>

      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        facets={facets}
        params={params}
        list={list}
        toggleIn={toggleIn}
        set={set}
        clearAll={clearAll}
        total={total}
        loading={isLoading}
      />
    </div>
  );
}

function Pill({ to, active, children }) {
  return (
    <Link
      to={to}
      className={cn(
        'shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition',
        active ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink'
      )}
    >
      {children}
    </Link>
  );
}

function SortMenu({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const current = SORTS.find((s) => s.id === value) || SORTS[0];
  return (
    <div ref={ref} className="relative shrink-0">
      <button onClick={() => setOpen(!open)} className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium hover:bg-ink/5" aria-haspopup="listbox" aria-expanded={open}>
        <span className="hidden text-mute sm:inline">Sort:</span> {current.label}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 z-40 w-56 origin-top-right overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-xl"
          >
            {SORTS.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => {
                    onChange(s.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-sand"
                  role="option"
                  aria-selected={s.id === value}
                >
                  {s.label}
                  {s.id === value && <Check className="h-4 w-4 text-brand" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterDrawer({ open, onClose, facets, params, list, toggleIn, set, clearAll, total, loading }) {
  const sizes = facets?.sizes || [];
  const colors = facets?.colors || [];
  const minP = params.get('minPrice') || '';
  const maxP = params.get('maxPrice') || '';

  const Section = ({ title, children }) => (
    <div className="border-b border-line py-7">
      <div className="mb-4 text-sm font-semibold">{title}</div>
      {children}
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filters"
      footer={
        <div className="flex gap-3 border-t border-line px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <Button variant="outline" onClick={clearAll} className="flex-1">Clear</Button>
          <Button onClick={onClose} className="flex-[2]">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Show ${total} ${total === 1 ? 'result' : 'results'}`}
          </Button>
        </div>
      }
    >
      <div className="px-6">
        <Section title="Price">
          <div className="flex flex-wrap gap-2">
            {PRICES.map((p) => {
              const active = minP === p.min && maxP === p.max;
              return (
                <button
                  key={p.label}
                  onClick={() => set(active ? { minPrice: '', maxPrice: '' } : { minPrice: p.min, maxPrice: p.max })}
                  className={cn('rounded-full border px-4 py-2.5 text-sm transition', active ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink')}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          {facets?.priceRange?.max > 0 && (
            <p className="mt-3 text-[13px] text-mute">Prices range from {npr(facets.priceRange.min)} to {npr(facets.priceRange.max)}</p>
          )}
        </Section>

        {sizes.length > 0 && (
          <Section title="Size">
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const active = list('sizes').includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleIn('sizes', s)}
                    className={cn('h-11 min-w-12 rounded-full border px-4 text-sm font-medium transition', active ? 'border-ink bg-ink text-ivory' : 'border-line bg-white hover:border-ink')}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {colors.length > 0 && (
          <Section title="Colour">
            <div className="grid grid-cols-2 gap-2">
              {colors.map((c) => {
                const active = list('colors').includes(c.value);
                return (
                  <button
                    key={c.value}
                    onClick={() => toggleIn('colors', c.value)}
                    className={cn('flex items-center gap-3 rounded-full border bg-white p-1.5 pr-4 text-left text-sm transition', active ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-ink/40')}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/10" style={{ background: c.swatch || '#ddd' }}>
                      {active && <Check className="h-4 w-4 text-white mix-blend-difference" />}
                    </span>
                    <span className="truncate">{c.value}</span>
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        <Section title="Show only">
          <div className="space-y-3">
            <Toggle label="In stock" checked={params.get('availability') === 'in_stock'} onChange={(v) => set({ availability: v ? 'in_stock' : '' })} />
            <Toggle label="On sale" checked={params.get('flag') === 'sale'} onChange={(v) => set({ flag: v ? 'sale' : '' })} />
            <Toggle label="New arrivals" checked={params.get('flag') === 'new'} onChange={(v) => set({ flag: v ? 'new' : '' })} />
          </div>
        </Section>
      </div>
    </Drawer>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between py-1 text-[15px]">
      {label}
      <span className={cn('relative h-7 w-12 rounded-full transition-colors', checked ? 'bg-ink' : 'bg-line')}>
        <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }} className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow', checked ? 'right-1' : 'left-1')} />
      </span>
    </button>
  );
}

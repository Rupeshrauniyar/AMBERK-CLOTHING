import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { Truck, RotateCcw, Banknote, Link2, Check, Share2, Star, ShoppingBag } from 'lucide-react';
import { FacebookIcon as Facebook } from '../../components/ui/BrandIcons';
import { fetchApi } from '../../services/api';
import Gallery from '../../components/product/Gallery';
import PurchasePanel from '../../components/product/PurchasePanel';
import ProductCarousel from '../../components/product/ProductCarousel';
import Button from '../../components/ui/Button';
import { Accordion, Price, Seo, Skeleton, EmptyState } from '../../components/ui/Primitives';
import { useVariantSelection, toCartLine } from '../../hooks/useVariantSelection';
import { useRecentStore, useUiStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { useSettings } from '../../hooks/useStore';
import { npr } from '../../lib/utils';
import { toast } from 'sonner';

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35ZM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.44 9.44 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47a9.4 9.4 0 0 1 6.7 2.78 9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46Zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2.01.52 3.97 1.52 5.7L.55 23.63l6.05-1.59a11.37 11.37 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.34-8.06Z" />
    </svg>
  );
}

function ShareRow({ product, price }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/item/${product.slug}` : product.url;
  const text = `${product.name} — ${npr(price)} at Amberk Clothing`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };
  const native = async () => {
    try {
      await navigator.share({ title: product.name, text, url });
    } catch {
      /* dismissed */
    }
  };
  const btn = 'grid h-10 w-10 place-items-center rounded-full border border-line bg-white transition hover:border-ink';
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-[13px] text-mute">Share</span>
      <a className={btn} href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp">
        <WhatsAppIcon className="h-4 w-4" />
      </a>
      <a className={btn} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook">
        <Facebook className="h-4 w-4" />
      </a>
      <button className={btn} onClick={copy} aria-label="Copy link">
        {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
      </button>
      {typeof navigator !== 'undefined' && navigator.share && (
        <button className={btn} onClick={native} aria-label="More sharing options">
          <Share2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function Paragraphs({ text }) {
  return String(text || '')
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((p, i) => <p key={i} className="mb-3 last:mb-0">{p}</p>);
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchApi(`/products/${slug}`),
    retry: (n, e) => e?.status !== 404 && n < 2,
  });

  if (product?.redirectTo) return <Navigate to={`/item/${product.redirectTo}`} replace />;

  if (isLoading) {
    return (
      <div className="container-x grid gap-10 py-8 md:grid-cols-[1.15fr_1fr] lg:gap-16">
        <Skeleton className="aspect-[4/5] rounded-[28px]" />
        <div className="space-y-5 pt-6">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-14 w-4/5" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24" />
          <Skeleton className="h-14 rounded-full" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title={error?.status === 404 ? 'This piece is no longer available' : 'Something went wrong'}
        body={error?.status === 404 ? 'It may have sold out or been retired. Explore what is new instead.' : 'Please try again in a moment.'}
        action={<Button to="/shop">Browse the collection</Button>}
      />
    );
  }

  return <ProductView product={product} />;
}

function ProductView({ product }) {
  const selection = useVariantSelection(product);
  const { data: settings } = useSettings();
  const pushRecent = useRecentStore((s) => s.push);
  const recent = useRecentStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUiStore((s) => s.openCart);
  const [showBar, setShowBar] = useState(false);

  const { data: related = [] } = useQuery({
    queryKey: ['related', product.slug],
    queryFn: () => fetchApi(`/products/${product.slug}/related`),
  });

  useEffect(() => {
    pushRecent({
      id: product.id, name: product.name, slug: product.slug, images: product.images.slice(0, 2), price: product.price,
      compareAtPrice: product.compareAtPrice, discountPercent: product.discountPercent, category: product.category,
      inStock: product.inStock, newArrival: product.newArrival, colors: product.colors, ratingAvg: product.ratingAvg, ratingCount: product.ratingCount,
    });
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const policies = settings?.policies || {};
  const delivery = settings?.delivery;
  const recentOthers = recent.filter((r) => r.id !== product.id);

  const mobileAdd = () => {
    if (!selection.variant) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast('Choose your size first', { description: 'Pick an option above to add this to your bag.' });
      return;
    }
    if (selection.variant.stock <= 0) return;
    addItem(toCartLine(product, selection.variant, 1));
    openCart();
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.seo?.description || product.shortDescription,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand || 'Amberk Clothing' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NPR',
      price: selection.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: product.url,
    },
    ...(product.ratingCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.ratingAvg, reviewCount: product.ratingCount } } : {}),
  };

  return (
    <>
      <Seo title={product.seo?.title || product.name} description={product.seo?.description || product.shortDescription} image={product.seo?.ogImage} url={product.url} type="product" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      <div className="container-x pt-4 md:pt-8">
        <nav className="mb-5 hidden items-center gap-2 text-[13px] text-mute md:flex" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/shop/${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="truncate text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Gallery images={product.images} name={product.name} />

          <div className="md:sticky md:top-24 md:self-start">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex items-center gap-3">
                {product.category && (
                  <Link to={`/shop/${product.category.slug}`} className="eyebrow text-brand hover:text-brand-deep">{product.category.name}</Link>
                )}
                {product.newArrival && <span className="eyebrow rounded-full bg-sand px-2.5 py-1 text-[10px]">New</span>}
              </div>
              <h1 className="mt-3 text-[clamp(2rem,3.6vw,3.2rem)] font-medium leading-[1.02]">{product.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Price price={selection.price} compareAt={selection.compareAt} size="lg" />
                {product.ratingCount > 0 && (
                  <span className="flex items-center gap-1 text-sm text-mute">
                    <Star className="h-4 w-4 fill-brand text-brand" /> {product.ratingAvg} ({product.ratingCount})
                  </span>
                )}
              </div>
              {product.shortDescription && <p className="mt-5 text-[16px] leading-relaxed text-mute">{product.shortDescription}</p>}

              <div className="mt-8">
                <PurchasePanel product={product} selection={selection} />
              </div>

              <div className="mt-8 grid grid-cols-3 gap-2 text-center text-[12px] leading-tight">
                <div className="rounded-2xl bg-sand p-4"><Banknote className="mx-auto mb-2 h-5 w-5 text-brand" />Cash on delivery</div>
                <div className="rounded-2xl bg-sand p-4"><Truck className="mx-auto mb-2 h-5 w-5 text-brand" />Home delivery</div>
                <div className="rounded-2xl bg-sand p-4"><RotateCcw className="mx-auto mb-2 h-5 w-5 text-brand" />Easy exchange</div>
              </div>

              <div className="mt-6">
                <ShareRow product={product} price={selection.price} />
              </div>

              <div className="mt-8 border-t border-line">
                {product.description && (
                  <Accordion title="Description" defaultOpen>
                    <Paragraphs text={product.description} />
                  </Accordion>
                )}
                {product.specifications?.length > 0 && (
                  <Accordion title="Details & fit">
                    <dl className="divide-y divide-line">
                      {product.specifications.map((s, i) => (
                        <div key={i} className="flex justify-between gap-4 py-2.5">
                          <dt>{s.label}</dt>
                          <dd className="text-right text-ink">{s.value}</dd>
                        </div>
                      ))}
                      <div className="flex justify-between gap-4 py-2.5">
                        <dt>SKU</dt>
                        <dd className="font-mono text-[13px] text-ink">{selection.variant?.sku || product.sku}</dd>
                      </div>
                    </dl>
                  </Accordion>
                )}
                {(delivery?.info || policies.returnPolicySummary) && (
                  <Accordion title="Delivery & returns">
                    {delivery?.info && <p className="mb-3">{delivery.info}</p>}
                    {policies.returnPolicySummary && <p className="mb-3">{policies.returnPolicySummary}</p>}
                    <Link to="/shipping-and-delivery" className="font-medium text-ink underline underline-offset-4">Delivery info</Link>
                    {' · '}
                    <Link to="/return-and-refund" className="font-medium text-ink underline underline-offset-4">Returns policy</Link>
                  </Accordion>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ProductCarousel eyebrow="You may also like" title="Complete the" accent="look" products={related} />
      {recentOthers.length > 0 && <ProductCarousel eyebrow="Recently viewed" title="Pick up where you" accent="left off" products={recentOthers} />}

      {/* Mobile sticky buy bar */}
      <AnimatePresence>
        {showBar && product.inStock && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[55] border-t border-line bg-ivory/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{product.name}</div>
                <div className="text-[13px] text-mute">
                  {npr(selection.price)}
                  {selection.variant && Object.values(selection.variant.optionValues).length > 0 && ` · ${Object.values(selection.variant.optionValues).join(' / ')}`}
                </div>
              </div>
              <Button onClick={mobileAdd} size="md" disabled={selection.variant?.stock === 0}>
                <ShoppingBag className="h-4 w-4" /> {selection.variant ? 'Add to bag' : 'Choose size'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

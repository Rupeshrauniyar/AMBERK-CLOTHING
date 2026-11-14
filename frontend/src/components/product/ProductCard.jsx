import { memo } from 'react';
import { Link } from 'react-router';
import { Plus, Star } from 'lucide-react';
import Img from '../ui/Img';
import { Badge, Price } from '../ui/Primitives';
import { useUiStore } from '../../store/uiStore';
import { cn } from '../../lib/utils';

/**
 * Editorial product card: hover swaps to the second image, a "+" quick-add opens Quick View
 * (or adds directly when the product has a single variant).
 */
function ProductCard({ product, sizes = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw', priority = false, className }) {
  const openQuickView = useUiStore((s) => s.openQuickView);
  const [a, b] = product.images || [];

  const quickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    openQuickView(product.slug);
  };

  return (
    <Link to={`/item/${product.slug}`} className={cn('group block', className)}>
      <div className="relative overflow-hidden rounded-[18px] bg-sand">
        <Img
          src={a?.url}
          alt={a?.alt || product.name}
          ratio="4/5"
          sizes={sizes}
          priority={priority}
          className="rounded-[18px]"
          imgClassName="group-hover:scale-[1.04]"
        />
        {b && (
          <Img
            src={b.url}
            alt=""
            sizes={sizes}
            className="!absolute inset-0 rounded-[18px] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            imgClassName="scale-[1.04] group-hover:scale-100"
          />
        )}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {!product.inStock && <Badge tone="light">Sold out</Badge>}
          {product.inStock && product.discountPercent > 0 && <Badge tone="brand">−{product.discountPercent}%</Badge>}
          {product.inStock && product.newArrival && <Badge tone="light">New</Badge>}
        </div>

        {product.inStock && (
          <button
            onClick={quickAdd}
            aria-label={`Quick add ${product.name}`}
            className="absolute bottom-3 right-3 flex h-11 items-center gap-0 overflow-hidden rounded-full bg-ivory/95 pl-3 pr-3 text-sm font-medium text-ink shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur transition-all duration-500 ease-[var(--ease-soft)] hover:bg-ink hover:text-ivory md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-500 group-hover:max-w-24 group-hover:pl-1.5">
              Quick add
            </span>
          </button>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3 className="truncate font-sans text-[15px] font-medium tracking-tight">{product.name}</h3>
          <div className="mt-0.5 flex items-center gap-2 text-[13px] text-mute">
            {product.category?.name}
            {product.ratingCount > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-brand text-brand" /> {product.ratingAvg}
              </span>
            )}
          </div>
        </div>
        <Price price={product.price} compareAt={product.compareAtPrice} className="shrink-0 flex-col items-end gap-0 text-right" />
      </div>

      {product.colors?.length > 1 && (
        <div className="mt-2.5 flex gap-1.5 px-0.5">
          {product.colors.slice(0, 5).map((c) => (
            <span key={c.value} title={c.value} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: c.swatch || '#ddd' }} />
          ))}
        </div>
      )}
    </Link>
  );
}

export default memo(ProductCard);

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[4/5] rounded-[18px]" />
      <div className="skeleton mt-4 h-4 w-3/4 rounded-full" />
      <div className="skeleton mt-2 h-3 w-1/3 rounded-full" />
    </div>
  );
}

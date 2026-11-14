import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { Modal } from '../ui/Overlay';
import Img from '../ui/Img';
import { Price, Skeleton } from '../ui/Primitives';
import PurchasePanel from './PurchasePanel';
import { useUiStore } from '../../store/uiStore';
import { fetchApi } from '../../services/api';
import { useVariantSelection } from '../../hooks/useVariantSelection';
import { cn } from '../../lib/utils';

/** Pick a size and add to bag without leaving the current page. */
export default function QuickView() {
  const slug = useUiStore((s) => s.quickViewSlug);
  const close = useUiStore((s) => s.closeQuickView);
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchApi(`/products/${slug}`),
    enabled: !!slug,
  });

  return (
    <Modal open={!!slug} onClose={close} label="Quick view" className="sm:max-w-4xl">
      {isLoading || !product || product.redirectTo ? (
        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <Skeleton className="aspect-[4/5]" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24" />
          </div>
        </div>
      ) : (
        <QuickViewBody product={product} onDone={close} />
      )}
    </Modal>
  );
}

function QuickViewBody({ product, onDone }) {
  const selection = useVariantSelection(product);
  const [active, setActive] = useState(0);
  const images = product.images || [];

  return (
    <div className="grid sm:grid-cols-2">
      <div className="relative bg-sand p-3 sm:rounded-l-[28px]">
        <Img src={images[active]?.url} alt={product.name} ratio="4/5" sizes="(min-width: 640px) 40vw, 100vw" className="rounded-[20px]" />
        {images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {images.slice(0, 5).map((im, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn('w-14 overflow-hidden rounded-xl border-2 transition', i === active ? 'border-ink' : 'border-transparent opacity-60 hover:opacity-100')}
                aria-label={`Image ${i + 1}`}
              >
                <Img src={im.url} ratio="4/5" width={160} sizes="56px" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col p-6 sm:p-8">
        <div className="eyebrow text-brand">{product.category?.name}</div>
        <h2 className="mt-3 pr-10 text-3xl font-medium leading-tight">{product.name}</h2>
        <Price price={selection.price} compareAt={selection.compareAt} size="lg" className="mt-4" />
        {product.shortDescription && <p className="mt-4 text-[15px] leading-relaxed text-mute">{product.shortDescription}</p>}
        <div className="mt-7">
          <PurchasePanel product={product} selection={selection} onAdded={onDone} />
        </div>
        <Link to={`/item/${product.slug}`} onClick={onDone} className="mt-6 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
          View full details <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}


import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import Img from '../ui/Img';
import { useUiStore } from '../../store/uiStore';
import { fetchApi } from '../../services/api';
import { npr } from '../../lib/utils';
import { useCategories } from '../../hooks/useStore';

const EASE = [0.16, 1, 0.3, 1];

function useDebounced(value, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function SearchOverlay() {
  const { searchOpen, closeSearch } = useUiStore();
  const [q, setQ] = useState('');
  const dq = useDebounced(q.trim());
  const navigate = useNavigate();
  const input = useRef(null);
  const { data: categories = [] } = useCategories();

  const { data, isFetching } = useQuery({
    queryKey: ['suggest', dq],
    queryFn: () => fetchApi(`/products/search/suggest?q=${encodeURIComponent(dq)}`),
    enabled: dq.length >= 2,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (!searchOpen) return;
    setTimeout(() => input.current?.focus(), 80);
    const onKey = (e) => e.key === 'Escape' && closeSearch();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [searchOpen, closeSearch]);

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
    closeSearch();
  };

  const products = dq.length >= 2 ? data?.products || [] : [];

  return createPortal(
    <AnimatePresence>
      {searchOpen && (
        <div className="fixed inset-0 z-[85]" role="dialog" aria-modal="true" aria-label="Search">
          <motion.div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeSearch} />
          <motion.div
            className="relative max-h-[90vh] overflow-y-auto rounded-b-[32px] bg-ivory shadow-2xl"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="container-x py-6 md:py-10">
              <form onSubmit={submit} className="flex items-center gap-3 border-b-2 border-ink pb-4">
                <Search className="h-6 w-6 shrink-0 text-mute" />
                <input
                  ref={input}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search tees, linen shirts, trousers…"
                  className="min-w-0 flex-1 bg-transparent font-display text-2xl font-medium outline-none placeholder:text-mute/50 md:text-4xl"
                  aria-label="Search products"
                />
                {isFetching && <Loader2 className="h-5 w-5 animate-spin text-mute" />}
                <button type="button" onClick={closeSearch} className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-ink/5" aria-label="Close search">
                  <X className="h-5 w-5" />
                </button>
              </form>

              {products.length === 0 ? (
                <div className="py-8">
                  <div className="eyebrow mb-4 text-mute">{dq.length >= 2 && !isFetching ? `No matches for “${dq}” — try a collection` : 'Popular collections'}</div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <Link key={c.id} to={`/shop/${c.slug}`} onClick={closeSearch} className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium transition hover:border-ink">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="eyebrow text-mute">Products</div>
                    <button onClick={submit} className="flex items-center gap-1 text-sm font-medium hover:text-brand">
                      See all results <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {products.map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, ease: EASE, duration: 0.5 }}>
                        <Link to={`/item/${p.slug}`} onClick={closeSearch} className="group block">
                          <Img src={p.images?.[0]?.url} alt={p.name} ratio="4/5" width={400} sizes="200px" className="rounded-2xl" imgClassName="group-hover:scale-105" />
                          <div className="mt-2 truncate text-sm font-medium">{p.name}</div>
                          <div className="text-[13px] text-mute">{npr(p.price)}</div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}


import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Search, ShoppingBag, User, Menu, Package, ArrowRight } from 'lucide-react';
import Wordmark from './Wordmark';
import Img from '../ui/Img';
import { useUiStore } from '../../store/uiStore';
import { useCartStore, selectCount } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useCategories, useSettings } from '../../hooks/useStore';
import { cn } from '../../lib/utils';

const EASE = [0.16, 1, 0.3, 1];

function Announcement({ data }) {
  const messages = (data?.messages || []).filter(Boolean);
  if (!data?.isEnabled || !messages.length) return null;
  const loop = [...messages, ...messages, ...messages, ...messages];
  return (
    <div className="relative z-50 overflow-hidden bg-ink text-ivory">
      <div className="flex w-max animate-marquee py-2.5 hover:[animation-play-state:paused]">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {loop.map((m, i) => (
              <span key={i} className="flex items-center text-[12px] font-medium tracking-wide">
                <span className="px-6">{m}</span>
                <span className="h-1 w-1 rounded-full bg-brand" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { data: settings } = useSettings();
  const { data: categories = [] } = useCategories();
  const count = useCartStore(selectCount);
  const { openCart, openSearch, setMenu } = useUiStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 240 && y > prev && !mega);
  });

  useEffect(() => setMega(false), [location.pathname, location.search]);

  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (count) setBump((b) => b + 1);
  }, [count]);

  const navLink = ({ isActive }) =>
    cn(
      'relative py-2 text-[14px] font-medium transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-current after:transition-transform after:duration-500',
      isActive ? 'text-ink after:scale-x-100' : 'text-ink/70 hover:text-ink after:scale-x-0 hover:after:scale-x-100'
    );

  return (
    <>
      <Announcement data={settings?.announcement} />
      <motion.header
        className="sticky top-0 z-40"
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.45, ease: EASE }}
        onMouseLeave={() => setMega(false)}
      >
        <div
          className={cn(
            'transition-[background,box-shadow,border-color] duration-500',
            scrolled || mega || !isHome ? 'border-b border-line/80 bg-ivory/85 backdrop-blur-xl' : 'border-b border-transparent bg-transparent'
          )}
        >
          <div className="container-x grid h-[72px] grid-cols-[1fr_auto_1fr] items-center">
            {/* Left */}
            <div className="flex items-center gap-1">
              <button onClick={() => setMenu(true)} className="-ml-2 grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5 lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
              <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
                <NavLink to="/shop" end className={navLink} onMouseEnter={() => setMega(true)}>
                  Shop
                </NavLink>
                <button className={navLink({ isActive: mega })} onMouseEnter={() => setMega(true)} onClick={() => setMega((m) => !m)} aria-expanded={mega}>
                  Collections
                </button>
                <NavLink to="/shop?flag=new" className={() => navLink({ isActive: location.search.includes('flag=new') })} onMouseEnter={() => setMega(false)}>
                  New in
                </NavLink>
                <NavLink to="/about" className={navLink} onMouseEnter={() => setMega(false)}>
                  About
                </NavLink>
                <NavLink to="/contact" className={navLink} onMouseEnter={() => setMega(false)}>
                  Contact
                </NavLink>
              </nav>
            </div>

            {/* Centre */}
            <Wordmark logo={settings?.store?.logo} />

            {/* Right */}
            <div className="flex items-center justify-end gap-0.5">
              <button onClick={openSearch} className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5" aria-label="Search">
                <Search className="h-[19px] w-[19px]" />
              </button>
              <Link to="/orders" className="hidden h-11 w-11 place-items-center rounded-full hover:bg-ink/5 sm:grid" aria-label="My orders" title="My orders">
                <Package className="h-[19px] w-[19px]" />
              </Link>
              <Link
                to={isAuthenticated ? '/account' : '/account/login'}
                className="hidden h-11 w-11 place-items-center rounded-full hover:bg-ink/5 sm:grid"
                aria-label="Account"
                title="Account"
              >
                <User className="h-[19px] w-[19px]" />
              </Link>
              <button onClick={openCart} className="relative grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5" aria-label={`Bag, ${count} items`}>
                <ShoppingBag className="h-[19px] w-[19px]" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={bump}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: [1.35, 1], opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {mega && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="absolute inset-x-0 top-full hidden border-b border-line bg-ivory/95 backdrop-blur-xl lg:block"
            >
              <div className="container-x grid grid-cols-[220px_1fr] gap-12 py-10">
                <div className="flex flex-col gap-3">
                  <div className="eyebrow mb-2 text-mute">Shop by</div>
                  <Link to="/shop" className="font-display text-2xl font-medium hover:text-brand">All products</Link>
                  <Link to="/shop?flag=new" className="font-display text-2xl font-medium hover:text-brand">New arrivals</Link>
                  <Link to="/shop?sort=best_selling" className="font-display text-2xl font-medium hover:text-brand">Best sellers</Link>
                  <Link to="/shop?flag=sale" className="font-display text-2xl font-medium text-brand-deep hover:text-brand">On sale</Link>
                </div>
                <div className="grid grid-cols-6 gap-4">
                  {categories.slice(0, 6).map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, duration: 0.5, ease: EASE }}>
                      <Link to={`/shop/${c.slug}`} className="group block">
                        <Img src={c.image?.url} alt={c.name} ratio="3/4" width={400} sizes="160px" className="rounded-2xl" imgClassName="group-hover:scale-105" />
                        <div className="mt-3 flex items-center justify-between text-sm font-medium">
                          {c.name}
                          <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}


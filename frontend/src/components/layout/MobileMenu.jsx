import { Link, useLocation } from 'react-router';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Package, User, Search } from 'lucide-react';
import { Drawer } from '../ui/Overlay';
import Wordmark from './Wordmark';
import { useUiStore } from '../../store/uiStore';
import { useCategories } from '../../hooks/useStore';
import { useAuthStore } from '../../store/authStore';

const EASE = [0.16, 1, 0.3, 1];

export default function MobileMenu() {
  const { menuOpen, setMenu, openSearch } = useUiStore();
  const { data: categories = [] } = useCategories();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  useEffect(() => setMenu(false), [location.pathname, location.search, setMenu]);

  const main = [
    { label: 'Shop all', to: '/shop' },
    { label: 'New in', to: '/shop?flag=new' },
    { label: 'Best sellers', to: '/shop?sort=best_selling' },
    { label: 'On sale', to: '/shop?flag=sale' },
  ];

  return (
    <Drawer open={menuOpen} onClose={() => setMenu(false)} side="left" title={<Wordmark />} label="Menu">
      <div className="flex min-h-full flex-col px-6 pb-8 pt-6">
        <button onClick={openSearch} className="field mb-8 flex items-center gap-3 text-left text-mute">
          <Search className="h-4 w-4" /> Search products
        </button>

        <nav className="flex flex-col">
          {main.map((l, i) => (
            <motion.div key={l.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: EASE }}>
              <Link to={l.to} className="flex items-center justify-between border-b border-line py-4 font-display text-[1.7rem] font-medium">
                {l.label}
                <ArrowUpRight className="h-5 w-5 text-mute" />
              </Link>
            </motion.div>
          ))}
        </nav>

        {categories.length > 0 && (
          <div className="mt-8">
            <div className="eyebrow mb-4 text-mute">Collections</div>
            <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6">
              {categories.map((c) => (
                <Link key={c.id} to={`/shop/${c.slug}`} className="shrink-0 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto grid grid-cols-2 gap-3 pt-10">
          <Link to="/orders" className="flex items-center gap-2 rounded-2xl bg-sand p-4 text-sm font-medium">
            <Package className="h-4 w-4 text-brand" /> My orders
          </Link>
          <Link to={isAuthenticated ? '/account' : '/account/login'} className="flex items-center gap-2 rounded-2xl bg-sand p-4 text-sm font-medium">
            <User className="h-4 w-4 text-brand" /> {isAuthenticated ? 'Account' : 'Sign in'}
          </Link>
          <Link to="/track-order" className="col-span-2 text-center text-sm text-mute underline-offset-4 hover:underline">
            Track an order
          </Link>
        </div>
      </div>
    </Drawer>
  );
}


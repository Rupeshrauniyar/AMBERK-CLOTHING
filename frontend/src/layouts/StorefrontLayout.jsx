import { useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MobileMenu from '../components/layout/MobileMenu';
import SearchOverlay from '../components/layout/SearchOverlay';
import OfferPopup from '../components/layout/OfferPopup';
import CartDrawer from '../components/cart/CartDrawer';
import QuickView from '../components/product/QuickView';
import { useAuthStore } from '../store/authStore';

export default function StorefrontLayout() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const reduce = useReducedMotion();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">
        Skip to content
      </a>
      <Header />
      <motion.main
        id="main"
        key={pathname}
        className="flex-1"
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {outlet}
      </motion.main>
      <Footer />
      <MobileMenu />
      <SearchOverlay />
      <CartDrawer />
      <QuickView />
      <OfferPopup />
    </div>
  );
}

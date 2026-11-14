import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import StorefrontLayout from './layouts/StorefrontLayout';
import HomePage from './pages/storefront/HomePage';
import ShopPage from './pages/storefront/ShopPage';
import ProductDetailPage from './pages/storefront/ProductDetailPage';

const CartPage = lazy(() => import('./pages/storefront/CartPage'));
const CheckoutPage = lazy(() => import('./pages/storefront/CheckoutPage'));
const OrderPage = lazy(() => import('./pages/storefront/OrderPage'));
const MyOrdersPage = lazy(() => import('./pages/storefront/MyOrdersPage'));
const TrackOrderPage = lazy(() => import('./pages/storefront/TrackOrderPage'));
const AboutPage = lazy(() => import('./pages/storefront/AboutPage'));
const ContactPage = lazy(() => import('./pages/storefront/ContactPage'));
const PolicyPage = lazy(() => import('./pages/storefront/PolicyPage'));
const LoginPage = lazy(() => import('./pages/storefront/LoginPage'));
const AccountPage = lazy(() => import('./pages/storefront/AccountPage'));
const NotFoundPage = lazy(() => import('./pages/storefront/NotFoundPage'));

// Admin is a separate chunk — never downloaded by shoppers
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage'));

function PageFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:categorySlug" element={<ShopPage />} />
          <Route path="/item/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/login" element={<LoginPage />} />
          <Route path="/privacy-policy" element={<PolicyPage policyKey="privacyPolicy" />} />
          <Route path="/terms-and-conditions" element={<PolicyPage policyKey="terms" />} />
          <Route path="/shipping-and-delivery" element={<PolicyPage policyKey="shippingPolicy" />} />
          <Route path="/return-and-refund" element={<PolicyPage policyKey="returnPolicy" />} />
          <Route path="/not-found" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="homepage" element={<AdminContentPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

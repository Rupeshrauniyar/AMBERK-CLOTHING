import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  ShoppingBag,
  Users,
  Warehouse,
  Tag,
  Sliders,
  Settings,
  LogOut,
  ExternalLink,
  MessageSquare,
  Mail,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, isAdmin, isLoading, checkAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#F0EEE7] flex items-center justify-center">Verifying credentials...</div>;
  }

  if (!isAdmin) return null;

  const navLinks = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Shirt },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Inventory', href: '/admin/inventory', icon: Warehouse },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Homepage Content', href: '/admin/homepage', icon: Sliders },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col md:flex-row text-[#24231F]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#24231F] text-[#F8F7F3] flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-[#383632]">
            <span className="font-serif text-2xl uppercase tracking-widest font-bold text-white block">
              AMBERK
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#C58A38]">
              Biratnagar Management
            </span>
          </div>

          {/* Links */}
          <nav className="p-4 space-y-1 text-xs font-medium uppercase tracking-wider">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 transition-colors ${
                    isActive
                      ? 'bg-[#C58A38] text-white font-bold'
                      : 'text-[#A3A099] hover:bg-[#383632] hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & exit */}
        <div className="p-4 border-t border-[#383632] space-y-3">
          <div className="text-xs text-[#A3A099]">
            <span className="text-white block font-medium">{user?.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-[#C58A38]">{user?.role}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/"
              target="_blank"
              className="text-xs text-[#A3A099] hover:text-white flex items-center gap-1.5"
            >
              <ExternalLink size={13} />
              <span>View Store</span>
            </Link>

            <button
              onClick={logout}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <LogOut size={13} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}


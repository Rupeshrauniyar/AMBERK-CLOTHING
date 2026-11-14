import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../services/api';
import { Link } from 'react-router';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Shirt,
  Users,
  CheckCircle,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['admin-dashboard-summary'],
    queryFn: () => fetchApi('/admin/dashboard'),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-xs">Loading analytics and data from MongoDB...</div>;
  }

  const totals = summary?.totals || { revenue: 0, orders: 0, products: 0, customers: 0 };
  const recentOrders = summary?.recentOrders || [];
  const lowStock = summary?.lowStock || [];
  const topProducts = summary?.topProducts || [];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-medium text-[#24231F]">Executive Overview</h1>
        <p className="text-xs text-[#77746D] mt-1">
          Real-time metrics, live sales revenue, and inventory statuses from Biratnagar store.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-[#E5E1D8] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[#77746D]">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Revenue</span>
            <DollarSign size={18} className="text-[#C58A38]" />
          </div>
          <p className="text-2xl font-bold text-[#24231F]">
            NPR {totals.revenue?.toLocaleString()}
          </p>
          <span className="text-[10px] text-[#77746D] block">From valid fulfilled orders</span>
        </div>

        <div className="bg-white p-6 border border-[#E5E1D8] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[#77746D]">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Orders</span>
            <ShoppingBag size={18} className="text-[#C58A38]" />
          </div>
          <p className="text-2xl font-bold text-[#24231F]">{totals.orders}</p>
          <span className="text-[10px] text-[#77746D] block">All-time customer checkouts</span>
        </div>

        <div className="bg-white p-6 border border-[#E5E1D8] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[#77746D]">
            <span className="text-xs uppercase tracking-wider font-semibold">Published Items</span>
            <Shirt size={18} className="text-[#C58A38]" />
          </div>
          <p className="text-2xl font-bold text-[#24231F]">{totals.publishedProducts}</p>
          <span className="text-[10px] text-[#77746D] block">Active in customer catalogue</span>
        </div>

        <div className="bg-white p-6 border border-[#E5E1D8] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[#77746D]">
            <span className="text-xs uppercase tracking-wider font-semibold">Registered Accounts</span>
            <Users size={18} className="text-[#C58A38]" />
          </div>
          <p className="text-2xl font-bold text-[#24231F]">{totals.customers}</p>
          <span className="text-[10px] text-[#77746D] block">Customer profiles created</span>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white p-6 border border-[#E5E1D8] space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#E5E1D8]">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#24231F]">
              Recent Orders
            </h2>
            <Link to="/admin/orders" className="text-xs text-[#C58A38] font-semibold hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="divide-y divide-[#E5E1D8] overflow-x-auto">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-[#77746D] py-6 text-center">No orders placed yet.</p>
            ) : (
              recentOrders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-xs gap-4">
                  <div>
                    <span className="font-mono font-bold text-[#24231F] block">{o.orderNumber}</span>
                    <span className="text-[#77746D]">
                      {o.customer?.fullName} • {o.itemsPreview}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#24231F] block">
                      NPR {o.total?.toLocaleString()}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#C58A38] bg-[#F0EEE7] px-2 py-0.5 rounded">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white p-6 border border-[#E5E1D8] space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#E5E1D8]">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#24231F] flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-600" />
              <span>Low Stock Alerts</span>
            </h2>
            <Link to="/admin/inventory" className="text-xs text-[#C58A38] font-semibold hover:underline">
              Inventory
            </Link>
          </div>

          <div className="divide-y divide-[#E5E1D8]">
            {lowStock.length === 0 ? (
              <p className="text-xs text-emerald-700 py-6 text-center">
                All variants are sufficiently stocked.
              </p>
            ) : (
              lowStock.map((v, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-[#24231F] block line-clamp-1">
                      {v.productName}
                    </span>
                    <span className="text-[10px] text-[#77746D] font-mono">{v.sku}</span>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 text-[11px] rounded ${
                      v.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {v.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


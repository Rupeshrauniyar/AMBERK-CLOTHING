import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../services/api';
import { Search, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', search, statusFilter],
    queryFn: () => {
      const q = new URLSearchParams();
      if (search) q.set('q', search);
      if (statusFilter) q.set('status', statusFilter);
      return fetchApi(`/admin/orders?${q.toString()}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, paymentStatus }) =>
      fetchApi(`/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, paymentStatus }),
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
      setSelectedOrder(updated);
    },
    onError: (err) => {
      toast.error(err.message || 'Status update failed');
    },
  });

  const handleOpenDetail = async (orderId) => {
    try {
      const order = await fetchApi(`/admin/orders/${orderId}`);
      setSelectedOrder(order);
    } catch {
      toast.error('Failed to load order');
    }
  };

  const orders = ordersData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium text-[#24231F]">Customer Orders</h1>
          <p className="text-xs text-[#77746D] mt-1">
            Dispatch, track, and manage Cash on Delivery orders nationwide.
          </p>
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center bg-white p-3 border border-[#E5E1D8]">
          <Search size={16} className="text-[#77746D] ml-2 mr-3" />
          <input
            type="text"
            placeholder="Search order reference, customer name, phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-[#E5E1D8] text-xs px-4 py-3 uppercase tracking-wider font-semibold focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E5E1D8] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F0EEE7] border-b border-[#E5E1D8] text-[#77746D] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Order Ref</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Destination</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Fulfilment</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E1D8]">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-[#77746D]">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-[#77746D]">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#F8F7F3] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#24231F]">{o.orderNumber}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold block">{o.customer?.fullName}</span>
                    <span className="text-[#77746D] text-[11px]">{o.customer?.phone}</span>
                  </td>
                  <td className="py-3 px-4 text-[#77746D]">{o.district}</td>
                  <td className="py-3 px-4 font-bold text-[#24231F]">
                    NPR {o.total?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize font-bold text-[#C58A38] bg-[#F0EEE7] px-2 py-0.5 rounded text-[11px]">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] uppercase font-semibold text-[#77746D]">
                    {o.paymentStatus}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenDetail(o.id)}
                      className="bg-[#24231F] hover:bg-[#C58A38] text-white px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#E5E1D8] space-y-6">
            <div className="flex justify-between items-start border-b border-[#E5E1D8] pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#77746D] block">
                  Order Management
                </span>
                <h2 className="font-mono text-2xl font-bold text-[#24231F]">
                  {selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#77746D] hover:text-[#24231F] text-xs uppercase tracking-widest font-bold"
              >
                Close
              </button>
            </div>

            {/* Quick Status Modifiers */}
            <div className="bg-[#F0EEE7] p-4 flex flex-wrap items-center gap-4 text-xs">
              <div>
                <label className="block text-[#77746D] mb-1 font-semibold">Fulfilment Status:</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateStatusMutation.mutate({
                      id: selectedOrder.id,
                      status: e.target.value,
                    })
                  }
                  className="bg-white border border-[#E5E1D8] px-3 py-1.5 uppercase font-semibold"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[#77746D] mb-1 font-semibold">Payment Status:</label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) =>
                    updateStatusMutation.mutate({
                      id: selectedOrder.id,
                      paymentStatus: e.target.value,
                    })
                  }
                  className="bg-white border border-[#E5E1D8] px-3 py-1.5 uppercase font-semibold"
                >
                  <option value="cod_due">COD Due</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#24231F]">
                Purchased Pieces
              </h3>
              <div className="divide-y divide-[#E5E1D8] text-xs">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-semibold block">{item.name}</span>
                      <span className="text-[#77746D]">
                        SKU: {item.sku} • Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="font-bold">NPR {item.lineTotal?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t border-[#E5E1D8] pt-4 text-xs space-y-1">
              <h3 className="uppercase tracking-wider font-bold text-[#24231F] mb-2">
                Shipping Destination
              </h3>
              <p>
                <strong>{selectedOrder.shippingAddress?.fullName}</strong> (
                {selectedOrder.shippingAddress?.phone})
              </p>
              <p>{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.area}</p>
              <p>
                {selectedOrder.shippingAddress?.municipality},{' '}
                {selectedOrder.shippingAddress?.district},{' '}
                {selectedOrder.shippingAddress?.province}
              </p>
              {selectedOrder.shippingAddress?.landmark && (
                <p className="text-[#77746D]">
                  Landmark: {selectedOrder.shippingAddress.landmark}
                </p>
              )}
            </div>

            <div className="border-t border-[#E5E1D8] pt-4 flex justify-between text-base font-bold">
              <span>Total Payable</span>
              <span>NPR {selectedOrder.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


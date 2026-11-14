import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../services/api';
import { toast } from 'sonner';

export default function AdminInventoryPage() {
  const queryClient = useQueryClient();
  const [adjustingVariant, setAdjustingVariant] = useState(null);
  const [stockChange, setStockChange] = useState(0);

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['admin-inventory-table'],
    queryFn: () => fetchApi('/admin/inventory'),
  });

  const adjustMutation = useMutation({
    mutationFn: ({ variantId, change }) =>
      fetchApi('/admin/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({ variantId, change, reason: 'adjustment' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-table'] });
      toast.success('Inventory updated');
      setAdjustingVariant(null);
      setStockChange(0);
    },
    onError: (err) => toast.error(err.message || 'Adjustment failed'),
  });

  const handleSaveAdjustment = (e) => {
    e.preventDefault();
    if (!adjustingVariant) return;
    adjustMutation.mutate({
      variantId: adjustingVariant.variantId,
      change: Number(stockChange),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-[#24231F]">Inventory & Stock Control</h1>
        <p className="text-xs text-[#77746D] mt-1">
          Monitor variant-level stock, log movement audits, and adjust quantities directly.
        </p>
      </div>

      <div className="bg-white border border-[#E5E1D8] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F0EEE7] border-b border-[#E5E1D8] text-[#77746D] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Garment</th>
              <th className="py-3 px-4">Variant Options</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Condition</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E1D8]">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-[#77746D]">
                  Loading inventory...
                </td>
              </tr>
            ) : inventory?.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-[#77746D]">
                  No inventory records found.
                </td>
              </tr>
            ) : (
              inventory?.map((row) => (
                <tr key={row.variantId} className="hover:bg-[#F8F7F3]">
                  <td className="py-3 px-4 font-semibold text-[#24231F]">{row.productName}</td>
                  <td className="py-3 px-4 text-[#77746D]">
                    {Object.entries(row.optionValues || {})
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ') || 'Standard'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#77746D]">{row.sku}</td>
                  <td className="py-3 px-4 font-bold text-[#24231F]">{row.stock} units</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        row.stockStatus === 'out'
                          ? 'bg-red-100 text-red-700'
                          : row.stockStatus === 'low'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {row.stockStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setAdjustingVariant(row);
                        setStockChange(0);
                      }}
                      className="bg-[#24231F] hover:bg-[#C58A38] text-white px-3 py-1 text-[11px] uppercase tracking-wider font-semibold transition-colors"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Modal */}
      {adjustingVariant && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 shadow-2xl border border-[#E5E1D8] space-y-4 text-xs">
            <h3 className="font-serif text-xl font-medium text-[#24231F]">Adjust Stock</h3>
            <p className="text-[#77746D]">
              <strong>{adjustingVariant.productName}</strong> ({adjustingVariant.sku})
            </p>
            <p className="text-[#77746D]">
              Current stock: <strong>{adjustingVariant.stock}</strong>
            </p>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div>
                <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                  Stock Change (+/-)
                </label>
                <input
                  type="number"
                  required
                  value={stockChange}
                  onChange={(e) => setStockChange(e.target.value)}
                  placeholder="e.g. +10 or -5"
                  className="w-full border border-[#E5E1D8] px-3 py-2 bg-[#F8F7F3]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingVariant(null)}
                  className="px-4 py-2 border border-[#24231F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C58A38] text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


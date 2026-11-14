import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../services/api';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('store');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings-full'],
    queryFn: () => fetchApi('/admin/settings'),
  });

  const [formData, setFormData] = useState(null);

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data) => fetchApi('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings-full'] });
      toast.success('Store configuration saved successfully!');
    },
    onError: (err) => toast.error(err.message || 'Save failed'),
  });

  if (isLoading || !formData) {
    return <div className="p-8 text-center text-xs">Loading store settings...</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-medium text-[#24231F]">Store Settings & Delivery</h1>
        <p className="text-xs text-[#77746D] mt-1">
          Configure Biratnagar delivery rules, payment options, and contact details.
        </p>
      </div>

      <div className="flex border-b border-[#E5E1D8] text-xs uppercase tracking-wider font-semibold space-x-6">
        <button
          onClick={() => setActiveTab('store')}
          className={`pb-3 ${activeTab === 'store' ? 'border-b-2 border-[#C58A38] text-[#C58A38]' : 'text-[#77746D]'}`}
        >
          General & Contact
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`pb-3 ${activeTab === 'delivery' ? 'border-b-2 border-[#C58A38] text-[#C58A38]' : 'text-[#77746D]'}`}
        >
          Delivery Coverage
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 ${activeTab === 'payments' ? 'border-b-2 border-[#C58A38] text-[#C58A38]' : 'text-[#77746D]'}`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`pb-3 ${activeTab === 'policies' ? 'border-b-2 border-[#C58A38] text-[#C58A38]' : 'text-[#77746D]'}`}
        >
          Store Policies
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 border border-[#E5E1D8] space-y-6 text-xs">
        {/* Tab 1: General Info */}
        {activeTab === 'store' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-[#77746D] mb-1">Store Name</label>
              <input
                type="text"
                value={formData.store?.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, store: { ...formData.store, name: e.target.value } })
                }
                className="w-full bg-[#F8F7F3] border border-[#E5E1D8] px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#77746D] mb-1">Tagline</label>
              <input
                type="text"
                value={formData.store?.tagline || ''}
                onChange={(e) =>
                  setFormData({ ...formData, store: { ...formData.store, tagline: e.target.value } })
                }
                className="w-full bg-[#F8F7F3] border border-[#E5E1D8] px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#77746D] mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.store?.phone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, store: { ...formData.store, phone: e.target.value } })
                }
                className="w-full bg-[#F8F7F3] border border-[#E5E1D8] px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#77746D] mb-1">Support Email</label>
              <input
                type="email"
                value={formData.store?.email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, store: { ...formData.store, email: e.target.value } })
                }
                className="w-full bg-[#F8F7F3] border border-[#E5E1D8] px-3.5 py-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block uppercase tracking-wider text-[#77746D] mb-1">Store Description</label>
              <textarea
                rows={2}
                value={formData.store?.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, store: { ...formData.store, description: e.target.value } })
                }
                className="w-full bg-[#F8F7F3] border border-[#E5E1D8] px-3.5 py-2.5"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Delivery */}
        {activeTab === 'delivery' && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold">Delivery Charges & Thresholds</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                  Outside Zone Courier Rate (NPR)
                </label>
                <input
                  type="number"
                  value={formData.delivery?.outsideZoneCharge || 150}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      delivery: { ...formData.delivery, outsideZoneCharge: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-[#F8F7F3] border border-[#E5E1D8] px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                  Free Nationwide Minimum Order (NPR)
                </label>
                <input
                  type="number"
                  value={formData.delivery?.outsideZoneFreeMinimum || 3000}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      delivery: { ...formData.delivery, outsideZoneFreeMinimum: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-[#F8F7F3] border border-[#E5E1D8] px-3.5 py-2.5"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                  Delivery Banner Text
                </label>
                <input
                  type="text"
                  value={formData.delivery?.info || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      delivery: { ...formData.delivery, info: e.target.value },
                    })
                  }
                  className="w-full bg-[#F8F7F3] border border-[#E5E1D8] px-3.5 py-2.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Payments */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold">Gateway Activation</h3>
            <div className="p-4 border border-[#E5E1D8] space-y-2">
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={formData.payments?.cod?.enabled ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payments: {
                        ...formData.payments,
                        cod: { ...formData.payments.cod, enabled: e.target.checked },
                      },
                    })
                  }
                />
                <span>Cash on Delivery (COD)</span>
              </label>
              <p className="text-[#77746D]">
                Allow customers to place orders with settlement at doorstep delivery.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Policies */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <div>
              <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                7-Day Return / Exchange Policy
              </label>
              <textarea
                rows={4}
                value={formData.policies?.returnPolicy || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policies: { ...formData.policies, returnPolicy: e.target.value },
                  })
                }
                className="w-full bg-[#F8F7F3] border border-[#E5E1D8] px-3.5 py-2.5"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-[#E5E1D8]">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-[#24231F] hover:bg-[#C58A38] text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}


import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../services/api';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories-page'],
    queryFn: () => fetchApi('/admin/categories'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => fetchApi('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories-page'] });
      toast.success('Category created successfully');
      setName('');
      setDescription('');
      setImageUrl('');
    },
    onError: (err) => toast.error(err.message || 'Creation failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fetchApi(`/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories-page'] });
      toast.success('Category removed');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    createMutation.mutate({
      name,
      description,
      image: imageUrl ? { url: imageUrl, provider: 'external' } : null,
      isActive: true,
      isFeatured: true,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-medium text-[#24231F]">Categories & Lines</h1>
        <p className="text-xs text-[#77746D] mt-1">
          Organize storefront navigation and wardrobe groupings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create form */}
        <div className="lg:col-span-5 bg-white p-6 border border-[#E5E1D8] space-y-4">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#24231F]">
            Add New Category
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Winter Knitwear"
                className="w-full bg-[#F8F7F3] border border-[#E5E1D8] px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F8F7F3] border border-[#E5E1D8] px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#F8F7F3] border border-[#E5E1D8] px-3.5 py-2.5"
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-[#24231F] hover:bg-[#C58A38] text-white py-3 uppercase tracking-widest font-semibold transition-colors"
            >
              {createMutation.isPending ? 'Creating...' : 'Save Category'}
            </button>
          </form>
        </div>

        {/* Existing categories list */}
        <div className="lg:col-span-7 bg-white border border-[#E5E1D8] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0EEE7] border-b border-[#E5E1D8] text-[#77746D] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1D8]">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-[#77746D]">
                    Loading...
                  </td>
                </tr>
              ) : categories?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-[#77746D]">
                    No categories created yet.
                  </td>
                </tr>
              ) : (
                categories?.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8F7F3]">
                    <td className="py-3 px-4 font-semibold text-[#24231F] flex items-center gap-3">
                      {c.image?.url && (
                        <img src={c.image.url} alt="" className="w-8 h-10 object-cover bg-[#F0EEE7]" />
                      )}
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#77746D]">{c.slug}</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold uppercase text-[10px]">
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${c.name}"?`)) deleteMutation.mutate(c.id);
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../services/api';
import { Plus, Edit, Trash2, ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: 1500,
    compareAtPrice: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    sku: '',
    status: 'published',
    featured: false,
    bestSeller: false,
    newArrival: true,
    variants: [
      { sku: '', optionValues: { Size: 'M', Color: 'Natural' }, priceAdjustment: 0, stock: 15, isActive: true },
    ],
    images: [{ url: '', alt: '' }],
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: () => fetchApi(`/admin/products?q=${encodeURIComponent(search)}`),
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => fetchApi('/admin/categories'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editProduct) {
        return fetchApi(`/admin/products/${editProduct.id}`, { method: 'PUT', body: JSON.stringify(data) });
      }
      return fetchApi('/admin/products', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(editProduct ? 'Product updated successfully' : 'Product published');
      setIsModalOpen(false);
      setEditProduct(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Error saving product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fetchApi(`/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete');
    },
  });

  const handleOpenCreate = () => {
    setEditProduct(null);
    setFormData({
      name: '',
      slug: '',
      price: 1500,
      compareAtPrice: '',
      shortDescription: '',
      description: '',
      categoryId: categories?.[0]?.id || '',
      sku: '',
      status: 'published',
      featured: false,
      bestSeller: false,
      newArrival: true,
      variants: [
        { sku: '', optionValues: { Size: 'M', Color: 'Natural' }, priceAdjustment: 0, stock: 15, isActive: true },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
          alt: 'Product front',
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (prod) => {
    try {
      const fullProd = await fetchApi(`/admin/products/${prod.id}`);
      setEditProduct(fullProd);
      setFormData({
        name: fullProd.name,
        slug: fullProd.slug,
        price: fullProd.price,
        compareAtPrice: fullProd.compareAtPrice || '',
        shortDescription: fullProd.shortDescription || '',
        description: fullProd.description || '',
        categoryId: fullProd.category?.id || '',
        sku: fullProd.sku,
        status: fullProd.status,
        featured: fullProd.featured,
        bestSeller: fullProd.bestSeller,
        newArrival: fullProd.newArrival,
        variants: fullProd.variants || [],
        images: fullProd.images || [],
      });
      setIsModalOpen(true);
    } catch (e) {
      toast.error('Failed to load product details');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      price: Number(formData.price),
      compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
    });
  };

  const products = productsData?.items || [];

  return (
    <div className="space-y-6">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium text-[#24231F]">Products & Catalogue</h1>
          <p className="text-xs text-[#77746D] mt-1">
            Manage your clothing inventory, pricing, variants, and dynamic URLs.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-[#24231F] hover:bg-[#C58A38] text-white px-5 py-2.5 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter / Search bar */}
      <div className="flex items-center bg-white p-3 border border-[#E5E1D8]">
        <Search size={16} className="text-[#77746D] ml-2 mr-3" />
        <input
          type="text"
          placeholder="Search by title, SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E5E1D8] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F0EEE7] border-b border-[#E5E1D8] text-[#77746D] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Item</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Selling Price</th>
              <th className="py-3 px-4">Total Stock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E1D8]">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-[#77746D]">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-[#77746D]">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8F7F3] transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={p.image?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=100&auto=format&fit=crop'}
                      alt=""
                      className="w-10 h-12 object-cover bg-[#F0EEE7]"
                    />
                    <div>
                      <span className="font-semibold text-[#24231F] block">{p.name}</span>
                      <span className="text-[10px] text-[#77746D] font-mono">{p.slug}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#77746D]">{p.category?.name || '—'}</td>
                  <td className="py-3 px-4 font-semibold text-[#24231F]">
                    NPR {p.price?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        p.totalStock === 0
                          ? 'bg-red-100 text-red-700'
                          : p.totalStock < 10
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.totalStock} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-xs font-semibold text-[#24231F]">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <a
                      href={`/item/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-[#77746D] hover:text-[#24231F] inline-block"
                      title="View on Storefront"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-[#77746D] hover:text-[#C58A38] inline-block"
                      title="Edit Product"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.name}" permanently?`)) {
                          deleteMutation.mutate(p.id);
                        }
                      }}
                      className="p-1.5 text-[#77746D] hover:text-red-600 inline-block"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#E5E1D8]">
            <h2 className="font-serif text-2xl font-normal text-[#24231F] mb-6">
              {editProduct ? 'Edit Garment Details' : 'Add New Garment'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-[#E5E1D8] px-3 py-2 bg-[#F8F7F3]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                    URL Slug (Unique Link)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-if-empty"
                    className="w-full border border-[#E5E1D8] px-3 py-2 bg-[#F8F7F3] font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                    Base SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. AMB-LIN-09"
                    className="w-full border border-[#E5E1D8] px-3 py-2 bg-[#F8F7F3] font-mono"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                    Selling Price (NPR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border border-[#E5E1D8] px-3 py-2 bg-[#F8F7F3]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                    Compare At Price (NPR)
                  </label>
                  <input
                    type="number"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="Original before discount"
                    className="w-full border border-[#E5E1D8] px-3 py-2 bg-[#F8F7F3]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full border border-[#E5E1D8] px-3 py-2 bg-[#F8F7F3]"
                  >
                    <option value="">Select Category</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full border border-[#E5E1D8] px-3 py-2 bg-[#F8F7F3]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                    Full Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-[#E5E1D8] px-3 py-2 bg-[#F8F7F3]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider text-[#77746D] mb-1">
                    Primary Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.images[0]?.url || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        images: [{ url: e.target.value, alt: formData.name }],
                      })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-[#E5E1D8] px-3 py-2 bg-[#F8F7F3]"
                  />
                </div>

                <div className="sm:col-span-2 flex gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span>Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.bestSeller}
                      onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
                    />
                    <span>Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.newArrival}
                      onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                    />
                    <span>New Arrival</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#E5E1D8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-[#24231F] text-[#24231F] uppercase font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2.5 bg-[#C58A38] text-white uppercase font-semibold hover:bg-[#a9742c]"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


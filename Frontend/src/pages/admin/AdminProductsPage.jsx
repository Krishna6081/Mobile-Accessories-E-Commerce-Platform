import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Package } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState(999);
  const [mrp, setMrp] = useState(1499);
  const [stock, setStock] = useState(50);
  const [imageUrl, setImageUrl] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products?limit=50')
      .then((res) => setProducts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api.get('/categories').then((res) => setCategories(res.data || []));
    api.get('/brands').then((res) => setBrands(res.data || []));
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        categoryId,
        brandId: brandId || undefined,
        variants: [
          { sku: sku || `SKU-${Date.now()}`, price: Number(price), mrp: Number(mrp), stock: Number(stock) },
        ],
        images: [imageUrl || 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80'],
      });
      toast.success('Product created successfully');
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to create product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage items, variants, pricing, and stock status</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-rose-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Price / MRP</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={p.images?.[0]?.url} alt="" className="w-10 h-10 object-cover rounded-xl bg-slate-100 border border-slate-200" />
                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{p.slug}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-600 font-semibold">{p.category?.name}</td>
                <td className="p-4 text-slate-600 font-semibold">{p.brand?.name || 'N/A'}</td>
                <td className="p-4 font-black text-slate-900">₹{p.variants?.[0]?.price} <span className="text-slate-400 line-through text-[11px] font-normal">₹{p.variants?.[0]?.mrp}</span></td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${p.variants?.[0]?.stock > 5 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                    {p.variants?.[0]?.stock || 0} units
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Add New Accessory Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white font-medium" />
              <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white font-medium" />

              <div className="grid grid-cols-2 gap-3">
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium">
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium">
                  <option value="">Select Brand (Optional)</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="Sale Price" value={price} onChange={(e) => setPrice(e.target.value)} required className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white font-medium" />
                <input type="number" placeholder="MRP" value={mrp} onChange={(e) => setMrp(e.target.value)} required className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white font-medium" />
                <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} required className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white font-medium" />
              </div>

              <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white font-medium" />

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black shadow-md shadow-rose-500/20">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

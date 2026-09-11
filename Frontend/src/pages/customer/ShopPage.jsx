import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import api from '../../services/api';

export default function ShopPage() {
  const { slug: routeCategorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const selectedCategory = searchParams.get('category') || routeCategorySlug || '';
  const selectedBrand = searchParams.get('brand') || '';
  const searchQuery = searchParams.get('q') || searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data || []));
    api.get('/brands').then((res) => setBrands(res.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);

    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }

    api.get(`/products?${params.toString()}`)
      .then((res) => {
        setProducts(res.data || []);
        setTotal(res.meta?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [searchParams, routeCategorySlug, selectedCategory, searchQuery]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    navigate(`/shop?${newParams.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Mobile Accessories Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">Showing {products.length} of {total} products</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
            <ArrowUpDown className="w-3.5 h-3.5 text-rose-600" /> Sort By:
          </label>
          <select
            value={sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500 shadow-sm"
          >
            <option value="createdAt">Newest Arrivals</option>
            <option value="rating">Highest Rated</option>
            <option value="priceLow">Price: Low to High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6 glass-card p-6 rounded-3xl h-fit border border-slate-200/80 bg-white">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-rose-600" /> Categories
              </h3>
              {selectedCategory && (
                <button onClick={() => updateFilter('category', '')} className="text-[10px] text-rose-600 font-bold hover:underline">Clear</button>
              )}
            </div>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-colors ${!selectedCategory ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter('category', c.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-colors ${selectedCategory === c.slug ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Brands</h3>
              {selectedBrand && (
                <button onClick={() => updateFilter('brand', '')} className="text-[10px] text-rose-600 font-bold hover:underline">Clear</button>
              )}
            </div>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => updateFilter('brand', '')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-colors ${!selectedBrand ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => updateFilter('brand', b.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-colors ${selectedBrand === b.slug ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Catalog Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 rounded-2xl bg-slate-200/60 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-3xl border border-slate-200 bg-white">
              <SlidersHorizontal className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No products found matching criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try clearing your filters or checking search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

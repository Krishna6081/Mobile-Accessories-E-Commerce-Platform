import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingBag, Heart, User, Menu, X, Shield, LogOut, Sparkles, ChevronRight } from 'lucide-react';
import { toggleCartDrawer } from '../../store/slices/cartSlice';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const { itemCount } = useSelector((state) => state.cart || {});

  const currentCategorySlug = searchParams.get('category') || location.pathname.split('/category/')[1] || '';

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      api.get(`/products/search/suggest?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => setSuggestions(res.data || []))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggest(false);
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-header shadow-sm">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-black text-[11px] py-1.5 px-4 text-center tracking-wide uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-200" /> FREE Express Shipping on orders ₹499+ | Use Code <span className="underline font-bold">WELCOME10</span> for 10% OFF
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-6">
        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center overflow-hidden border border-slate-700 shadow-md group-hover:scale-105 transition-transform p-0.5">
            <img src="/mobixia-logo.jpg" alt="Mobixia Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-slate-900 leading-none">
              Mobi<span className="text-blue-600">X</span>ia
            </span>
            <span className="text-[9px] font-extrabold text-blue-600 tracking-widest uppercase mt-0.5">
              Mobile Accessories Online
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search GaN chargers, armor cases, TWS earbuds..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggest(true);
              }}
              onFocus={() => setShowSuggest(true)}
              className="w-full bg-slate-100/80 text-xs text-slate-900 placeholder-slate-400 rounded-2xl px-4 py-3 pl-10 border border-slate-200 focus:outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-rose-500 absolute left-3.5 top-3.5" />
          </form>

          {/* Autosuggest Dropdown */}
          {showSuggest && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.slug}`}
                  onClick={() => setShowSuggest(false)}
                  className="flex items-center gap-3.5 p-3 hover:bg-slate-50 transition-colors"
                >
                  <img
                    src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=100&q=80'}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-xl bg-slate-100 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] font-black text-rose-600 mt-0.5">₹{item.variants?.[0]?.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Link
            to="/wishlist"
            className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-300 transition-colors"
          >
            <Heart className="w-4 h-4" />
          </Link>

          <button
            onClick={() => dispatch(toggleCartDrawer())}
            className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-300 transition-colors relative"
          >
            <ShoppingBag className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {itemCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative group">
              <Link to="/account" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 hover:border-rose-300">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 flex items-center justify-center text-xs font-bold">
                  {user?.name?.[0]}
                </div>
                <span className="text-xs font-bold truncate max-w-[90px] hidden sm:inline">{user?.name}</span>
              </Link>

              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 hidden group-hover:block z-50">
                {['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role) && (
                  <Link to="/admin/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-slate-50 rounded-xl mb-1 border border-rose-100">
                    <Shield className="w-4 h-4" /> Admin Dashboard
                  </Link>
                )}
                <Link to="/account/orders" className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl">My Orders</Link>
                <Link to="/wishlist" className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Saved Wishlist</Link>
                <button
                  onClick={() => dispatch(logout())}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl mt-1"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-black text-xs shadow-md shadow-rose-500/20 hover:opacity-95 transition-opacity">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Category Navigation Bar (Taskbar Options) */}
      <nav className="border-t border-slate-200/80 hidden lg:block bg-white/90">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto py-2.5 text-xs font-bold tracking-wide text-slate-700">
          <Link
            to="/shop"
            className={`transition-all uppercase text-[11px] font-black pb-0.5 border-b-2 ${
              !currentCategorySlug
                ? 'text-rose-600 border-rose-500'
                : 'text-slate-700 border-transparent hover:text-rose-600'
            }`}
          >
            All Gear
          </Link>
          {categories.map((cat) => {
            const isActive = currentCategorySlug === cat.slug;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className={`transition-all whitespace-nowrap text-[11px] uppercase font-black pb-0.5 border-b-2 ${
                  isActive
                    ? 'text-rose-600 border-rose-500'
                    : 'text-slate-700 border-transparent hover:text-rose-600'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pl-9 text-xs text-slate-900"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1">Categories</p>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-xs font-bold ${!currentCategorySlug ? 'bg-rose-50 text-rose-600' : 'text-slate-700'}`}
            >
              All Gear
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-bold ${currentCategorySlug === cat.slug ? 'bg-rose-50 text-rose-600' : 'text-slate-700'}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

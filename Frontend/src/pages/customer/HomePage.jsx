import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Award, Sparkles, Flame, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import TrustBadges from '../../components/common/TrustBadges';
import api from '../../services/api';

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    api.get('/banners').then((res) => setBanners(res.data || [])).catch(() => {});
    api.get('/categories').then((res) => setCategories(res.data || [])).catch(() => {});
    api.get('/products?featured=true&limit=4').then((res) => setFeaturedProducts(res.data || [])).catch(() => {});
    api.get('/products?bestSeller=true&limit=8').then((res) => setBestSellers(res.data || [])).catch(() => {});
  }, []);

  const heroBanner = banners[0] || {
    title: 'Next-Gen 65W GaN Fast Chargers',
    subtitle: 'Charge your laptop, iPhone 15 Pro, and Galaxy Ultra simultaneously with ultra-compact GaN technology.',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Shop Chargers',
    ctaLink: '/category/chargers',
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="gradient-border-card overflow-hidden relative min-h-[420px] md:min-h-[460px] flex items-center shadow-xl">
          <img
            src={heroBanner.image}
            alt={heroBanner.title}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-25 mix-blend-multiply scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-10" />

          <div className="relative z-20 max-w-2xl px-6 md:px-12 py-12 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Next-Gen Mobile Gear
            </span>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              {heroBanner.title}
            </h1>

            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
              {heroBanner.subtitle}
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Link
                to={heroBanner.ctaLink || '/shop'}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95"
              >
                {heroBanner.ctaText || 'Explore Gear'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop?bestSeller=true"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm"
              >
                Best Sellers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
              <Zap className="w-5 h-5 text-rose-600" /> Explore Categories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Find precision-engineered accessories for your daily devices</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="glass-card p-4 rounded-2xl text-center group flex flex-col items-center justify-center gap-2.5 bg-white border border-slate-200/80 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-sm">
                📱
              </div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors tracking-wide">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers Showcase */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
              <Award className="w-5 h-5 text-amber-500" /> Best Selling Accessories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Tested, top-rated gear trusted by mobile power users</p>
          </div>
          <Link to="/shop?bestSeller=true" className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
            Shop All Best Sellers <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {bestSellers.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Promotional Flash Deal Strip */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 border border-rose-400 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden text-white">
          <div className="space-y-2.5 text-center md:text-left relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white border border-white/30 text-[10px] font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-300" /> Limited Time Flash Deal
            </span>
            <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              Up to 40% OFF Armor Cases & Glass Guards
            </h3>
            <p className="text-xs md:text-sm text-rose-50 max-w-lg leading-relaxed font-medium">
              Military-grade drop protection for iPhone 15 Pro, Samsung S24 Ultra, and OnePlus flagship devices.
            </p>
          </div>

          <Link
            to="/category/phone-cases"
            className="px-7 py-3.5 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shrink-0 relative z-10"
          >
            Claim Offer Now
          </Link>
        </div>
      </section>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Award,
  Sparkles,
  Flame,
  ChevronRight,
  ChevronLeft,
  Shield,
  ShieldCheck,
  Truck,
  Star,
  Clock,
  CheckCircle2,
  BatteryCharging,
  Headphones,
  Smartphone,
  Cpu,
} from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import TrustBadges from '../../components/common/TrustBadges';
import api from '../../services/api';

const HERO_SLIDES = [
  {
    id: 1,
    badge: '⚡ NEXT-GEN POWER',
    title: '65W GaN Turbo Fast Charger',
    subtitle: 'Charge your MacBook, iPhone 15 Pro & Galaxy S24 Ultra up to 3x faster with ultra-compact GaN Tech.',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Shop Chargers',
    ctaLink: '/shop?category=chargers',
    gradient: 'from-slate-900 via-rose-950 to-slate-900',
    accentColor: 'from-rose-500 to-amber-500',
    tags: ['65W Dual Type-C', 'GaN III Chipset', 'Multi-Layer Thermal Shield'],
    rating: '4.9/5 (2,840+ reviews)',
  },
  {
    id: 2,
    badge: '🛡️ MILITARY-GRADE DROP SHIELD',
    title: 'Armor MagSafe Cases',
    subtitle: '10ft drop tested protection with camera guard ring and strong N52 neodymium magnetic lock.',
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Explore Cases',
    ctaLink: '/shop?category=phone-cases',
    gradient: 'from-slate-900 via-purple-950 to-slate-900',
    accentColor: 'from-purple-500 to-rose-500',
    tags: ['10ft Drop Certified', 'Anti-Yellow TPU', 'N52 MagSafe Ring'],
    rating: '4.95/5 (1,920+ reviews)',
  },
  {
    id: 3,
    badge: '🎧 38dB ACTIVE NOISE CANCELLING',
    title: 'Pro ANC TWS Earbuds',
    subtitle: 'Immersive 3D Spatial Audio, crystal-clear 4-mic ENC calls, and 40-hour long playback.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Shop Audio',
    ctaLink: '/shop?category=audio-accessories',
    gradient: 'from-slate-900 via-blue-950 to-slate-900',
    accentColor: 'from-blue-500 to-rose-500',
    tags: ['Spatial Audio 3D', '40H Playtime', 'IPX5 Water Resistant'],
    rating: '4.88/5 (3,410+ reviews)',
  },
  {
    id: 4,
    badge: '🔋 MAGNETIC SLIM POWER',
    title: '10,000mAh MagSafe PowerBank',
    subtitle: 'Snap-on wireless charging for on-the-go power with pass-through fast charging capability.',
    image: '/images/power-bank-magsafe.png',
    ctaText: 'Shop Power Banks',
    ctaLink: '/shop?category=power-banks',
    gradient: 'from-slate-900 via-amber-950 to-slate-900',
    accentColor: 'from-amber-500 to-rose-500',
    tags: ['15W Wireless Fast', 'Aircraft Aluminum Body', 'Digital LED Display'],
    rating: '4.92/5 (1,150+ reviews)',
  },
];

export default function HomePage() {
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 18 });

  // Fetch Banners from Database
  useEffect(() => {
    api.get('/banners')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const dbSlides = res.data.map((b, idx) => ({
            id: b.id || idx + 1,
            badge: b.title.includes('Fast') ? '⚡ NEXT-GEN POWER' : b.title.includes('Cases') ? '🛡️ MILITARY-GRADE DROP SHIELD' : b.title.includes('Earbuds') ? '🎧 38dB ACTIVE NOISE CANCELLING' : '🔋 MAGNETIC SLIM POWER',
            title: b.title,
            subtitle: b.subtitle || 'Premium mobile accessory engineered for maximum performance.',
            image: b.image,
            ctaText: b.ctaText || 'Shop Now',
            ctaLink: b.ctaLink || '/shop',
            gradient: idx % 2 === 0 ? 'from-slate-900 via-rose-950 to-slate-900' : 'from-slate-900 via-purple-950 to-slate-900',
            accentColor: idx % 2 === 0 ? 'from-rose-500 to-amber-500' : 'from-purple-500 to-rose-500',
            tags: ['Certified Quality', 'Official Warranty', 'Express Dispatch'],
            rating: '4.9/5 (2,500+ reviews)',
          }));
          setHeroSlides(dbSlides);
        } else {
          setHeroSlides(HERO_SLIDES);
        }
      })
      .catch(() => setHeroSlides(HERO_SLIDES));
  }, []);

  // Carousel Auto-Play
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides]);

  // Flash Sale Timer
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data || [])).catch(() => {});
    api.get('/products?featured=true&limit=4').then((res) => setFeaturedProducts(res.data || [])).catch(() => {});
    api.get('/products?bestSeller=true&limit=8').then((res) => setBestSellers(res.data || [])).catch(() => {});
  }, []);

  const activeSlides = heroSlides.length > 0 ? heroSlides : HERO_SLIDES;
  const slide = activeSlides[currentSlide] || activeSlides[0];

  return (
    <div className="space-y-12 pb-16">
      {/* Dynamic Hero Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 text-white min-h-[460px] md:min-h-[500px] flex items-center transition-all duration-700">
          {/* Background Gradient & Glow Rings */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} transition-all duration-700 opacity-90`} />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Background Product Image */}
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 overflow-hidden pointer-events-none opacity-40 md:opacity-100">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center scale-105 transition-all duration-700 filter brightness-95 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 md:via-slate-900/40 to-transparent" />
          </div>

          {/* Content Container */}
          <div className="relative z-10 max-w-2xl px-6 md:px-12 py-12 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 border border-amber-300/30 text-[11px] font-black tracking-wider uppercase shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {slide.badge}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                <Star className="w-3 h-3 fill-emerald-300" /> {slide.rating}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              {slide.title}
            </h1>

            <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
              {slide.subtitle}
            </p>

            {/* Feature Tag Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {slide.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] font-bold text-slate-200 backdrop-blur-sm shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3 text-rose-400" /> {tag}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to={slide.ctaLink}
                className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r ${slide.accentColor} text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95`}
              >
                {slide.ctaText} <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all shadow-sm"
              >
                Explore Full Catalog
              </Link>
            </div>
          </div>

          {/* Slide Navigation Controls */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 backdrop-blur-md transition-all z-20 hidden md:block"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % activeSlides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/10 backdrop-blur-md transition-all z-20 hidden md:block"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-8 bg-rose-500' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Impact Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">50k+ Fast Chargers</p>
              <p className="text-[10px] font-semibold text-slate-500">Delivered across India</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">2-Year Replacement</p>
              <p className="text-[10px] font-semibold text-slate-500">Hassle-free warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Same-Day Dispatch</p>

              <p className="text-[10px] font-semibold text-slate-500">Express delivery 24-48 hrs</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">100% Original</p>
              <p className="text-[10px] font-semibold text-slate-500">Certified mobile brands</p>
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
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
              <Zap className="w-5 h-5 text-rose-600" /> Top Accessory Categories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Find precision-engineered gear tailored for your smartphone and laptop</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative p-5 rounded-3xl text-center flex flex-col items-center justify-center gap-3 bg-white border border-slate-200/90 hover:border-rose-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-50 to-amber-50 border border-rose-100 text-rose-600 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:from-rose-500 group-hover:to-amber-500 group-hover:text-white transition-all duration-300 shadow-md">
                {cat.slug.includes('charger') ? '⚡' : cat.slug.includes('audio') || cat.slug.includes('ear') ? '🎧' : cat.slug.includes('case') ? '🛡️' : cat.slug.includes('power') ? '🔋' : cat.slug.includes('cable') ? '🔌' : '📱'}
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 group-hover:text-rose-600 transition-colors uppercase tracking-wider">
                  {cat.name}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">Explore Gear →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Real-Time Flash Deal Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 border border-rose-400 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden text-white">
          {/* Decorative ambient background */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 text-center md:text-left relative z-10 max-w-xl">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 border border-white/30 text-[10px] font-black uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> FLASH DEAL OF THE DAY
              </span>
              <span className="bg-amber-400 text-slate-900 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                FLAT 40% OFF
              </span>
            </div>

            <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-snug">
              Military-Grade Armor Cases & Tempered Glass
            </h3>

            <p className="text-xs md:text-sm text-rose-100 font-medium leading-relaxed">
              Ultra-rugged drop protection for iPhone 15 Pro, Samsung Galaxy S24, and OnePlus series with zero bulk.
            </p>

            {/* Countdown Timer */}
            <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
              <span className="text-xs font-bold text-rose-200 mr-2 flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-300" /> Ends In:
              </span>
              <div className="bg-slate-900/80 border border-white/20 backdrop-blur-md rounded-xl px-3 py-1.5 text-center min-w-[50px]">
                <span className="text-base font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[9px] block text-slate-400 uppercase font-bold">Hrs</span>
              </div>
              <span className="text-white font-bold">:</span>
              <div className="bg-slate-900/80 border border-white/20 backdrop-blur-md rounded-xl px-3 py-1.5 text-center min-w-[50px]">
                <span className="text-base font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] block text-slate-400 uppercase font-bold">Mins</span>
              </div>
              <span className="text-white font-bold">:</span>
              <div className="bg-slate-900/80 border border-white/20 backdrop-blur-md rounded-xl px-3 py-1.5 text-center min-w-[50px]">
                <span className="text-base font-black text-rose-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] block text-slate-400 uppercase font-bold">Secs</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 relative z-10 shrink-0">
            <Link
              to="/shop?category=phone-cases"
              className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-wider hover:bg-slate-100 hover:scale-105 transition-all shadow-xl active:scale-95"
            >
              Claim Flash Discount Now
            </Link>
            <span className="text-[11px] font-bold text-rose-100">Free Express Shipping Included</span>
          </div>
        </div>
      </section>

      {/* Best Sellers Showcase */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
              <Award className="w-5 h-5 text-amber-500" /> Best Selling Accessories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Top-rated mobile gear recommended by tech reviewers and power users</p>
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
    </div>
  );
}

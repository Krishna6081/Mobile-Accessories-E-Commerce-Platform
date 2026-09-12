import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check, Sparkles } from 'lucide-react';
import RatingStars from '../common/RatingStars';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ProductCard({ product, onWishlistToggle }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const primaryImage = product.images?.[0]?.url || '/images/power-bank-magsafe.png';
  const [imgSrc, setImgSrc] = useState(primaryImage);
  const defaultVariant = product.variants?.[0] || { mrp: 999, price: 699, stock: 10 };
  const discountPercent = Math.round(((defaultVariant.mrp - defaultVariant.price) / defaultVariant.mrp) * 100);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      if (!defaultVariant.id) return;
      await api.post('/cart/items', { variantId: defaultVariant.id, quantity: 1 });
      toast.success(`Added ${product.name} to cart!`, {
        icon: '🛒',
        style: { background: '#ffffff', color: '#e11d48', border: '1px solid rgba(244, 63, 94, 0.3)' },
      });
    } catch (error) {
      toast.error(error.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onWishlistToggle) onWishlistToggle(product.id);
  };

  return (
    <div className="group glass-card rounded-3xl overflow-hidden flex flex-col justify-between relative border border-slate-200/80">
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImgSrc('/images/power-bank-magsafe.png')}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none z-10">
          {discountPercent > 0 && (
            <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md tracking-wider uppercase">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-2.5 h-2.5" /> Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${
            isWishlisted
              ? 'bg-rose-500 text-white shadow-md scale-110'
              : 'bg-white/80 text-slate-500 hover:text-rose-500 hover:bg-white shadow-sm'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Details */}
      <div className="p-4 md:p-5 flex flex-col flex-grow justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-extrabold text-rose-600 uppercase tracking-widest text-[9px]">
              {product.brand?.name || 'GENUINE GEAR'}
            </span>
            <RatingStars rating={product.rating || 4.8} count={product.reviewCount || 24} />
          </div>

          <Link to={`/product/${product.slug}`}>
            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-rose-600 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Variant Info */}
        {product.variants?.length > 1 && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-semibold text-slate-700">
              {product.variants.length} Options
            </span>
            <span className="truncate max-w-[120px] text-slate-500">
              {product.variants[0]?.color || product.variants[0]?.modelCompatibility}
            </span>
          </div>
        )}

        {/* Pricing & Add Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 tracking-tight">₹{defaultVariant.price}</span>
              {defaultVariant.mrp > defaultVariant.price && (
                <span className="text-xs text-slate-400 line-through font-normal">₹{defaultVariant.mrp}</span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" /> In Stock
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs transition-all shadow-md hover:shadow-rose-500/25 flex items-center gap-1.5 active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Adding...' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

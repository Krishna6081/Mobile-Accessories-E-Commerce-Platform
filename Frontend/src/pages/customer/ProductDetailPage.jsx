import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, ShieldCheck, Truck, Check, MapPin, Star, Sparkles } from 'lucide-react';
import RatingStars from '../../components/common/RatingStars';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then((res) => {
        const prod = res.data;
        setProduct(prod);
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        }
        if (prod.images && prod.images.length > 0) {
          setSelectedImage(prod.images[0].url);
        }
      })
      .catch(() => toast.error('Failed to load product details'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    try {
      await api.post('/cart/items', { variantId: selectedVariant.id, quantity });
      toast.success(`Added ${product.name} to cart!`, {
        style: { background: '#11131f', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.4)' },
      });
    } catch (error) {
      toast.error(error.message || 'Failed to add item to cart');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPincodeStatus({ available: true, message: `Express delivery available for ${pincode} in 2-3 days!` });
    } else {
      setPincodeStatus({ available: false, message: 'Please enter a valid 6-digit Pincode.' });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Thank you! Review submitted.');
      setReviewComment('');
      api.get(`/products/${slug}`).then((res) => setProduct(res.data));
    } catch (error) {
      toast.error(error.message || 'Only verified delivered orders can post reviews.');
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Loading product detail...</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Product not found.</div>;

  const discountPercent = selectedVariant
    ? Math.round(((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Media Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl bg-white border border-slate-200/80 overflow-hidden relative shadow-lg">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-amber-500 font-black text-xs px-3 py-1 rounded-full text-white shadow-md uppercase tracking-wider">
                -{discountPercent}% OFF
              </span>
            )}
          </div>
          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img.url)}
                className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white ${selectedImage === img.url ? 'border-rose-500 shadow-md scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'}`}
              >
                <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">{product.brand?.name || 'GENUINE GEAR'}</span>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mt-2.5 leading-tight tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-4 mt-3">
              <RatingStars rating={product.rating} count={product.reviewCount} />
              <span className="text-xs text-slate-400 font-mono">SKU: <code className="text-slate-700 font-bold">{selectedVariant?.sku}</code></span>
            </div>
          </div>

          {/* Pricing Banner */}
          <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900 tracking-tight">₹{selectedVariant?.price}</span>
            {selectedVariant?.mrp > selectedVariant?.price && (
              <span className="text-sm text-slate-400 line-through">₹{selectedVariant?.mrp}</span>
            )}
            <span className="text-xs text-emerald-600 font-black ml-auto flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Check className="w-4 h-4" /> {selectedVariant?.stock > 0 ? `In Stock (${selectedVariant.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Variants Selector */}
          {product.variants?.length > 1 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Style / Color / Compatibility:</label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${selectedVariant?.id === v.id ? 'bg-gradient-to-r from-rose-500 to-amber-500 border-transparent text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}
                  >
                    {v.color || v.modelCompatibility || v.sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex items-center border border-slate-200 rounded-2xl bg-white px-4 py-3 justify-between sm:w-36 shadow-sm">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-slate-500 hover:text-slate-900 font-extrabold text-lg">-</button>
              <span className="text-sm font-black text-slate-900">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="text-slate-500 hover:text-slate-900 font-extrabold text-lg">+</button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-500/20 hover:scale-105"
            >
              Instant Buy
            </button>
          </div>

          {/* Pincode Availability Checker */}
          <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm space-y-2.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-rose-500" /> Delivery Pincode Checker
            </label>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                value={pincode}
                maxLength={6}
                onChange={(e) => setPincode(e.target.value)}
                className="bg-slate-50 text-xs text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 flex-1 focus:outline-none focus:border-rose-500 focus:bg-white font-mono"
              />
              <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white rounded-xl">
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p className={`text-xs mt-1 font-bold ${pincodeStatus.available ? 'text-emerald-600' : 'text-rose-600'}`}>
                {pincodeStatus.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Description & Specifications */}
      <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Product Specifications & Overview</h2>
        <div className="text-slate-600 text-xs leading-relaxed space-y-2 font-medium">
          <p>{product.description}</p>
        </div>

        {product.specifications && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200/80">
            {Object.entries(product.specifications).map(([key, val]) => (
              <div key={key} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{key}</span>
                <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">{String(val)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Customer Reviews ({product.reviews?.length || 0})
        </h2>

        <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Write a Verified Review</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Your Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setReviewRating(star)}
                className={`text-base ${star <= reviewRating ? 'text-amber-500' : 'text-slate-300'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            placeholder="Share details about durability, charge speeds, compatibility..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            className="w-full bg-white text-xs text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-medium"
            rows={3}
            required
          />
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-500/20">
            Submit Review
          </button>
        </form>

        <div className="space-y-4">
          {product.reviews?.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{rev.user?.name || 'Verified Buyer'}</span>
                <RatingStars rating={rev.rating} />
              </div>
              <p className="text-xs text-slate-600">{rev.comment}</p>
              <span className="text-[10px] text-slate-400 font-medium">{new Date(rev.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

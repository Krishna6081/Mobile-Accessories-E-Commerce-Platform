import React, { useEffect, useState } from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    setLoading(true);
    api.get('/wishlist')
      .then((res) => setWishlist(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleToggle = async (productId) => {
    try {
      await api.post('/wishlist/toggle', { productId });
      toast.success('Wishlist updated');
      fetchWishlist();
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">Loading wishlist...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
        <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> My Saved Wishlist ({wishlist.length})
      </h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
              <img
                src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80'}
                alt={item.product?.name}
                className="w-full aspect-square object-cover rounded-2xl bg-slate-50 border border-slate-200/80"
              />
              <div>
                <h3 className="text-xs font-black text-slate-900 line-clamp-1">{item.product?.name}</h3>
                <p className="text-sm font-black text-rose-600 mt-1">₹{item.product?.variants?.[0]?.price}</p>
              </div>
              <button
                onClick={() => handleToggle(item.productId)}
                className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 text-xs font-black transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove from Wishlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { toggleCartDrawer, setCart } from '../../store/slices/cartSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const { isOpen, items, subtotal } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchCart = () => {
    api.get('/cart')
      .then((res) => dispatch(setCart(res.data || {})))
      .catch(() => {});
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const handleUpdateQty = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    try {
      await api.put(`/cart/items/${itemId}`, { quantity: newQty });
      fetchCart();
    } catch (error) {
      toast.error(error.message || 'Failed to update item quantity');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => dispatch(toggleCartDrawer(false))} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200/80 flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-black text-slate-900">Your Cart ({items.length})</h3>
            </div>
            <button onClick={() => dispatch(toggleCartDrawer(false))} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-300" />
                <p className="text-sm font-bold text-slate-500">Your shopping cart is empty</p>
                <button onClick={() => dispatch(toggleCartDrawer(false))} className="mt-4 px-5 py-2.5 text-xs font-black rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20">
                  Browse Products
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded-xl bg-white border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">{item.productName}</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.color} {item.modelCompatibility}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-black text-rose-600">₹{item.price}</span>
                      <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm">
                        <button onClick={() => handleUpdateQty(item.id, item.quantity, -1)} className="p-1 text-slate-500 hover:text-slate-900">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black text-slate-900">{item.quantity}</span>
                        <button onClick={() => handleUpdateQty(item.id, item.quantity, 1)} className="p-1 text-slate-500 hover:text-slate-900">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => handleRemove(item.id)} className="text-slate-400 hover:text-rose-600 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200/80 bg-slate-50/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                <span>Subtotal</span>
                <span className="text-base font-black text-slate-900">₹{subtotal}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Shipping & taxes calculated at checkout</p>
              <button
                onClick={() => {
                  dispatch(toggleCartDrawer(false));
                  navigate('/checkout');
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-500/20"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

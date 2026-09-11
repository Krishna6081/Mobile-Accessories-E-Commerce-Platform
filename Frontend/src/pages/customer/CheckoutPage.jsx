import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldCheck, CreditCard, Truck, Check, ArrowRight, Tag } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { setCart } from '../../store/slices/cartSlice';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [cartData, setCartData] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  // Address State
  const [address, setAddress] = useState({
    fullName: 'John Doe',
    mobile: '9876543210',
    addressLine1: 'Flat 402, Sunshine Apartments',
    addressLine2: 'MG Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue to checkout');
      navigate('/login');
      return;
    }

    api.get('/cart').then((res) => {
      setCartData(res.data);
      dispatch(setCart(res.data || {}));
    });
  }, [isAuthenticated, navigate, dispatch]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode,
        amount: cartData?.subtotal || 0,
      });
      setAppliedCoupon(res.data);
      toast.success(`Coupon ${res.data.code} applied! Saved ₹${res.data.discountAmount}`);
    } catch (error) {
      toast.error(error.message || 'Invalid coupon code');
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.fullName || !address.addressLine1 || !address.pincode) {
      toast.error('Please complete your shipping address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/checkout/place-order', {
        shippingAddress: address,
        paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
      });

      const orderData = res.data;

      if (paymentMethod === 'RAZORPAY' && orderData.razorpay) {
        toast.success('Razorpay Order Initialized. Completing test payment verification...');
        await api.post('/checkout/verify-payment', {
          orderId: orderData.orderId,
          razorpayPaymentId: 'pay_mock_' + Date.now(),
          razorpayOrderId: orderData.razorpay.id,
          razorpaySignature: 'mock_signature',
        });
      }

      toast.success('Order placed successfully!');
      dispatch(setCart({ items: [], subtotal: 0 }));
      navigate(`/order-success/${orderData.orderId}`);
    } catch (error) {
      toast.error(error.message || 'Failed to place order. Please check stock availability.');
    } finally {
      setLoading(false);
    }
  };

  if (!cartData || cartData.items?.length === 0) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">Your cart is empty.</div>;
  }

  const subtotal = cartData.subtotal || 0;
  const discount = appliedCoupon?.discountAmount || 0;
  const shippingFee = subtotal > 499 ? 0 : 50;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.18);
  const grandTotal = Math.round(taxable + shippingFee);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Address */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-rose-500" /> 1. Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                />
              </div>
              <div>
                <label className="text-slate-600 font-bold block mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={address.mobile}
                  onChange={(e) => setAddress({ ...address, mobile: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-600 font-bold block mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={address.addressLine1}
                  onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                />
              </div>
              <div>
                <label className="text-slate-600 font-bold block mb-1">City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                />
              </div>
              <div>
                <label className="text-slate-600 font-bold block mb-1">Pincode</label>
                <input
                  type="text"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium font-mono"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose-500" /> 2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${paymentMethod === 'COD' ? 'bg-rose-50/80 border-rose-500 text-slate-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <div className="w-5 h-5 rounded-full border-2 border-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                  {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Cash on Delivery (COD)</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Pay in cash when order is delivered to your doorstep.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${paymentMethod === 'RAZORPAY' ? 'bg-rose-50/80 border-rose-500 text-slate-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <div className="w-5 h-5 rounded-full border-2 border-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                  {paymentMethod === 'RAZORPAY' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Online Payment (Razorpay)</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">UPI, Credit/Debit Cards, NetBanking, Wallet.</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900">Order Summary</h3>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="bg-slate-50 text-xs text-slate-900 uppercase px-3.5 py-2.5 rounded-xl border border-slate-200 flex-1 focus:outline-none focus:border-rose-500 focus:bg-white font-mono"
              />
              <button type="submit" className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white rounded-xl shadow-sm">
                Apply
              </button>
            </form>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-200/80 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span className="font-bold text-slate-900">₹{tax}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200/80">
                <span>Grand Total</span>
                <span className="text-rose-600">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-500/20 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Order...' : 'Place Order Now'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

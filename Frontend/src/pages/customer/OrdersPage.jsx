import React, { useEffect, useState } from 'react';
import { Package, Download, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders')
      .then((res) => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.post(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">Loading orders...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
        <Package className="w-6 h-6 text-rose-500" /> My Orders ({orders.length})
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500">No orders placed yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-3 gap-2">
                <div>
                  <span className="text-xs text-slate-400 font-bold">Order #</span>
                  <span className="text-sm font-black text-slate-900 font-mono ml-1">{ord.orderNumber}</span>
                  <span className="text-xs text-slate-400 font-medium ml-3">{new Date(ord.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${ord.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : ord.orderStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                    {ord.orderStatus}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {ord.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>{item.productName} ({item.variantInfo || 'Standard'}) x{item.quantity}</span>
                    <span className="font-bold text-slate-900">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>

              {/* Status Timeline */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>Status Timeline: {ord.statusHistory?.map((h) => h.status).join(' → ')}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                <span className="text-sm font-black text-slate-900">Total: <span className="text-rose-600 font-black">₹{ord.grandTotal}</span></span>

                <div className="flex gap-2">
                  {['PLACED', 'CONFIRMED'].includes(ord.orderStatus) && (
                    <button
                      onClick={() => handleCancelOrder(ord.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 text-xs font-black transition-all flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                  <a
                    href={`/api/v1/orders/${ord.id}/invoice`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Invoice
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

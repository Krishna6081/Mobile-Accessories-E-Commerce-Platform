import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Package, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      api.get(`/orders/${orderId}`)
        .then((res) => setOrder(res.data))
        .catch(() => {});
    }
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Placed Successfully!</h1>
        <p className="text-xs text-slate-500 font-medium">Order Number: <span className="text-rose-600 font-mono font-bold">{order?.orderNumber || orderId}</span></p>
      </div>

      {order && (
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left space-y-4">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-200/80 pb-2">Order Summary</h3>
          <div className="space-y-2 text-xs text-slate-700">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between font-medium">
                <span>{item.productName} (x{item.quantity})</span>
                <span className="font-bold text-slate-900">₹{item.totalPrice}</span>
              </div>
            ))}
            <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200/80">
              <span>Grand Total</span>
              <span className="text-rose-600">₹{order.grandTotal}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 pt-4">
        {orderId && (
          <a
            href={`/api/v1/orders/${orderId}/invoice`}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-slate-700" /> Download PDF Invoice
          </a>
        )}
        <Link
          to="/orders"
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-rose-500/20 transition-all"
        >
          <Package className="w-4 h-4" /> Track Order Status <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

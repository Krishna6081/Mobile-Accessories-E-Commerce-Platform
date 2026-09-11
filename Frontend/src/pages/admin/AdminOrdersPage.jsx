import React, { useEffect, useState } from 'react';
import { ShoppingBag, Edit, Truck, Download } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/admin/orders')
      .then((res) => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await api.put(`/admin/orders/${selectedOrder.id}/status`, {
        orderStatus: newStatus,
        courierName,
        trackingNumber,
      });
      toast.success('Order status updated');
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
          <ShoppingBag className="w-6 h-6 text-rose-500" /> Order Administration
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Fulfill orders, assign courier tracking numbers, manage refunds</p>
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200">
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Total</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-mono font-bold text-rose-600">{ord.orderNumber}</td>
                <td className="p-4">
                  <p className="font-bold text-slate-900">{ord.user?.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{ord.user?.email}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${ord.paymentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                    {ord.paymentMethod} ({ord.paymentStatus})
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200">
                    {ord.orderStatus}
                  </span>
                </td>
                <td className="p-4 font-black text-slate-900">₹{ord.grandTotal}</td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(ord);
                      setNewStatus(ord.orderStatus);
                      setCourierName(ord.courierName || '');
                      setTrackingNumber(ord.trackingNumber || '');
                    }}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Update Status: Order #{selectedOrder.orderNumber}</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 font-bold block mb-1">Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                >
                  <option value="PLACED">PLACED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="RETURNED">RETURNED</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">Courier Partner</label>
                <input
                  type="text"
                  placeholder="e.g. BlueDart / Delhivery"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. BLU12345678"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white font-medium font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedOrder(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black shadow-md shadow-rose-500/20">Update Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

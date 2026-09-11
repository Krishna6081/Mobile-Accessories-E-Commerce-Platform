import React, { useEffect, useState } from 'react';
import { Boxes, AlertTriangle, Save } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminInventoryPage() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = () => {
    setLoading(true);
    api.get('/admin/inventory')
      .then((res) => setVariants(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (id, newStock) => {
    try {
      await api.put(`/admin/inventory/${id}`, { stock: newStock });
      toast.success('Stock updated');
      fetchInventory();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
          <Boxes className="w-6 h-6 text-rose-500" /> Inventory & Stock Controls
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Real-time SKU stock tracking and low-stock alerts</p>
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200">
            <tr>
              <th className="p-4">SKU</th>
              <th className="p-4">Product Name</th>
              <th className="p-4">Color / Compat</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock Level</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {variants.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-mono font-bold text-rose-600">{v.sku}</td>
                <td className="p-4 font-bold text-slate-900">{v.product?.name}</td>
                <td className="p-4 text-slate-600 font-medium">{v.color || v.modelCompatibility || 'Standard'}</td>
                <td className="p-4 font-black text-slate-900">₹{v.price}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={v.stock}
                      onBlur={(e) => handleUpdateStock(v.id, e.target.value)}
                      className="w-20 bg-slate-50 border border-slate-200 rounded-xl p-2 text-center font-black text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
                    />
                    {v.stock <= 5 && (
                      <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-[10px] text-slate-400 font-bold">Auto-saved</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

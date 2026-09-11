import React, { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard/kpis'),
      api.get('/admin/dashboard/charts'),
    ])
      .then(([kpiRes, chartRes]) => {
        setKpis(kpiRes.data);
        setChartData(chartRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400">Loading admin analytics dashboard...</div>;

  const cards = [
    { title: "Today's Orders", value: kpis?.todayOrders || 0, icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { title: "Today's Revenue", value: `₹${kpis?.todayRevenue || 0}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { title: 'Total Revenue', value: `₹${kpis?.totalRevenue || 0}`, icon: TrendingUp, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { title: 'Low Stock Items', value: kpis?.lowStockProducts || 0, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Analytics Dashboard</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Real-time database metrics & sales performance analytics</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.title}</span>
                <div className={`p-2.5 rounded-2xl border ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{c.value}</h2>
            </div>
          );
        })}
      </div>

      {/* Recharts Sales Visualizer */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900">Sales & Orders Trend (Last 30 Days)</h3>
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', fontSize: '12px', color: '#0f172a', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="sales" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="Revenue (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900">Recent Customer Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200">
              <tr>
                <th className="p-3.5">Order #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kpis?.recentOrders?.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-rose-600">{ord.orderNumber}</td>
                  <td className="p-3.5 font-bold text-slate-900">{ord.user?.name}</td>
                  <td className="p-3.5 text-slate-500 font-medium">{new Date(ord.createdAt).toLocaleDateString()}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200">
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="p-3.5 font-black text-slate-900">₹{ord.grandTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { UserCheck, Search, ShieldOff, ShieldCheck, ShoppingBag, MessageSquare, Filter } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/admin/customers', { params });
      setCustomers(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

  const handleToggleBlock = async (customer) => {
    const nextStatus = customer.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const actionName = nextStatus === 'BLOCKED' ? 'Block' : 'Unblock';

    if (!window.confirm(`Are you sure you want to ${actionName} customer ${customer.email}?`)) return;

    try {
      await api.put(`/admin/customers/${customer.id}/block`, { status: nextStatus });
      toast.success(`Customer ${customer.name} is now ${nextStatus}`);
      fetchCustomers();
    } catch (error) {
      toast.error(error.message || `Failed to ${actionName} customer`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <UserCheck className="w-6 h-6 text-rose-500" /> Customer Account Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">View registered storefront customers, account status, and order activity</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 font-medium shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-bold shadow-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200">
            <tr>
              <th className="p-4">Customer Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Mobile</th>
              <th className="p-4 text-center">Orders</th>
              <th className="p-4 text-center">Reviews</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900">{c.name}</td>
                <td className="p-4 text-slate-600 font-medium">{c.email}</td>
                <td className="p-4 text-slate-500 font-medium">{c.mobile || 'N/A'}</td>
                <td className="p-4 text-center font-bold text-slate-900">
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                    <ShoppingBag className="w-3 h-3 text-rose-500" /> {c._count?.orders || 0}
                  </span>
                </td>
                <td className="p-4 text-center font-bold text-slate-900">
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                    <MessageSquare className="w-3 h-3 text-amber-500" /> {c._count?.reviews || 0}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                      c.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-4 text-slate-400 font-medium">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleToggleBlock(c)}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] inline-flex items-center gap-1 transition-all ${
                      c.status === 'ACTIVE'
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                    }`}
                  >
                    {c.status === 'ACTIVE' ? (
                      <>
                        <ShieldOff className="w-3.5 h-3.5" /> Block Customer
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Unblock Account
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

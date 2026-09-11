import React, { useEffect, useState } from 'react';
import { Users, Plus, Shield } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');

  const fetchStaff = () => {
    api.get('/admin/staff')
      .then((res) => setStaff(res.data || []))
      .catch(() => {});
    api.get('/admin/roles')
      .then((res) => setRoles(res.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/staff', { name, email, password, roleId });
      toast.success('Staff member onboarded successfully');
      setModalOpen(false);
      fetchStaff();
    } catch (error) {
      toast.error(error.message || 'Failed to onboard staff');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Users className="w-6 h-6 text-rose-500" /> Staff & RBAC Permissions Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage administrative staff and data-driven role permissions</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-rose-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Onboard Staff
        </button>
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900">{s.name}</td>
                <td className="p-4 text-slate-600 font-medium">{s.email}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200">
                    {s.role?.name}
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {s.status}
                  </span>
                </td>
                <td className="p-4 text-slate-400 font-medium">{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Onboard Staff Account</h3>
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white font-medium" />
              <input type="email" placeholder="Work Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white font-medium" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white font-medium" />
              <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium">
                <option value="">Select Role</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name} - {r.description}</option>)}
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black shadow-md shadow-rose-500/20">Save Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

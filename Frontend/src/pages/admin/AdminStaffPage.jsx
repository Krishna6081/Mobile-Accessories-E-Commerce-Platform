import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, Filter, Shield, Edit3, Power, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

export default function AdminStaffPage() {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const fetchStaffData = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const [staffRes, rolesRes] = await Promise.all([
        api.get('/admin/staff', { params }),
        api.get('/admin/roles'),
      ]);
      setStaff(staffRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch staff data');
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, [search, roleFilter, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setMobile('');
    setPassword('');
    setRoleId('');
    setStatus('ACTIVE');
    setModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingStaff(member);
    setName(member.name);
    setEmail(member.email);
    setMobile(member.mobile || '');
    setPassword('');
    setRoleId(member.role?.id || '');
    setStatus(member.status || 'ACTIVE');
    setModalOpen(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.put(`/admin/staff/${editingStaff.id}`, {
          name,
          email,
          mobile,
          password,
          roleId,
          status,
        });
        toast.success('Staff member updated successfully');
      } else {
        await api.post('/admin/staff', {
          name,
          email,
          mobile,
          password,
          roleId,
          status,
        });
        toast.success('Staff member onboarded successfully');
      }
      setModalOpen(false);
      fetchStaffData();
    } catch (error) {
      toast.error(error.message || 'Failed to save staff member');
    }
  };

  const handleToggleStatus = async (member) => {
    const nextStatus = member.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await api.put(`/admin/staff/${member.id}/status`, { status: nextStatus });
      toast.success(`Staff member ${member.name} status updated to ${nextStatus}`);
      fetchStaffData();
    } catch (error) {
      toast.error(error.message || 'Failed to change staff status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Users className="w-6 h-6 text-rose-500" /> Administrative Staff Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Onboard staff, assign roles, and manage access permissions</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-rose-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Onboard Staff Member
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 font-medium shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-bold shadow-sm"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
          </select>

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

      {/* Staff Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200">
            <tr>
              <th className="p-4">Staff Member</th>
              <th className="p-4">Email & Mobile</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Permissions Count</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-900">{s.name}</div>
                  <div className="text-[10px] text-slate-400">Created {new Date(s.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="p-4">
                  <div className="text-slate-900 font-medium">{s.email}</div>
                  <div className="text-slate-400">{s.mobile || 'No Mobile'}</div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                      s.role?.name === 'SUPER_ADMIN'
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : s.role?.name === 'ADMIN'
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}
                  >
                    {s.role?.name}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                      s.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="p-4 font-bold text-slate-700">
                  {s.role?.permissionsCount || 0} permissions
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(s)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(s)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors ${
                      s.status === 'ACTIVE'
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" /> {s.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Onboard / Edit Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">
              {editingStaff ? `Edit Staff Member: ${editingStaff.name}` : 'Onboard Staff Account'}
            </h3>
            <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Password {editingStaff && '(Leave blank to keep unchanged)'}
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingStaff}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 font-bold"
                >
                  <option value="">Select Role</option>
                  {roles.map((r) => {
                    // Non-SuperAdmin cannot assign SuperAdmin
                    if (r.name === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
                      return null;
                    }
                    return (
                      <option key={r.id} value={r.id}>
                        {r.name} - {r.description || 'No description'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 font-bold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="BLOCKED">BLOCKED</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black shadow-md shadow-rose-500/20"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

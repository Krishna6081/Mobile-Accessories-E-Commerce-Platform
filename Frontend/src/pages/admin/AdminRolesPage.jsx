import React, { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Check, Edit3, Trash2, CheckSquare, Square, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissionsGrouped, setPermissionsGrouped] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Form State
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleStatus, setRoleStatus] = useState('ACTIVE');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/admin/roles'),
        api.get('/admin/permissions'),
      ]);
      setRoles(rolesRes.data || []);
      setPermissionsGrouped(permsRes.data?.grouped || {});
    } catch (error) {
      toast.error(error.message || 'Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setRoleStatus('ACTIVE');
    setSelectedPermissions([]);
    setRoleModalOpen(true);
  };

  const handleOpenEditModal = (role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setRoleStatus(role.status || 'ACTIVE');
    setSelectedPermissions(role.permissionIds || []);
    setRoleModalOpen(true);
  };

  const togglePermission = (permId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const toggleModuleAll = (modulePerms) => {
    const permIds = modulePerms.map((p) => p.id);
    const allSelected = permIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !permIds.includes(id)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...permIds])));
    }
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await api.put(`/admin/roles/${editingRole.id}`, {
          name: roleName,
          description: roleDescription,
          status: roleStatus,
          permissionIds: selectedPermissions,
        });
        toast.success(`Role '${editingRole.name}' updated successfully`);
      } else {
        await api.post('/admin/roles', {
          name: roleName,
          description: roleDescription,
          status: roleStatus,
          permissionIds: selectedPermissions,
        });
        toast.success(`Role '${roleName}' created successfully`);
      }
      setRoleModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.isSystem) {
      toast.error('System roles cannot be deleted');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete role '${role.name}'?`)) return;

    try {
      await api.delete(`/admin/roles/${role.id}`);
      toast.success(`Role '${role.name}' deleted`);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <ShieldCheck className="w-6 h-6 text-rose-500" /> Dynamic Role & Permission Matrix
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Configure data-driven access rights and custom operational roles</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-rose-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Custom Role
        </button>
      </div>

      {/* Roles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200/60 uppercase tracking-wider">
                  {role.name}
                </span>
                {role.isSystem && (
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                    SYSTEM
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-2 min-h-[32px]">
                {role.description || 'No description provided'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Assigned Users:</span>
                <span className="text-slate-900 font-black">{role.usersCount}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Granted Permissions:</span>
                <span className="text-rose-600 font-black">{role.permissionsCount}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleOpenEditModal(role)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Matrix
                </button>
                {!role.isSystem && (
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Delete Role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Creating / Editing Role with Permission Matrix */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-3xl w-full space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingRole ? `Configure Role: ${editingRole.name}` : 'Create New Custom Role'}
              </h3>
              <button onClick={() => setRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    placeholder="e.g. INVENTORY_MANAGER"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    disabled={editingRole?.isSystem}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-rose-500 font-bold disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Role responsibilities..."
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={roleStatus}
                    onChange={(e) => setRoleStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-rose-500 font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="BLOCKED">BLOCKED / DISABLED</option>
                  </select>
                </div>
              </div>

              {/* PERMISSION MATRIX TABLE */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black text-slate-900 text-xs">Granular Permission Matrix</h4>
                  <span className="text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    {selectedPermissions.length} Permissions Selected
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-1/4">Module</th>
                        <th className="p-3">Permissions & Actions</th>
                        <th className="p-3 text-right">Select All</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {Object.entries(permissionsGrouped).map(([moduleName, modulePerms]) => {
                        const allPermIds = modulePerms.map((p) => p.id);
                        const isAllSelected = allPermIds.every((id) => selectedPermissions.includes(id));

                        return (
                          <tr key={moduleName} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold text-slate-900 align-top">
                              {moduleName}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-2">
                                {modulePerms.map((perm) => {
                                  const isChecked = selectedPermissions.includes(perm.id);
                                  return (
                                    <button
                                      type="button"
                                      key={perm.id}
                                      onClick={() => togglePermission(perm.id)}
                                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                        isChecked
                                          ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
                                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-rose-600" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                                      {perm.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="p-3 text-right align-top">
                              <button
                                type="button"
                                onClick={() => toggleModuleAll(modulePerms)}
                                className="text-[10px] font-extrabold text-blue-600 hover:underline"
                              >
                                {isAllSelected ? 'Deselect All' : 'Select All'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black shadow-md shadow-rose-500/20"
                >
                  Save Role Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

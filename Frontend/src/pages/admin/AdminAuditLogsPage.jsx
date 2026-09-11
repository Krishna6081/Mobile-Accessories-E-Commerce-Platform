import React, { useEffect, useState } from 'react';
import { FileText, Shield } from 'lucide-react';
import api from '../../services/api';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-logs')
      .then((res) => setLogs(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400">Loading audit trail logs...</div>;

  return (
    <div className="space-y-6">
      <div>
        <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase border border-rose-200">Super Admin Security Tool</span>
        <h1 className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2.5 tracking-tight">
          <FileText className="w-6 h-6 text-rose-500" /> System Audit Trail Logs
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Immutable record of sensitive operations, logins, credential updates, and permission changes</p>
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-b border-slate-200">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">User</th>
              <th className="p-4">Module</th>
              <th className="p-4">Action</th>
              <th className="p-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap font-medium">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="p-4 font-bold text-slate-900">{log.user?.email || 'System'}</td>
                <td className="p-4"><span className="px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-700">{log.module}</span></td>
                <td className="p-4"><span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-black">{log.action}</span></td>
                <td className="p-4 text-slate-600 font-medium max-w-xs truncate">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Home } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const isStaff = user && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10 bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 p-8 rounded-3xl shadow-2xl">
        <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/30 rounded-3xl flex items-center justify-center mx-auto text-rose-500 shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full text-xs font-black text-rose-400 uppercase tracking-widest">
            HTTP 403 FORBIDDEN
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white pt-2">Access Denied</h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            You don't have permission to access this page or perform this action.
          </p>
        </div>

        {user && (
          <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-2xl text-left text-xs space-y-1">
            <p className="text-slate-400 font-semibold">Logged in as: <span className="text-white font-bold">{user.email}</span></p>
            <p className="text-slate-400 font-semibold">Role: <span className="text-rose-400 font-bold uppercase">{user.role}</span></p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          {isStaff ? (
            <Link
              to="/admin/dashboard"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              <Home className="w-4 h-4" /> Go to Home
            </Link>
          )}

          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 px-4 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-600/50"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Shield, MapPin, Key, LogOut } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';

export default function AccountPage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-rose-500/20">
          {user?.name?.[0] || 'U'}
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
          <p className="text-xs text-slate-500 font-medium">{user?.email} • {user?.mobile || 'No mobile'}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase">
            Role: {user?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" /> Default Delivery Address
          </h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">Indiranagar, MG Road, Bengaluru, Karnataka - 560038</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-rose-500" /> Account Security
          </h3>
          <p className="text-xs text-slate-500 font-medium">Password protected with 256-bit JWT authentication.</p>
          <button
            onClick={() => dispatch(logout())}
            className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-black transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Logout Account
          </button>
        </div>
      </div>
    </div>
  );
}

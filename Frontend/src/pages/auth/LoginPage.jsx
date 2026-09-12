import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LogIn, Lock, Mail, Shield, UserCheck, ShieldAlert, Users, Sparkles } from 'lucide-react';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  {
    role: 'CUSTOMER',
    label: 'Customer',
    icon: UserCheck,
    email: 'customer@example.com',
    password: 'Customer123!',
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    badge: 'Storefront Access',
  },
  {
    role: 'MANAGER',
    label: 'Manager / Staff',
    icon: Users,
    email: 'manager@example.com',
    password: 'Manager123!',
    color: 'border-amber-200 bg-amber-50 text-amber-700',
    badge: 'Orders & Inventory',
  },
  {
    role: 'ADMIN',
    label: 'Administrator',
    icon: Shield,
    email: 'admin@example.com',
    password: 'Admin123!',
    color: 'border-rose-200 bg-rose-50 text-rose-700',
    badge: 'Operations & Catalog',
  },
  {
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    icon: ShieldAlert,
    email: 'superadmin@example.com',
    password: 'SuperAdmin123!',
    color: 'border-purple-200 bg-purple-50 text-purple-700',
    badge: 'Full Master Access',
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('CUSTOMER');
  const [email, setEmail] = useState('customer@example.com');
  const [password, setPassword] = useState('Customer123!');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSelectRole = (acc) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.password);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      dispatch(setCredentials(res.data));
      toast.success(`Welcome back, ${res.data.user.name}! (${res.data.user.role})`);

      if (['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(res.data.user.role)) {
        navigate('/admin/dashboard');
      } else {
        navigate('/account');
      }
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mx-auto shadow-md overflow-hidden border border-slate-700 p-0.5">
            <img src="/mobixia-logo.jpg" alt="Mobixia Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 pt-1 tracking-tight">
            Account Sign In
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Select a role account or enter your credentials to log in
          </p>
        </div>

        {/* 4 User Roles Quick Selector Option Cards */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Select Role Demo Account:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isSelected = selectedRole === acc.role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectRole(acc)}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-rose-500/50 scale-[1.02]'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl border ${isSelected ? 'bg-slate-800 border-slate-700 text-rose-400' : acc.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black">{acc.label}</span>
                    </div>
                  </div>
                  <p className={`text-[10px] font-medium mt-1.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {acc.badge}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs pt-2">
          <div>
            <label className="text-slate-700 font-bold block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 pl-9 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 pl-9 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-500/20 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : `Sign In as ${selectedRole.replace('_', ' ')}`}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/register" className="text-rose-600 font-black hover:underline">
            Create Customer Account
          </Link>
        </div>
      </div>
    </div>
  );
}

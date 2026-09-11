import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LogIn, Lock, Mail, Shield, UserCheck } from 'lucide-react';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [loginType, setLoginType] = useState('CUSTOMER'); // 'CUSTOMER' or 'ADMIN'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      dispatch(setCredentials(res.data));
      toast.success(`Welcome back, ${res.data.user.name}!`);

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

  const handleQuickFill = (type) => {
    if (type === 'ADMIN') {
      setLoginType('ADMIN');
      setEmail('superadmin@accessories.com');
      setPassword('SuperAdmin123!');
    } else {
      setLoginType('CUSTOMER');
      setEmail('customer@example.com');
      setPassword('Customer123!');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mx-auto shadow-md overflow-hidden border border-slate-700 p-0.5">
            <img src="/mobixia-logo.jpg" alt="Mobixia Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-black text-slate-900 pt-1 tracking-tight">
            {loginType === 'ADMIN' ? 'Admin & Staff Portal Login' : 'Customer Account Login'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {loginType === 'ADMIN' ? 'Access database management & sales analytics' : 'Sign in to your Mobixia account'}
          </p>
        </div>

        {/* Login Role Toggle Option */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/60">
          <button
            type="button"
            onClick={() => handleQuickFill('CUSTOMER')}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              loginType === 'CUSTOMER'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Customer Login
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('ADMIN')}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              loginType === 'ADMIN'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin Portal
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 font-bold block mb-1">
              {loginType === 'ADMIN' ? 'Admin Work Email' : 'Email Address'}
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder={loginType === 'ADMIN' ? 'superadmin@accessories.com' : 'customer@example.com'}
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
            {loginType === 'ADMIN' ? <Shield className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Authenticating...' : loginType === 'ADMIN' ? 'Sign In as Admin' : 'Sign In as Customer'}
          </button>
        </form>

        {/* Quick Demo Helper Strip */}
        <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2 text-center text-xs">
          <p className="text-[11px] font-bold text-slate-600">⚡ Quick Demo Credentials Auto-Fill:</p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('CUSTOMER')}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-rose-600 hover:border-rose-200 shadow-sm"
            >
              Customer Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('ADMIN')}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-rose-600 hover:bg-rose-50 border-rose-200 shadow-sm flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-rose-500" /> Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-rose-600 font-black hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

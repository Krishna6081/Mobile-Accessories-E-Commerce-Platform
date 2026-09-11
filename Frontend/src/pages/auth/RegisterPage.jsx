import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, mobile, password });
      toast.success('Account created! Please check your email for OTP verification.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Create Customer Account</h1>
          <p className="text-xs text-slate-500 font-medium">Join for fast checkout and exclusive accessory deals</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-700 font-bold block mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 pl-9 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 pl-9 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Mobile Number</label>
            <div className="relative">
              <input
                type="text"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 pl-9 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium font-mono"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
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
            <UserPlus className="w-4 h-4" /> {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 font-medium">
          Already registered?{' '}
          <Link to="/login" className="text-rose-600 font-black hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

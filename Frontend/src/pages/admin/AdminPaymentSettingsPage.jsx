import React, { useEffect, useState } from 'react';
import { ShieldAlert, Key, Lock, Eye, CheckCircle, History } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminPaymentSettingsPage() {
  const [creds, setCreds] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [mode, setMode] = useState('TEST');
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const fetchCreds = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/payment-credentials'),
      api.get('/admin/payment-credentials/history'),
    ])
      .then(([cRes, hRes]) => {
        const c = cRes.data;
        setCreds(c);
        setMode(c.mode || 'TEST');
        setKeyId(c.keyId || '');
        setHistory(hRes.data || []);
      })
      .catch((err) => toast.error('Failed to load payment credentials. Super Admin access required.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCreds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required for step-up verification');
      return;
    }

    try {
      const res = await api.post('/admin/payment-credentials', {
        currentPassword,
        mode,
        keyId,
        keySecret,
        webhookSecret,
      });

      toast.success('Payment Gateway Credentials updated with AES-256 Encryption at Rest!');
      setCurrentPassword('');
      setKeySecret('');
      setWebhookSecret('');
      fetchCreds();
    } catch (error) {
      toast.error(error.message || 'Verification failed or incorrect password');
    }
  };

  if (loading) return <div className="text-slate-400">Loading payment security settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase border border-rose-200">
            SUPER ADMIN EXCLUSIVE
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2.5 tracking-tight">
          <Key className="w-6 h-6 text-amber-500" /> Razorpay Payment Gateway Credentials
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Credentials are stored with <strong className="text-slate-800">AES-256-GCM encryption at rest</strong>. Secret keys are strictly masked and never exposed to the client.
        </p>
      </div>

      {/* Current Active Status Box */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-bold">Gateway Provider: <strong className="text-slate-900">Razorpay</strong></span>
          <p className="text-xs text-slate-700 font-medium mt-1">Key ID: <code className="text-rose-600 font-mono font-bold">{creds?.keyId}</code></p>
          <p className="text-xs text-slate-500 mt-0.5">Secret Key: <code className="text-slate-400 font-mono">{creds?.keySecretMasked}</code></p>
        </div>
        <span className={`px-3.5 py-1.5 rounded-full text-xs font-black border ${creds?.mode === 'LIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
          Mode: {creds?.mode}
        </span>
      </div>

      {/* Security Gated Configuration Form */}
      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
          <Lock className="w-4 h-4 text-rose-500" /> Step-Up Authenticated Gateway Editor
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-700 font-bold block mb-1">Environment Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
            >
              <option value="TEST">TEST Mode (Development / Mocking)</option>
              <option value="LIVE">LIVE Production Mode</option>
            </select>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Razorpay Key ID</label>
            <input
              type="text"
              placeholder="rzp_test_..."
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
            />
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Razorpay Key Secret</label>
            <input
              type="password"
              placeholder="Enter new secret key to update"
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
            />
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Razorpay Webhook Secret (Optional)</label>
            <input
              type="password"
              placeholder="Enter webhook secret"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono focus:outline-none focus:border-rose-500 focus:bg-white font-medium"
            />
          </div>
        </div>

        {/* Password Step-up check */}
        <div className="p-4.5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2 text-xs">
          <label className="text-rose-700 font-black flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Require Current Super Admin Password to Save Changes
          </label>
          <input
            type="password"
            placeholder="Enter your current Super Admin password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full bg-white border border-rose-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-rose-500/20 transition-all"
        >
          Encrypt & Save Payment Credentials
        </button>
      </form>

      {/* Credential History Audit */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-rose-500" /> Credential Change Audit History
        </h3>
        <div className="space-y-2 text-xs text-slate-700">
          {history.map((h) => (
            <div key={h.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">{h.action}</span>
                <span className="text-[10px] text-slate-500 font-semibold ml-2">Mode: {h.mode}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{new Date(h.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

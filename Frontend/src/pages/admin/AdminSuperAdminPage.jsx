import React, { useEffect, useState } from 'react';
import { ShieldAlert, Key, Mail, Phone, UserCheck, ArrowRightLeft, Send, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSuperAdminPage() {
  const [profile, setProfile] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Contact OTP Change State
  const [contactType, setContactType] = useState('CHANGE_EMAIL'); // CHANGE_EMAIL or CHANGE_MOBILE
  const [newTarget, setNewTarget] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [contactPassword, setContactPassword] = useState('');

  // Ownership Transfer State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [transferPassword, setTransferPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');

  const fetchSuperAdminData = async () => {
    try {
      setLoading(true);
      const [profileRes, staffRes] = await Promise.all([
        api.get('/admin/super-admin/profile'),
        api.get('/admin/staff'),
      ]);
      setProfile(profileRes.data || null);
      setName(profileRes.data?.name || '');
      setStaffList(staffRes.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load Super Admin profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/super-admin/profile', {
        name,
        currentPassword,
        newPassword,
      });
      toast.success('Super Admin profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      fetchSuperAdminData();
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleSendOtp = async () => {
    if (!newTarget) {
      toast.error('Please enter new email or mobile number');
      return;
    }
    try {
      await api.post('/admin/super-admin/send-otp', {
        target: newTarget,
        type: contactType,
      });
      toast.success(`Verification OTP sent to ${newTarget}`);
      setOtpSent(true);
    } catch (error) {
      toast.error(error.message || 'Failed to send verification OTP');
    }
  };

  const handleVerifyAndUpdateContact = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/super-admin/verify-update', {
        target: newTarget,
        otp,
        type: contactType,
        currentPassword: contactPassword,
      });
      toast.success('Contact details updated successfully');
      setOtpSent(false);
      setNewTarget('');
      setOtp('');
      setContactPassword('');
      fetchSuperAdminData();
    } catch (error) {
      toast.error(error.message || 'Verification failed');
    }
  };

  const handleTransferSuperAdmin = async (e) => {
    e.preventDefault();
    if (confirmationText !== 'TRANSFER SUPER ADMIN') {
      toast.error('Please type TRANSFER SUPER ADMIN to confirm');
      return;
    }
    try {
      await api.post('/admin/super-admin/transfer', {
        targetUserId,
        currentPassword: transferPassword,
        confirmationText,
      });
      toast.success('Super Administrator ownership transferred successfully!');
      setTransferModalOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error(error.message || 'Ownership transfer failed');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <ShieldAlert className="w-6 h-6 text-rose-500" /> Super Admin Master Configuration
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage master security credentials, OTP verification, and ownership transfer</p>
        </div>
        <button
          onClick={() => setTransferModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all"
        >
          <ArrowRightLeft className="w-4 h-4 text-amber-400" /> Transfer Super Admin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Profile & Password Update */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-rose-500" /> Super Admin Security Credentials
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-bold focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Change Password</p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Password (Required for Password Change)</label>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="New Secure Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-xs shadow-md shadow-rose-500/20"
            >
              Update Security Credentials
            </button>
          </form>
        </div>

        {/* Section 2: Email / Mobile Change via OTP */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" /> Sensitive Contact Details & OTP Verification
          </h3>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs space-y-1">
            <p className="text-slate-600 font-bold">Current Email: <span className="text-slate-900">{profile?.email}</span></p>
            <p className="text-slate-600 font-bold">Current Mobile: <span className="text-slate-900">{profile?.mobile || 'N/A'}</span></p>
          </div>

          <form onSubmit={handleVerifyAndUpdateContact} className="space-y-3 text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setContactType('CHANGE_EMAIL'); setOtpSent(false); }}
                className={`flex-1 py-2 rounded-xl font-bold text-[11px] border transition-all ${
                  contactType === 'CHANGE_EMAIL'
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Change Email
              </button>
              <button
                type="button"
                onClick={() => { setContactType('CHANGE_MOBILE'); setOtpSent(false); }}
                className={`flex-1 py-2 rounded-xl font-bold text-[11px] border transition-all ${
                  contactType === 'CHANGE_MOBILE'
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Change Mobile
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                New {contactType === 'CHANGE_EMAIL' ? 'Email Address' : 'Mobile Number'}
              </label>
              <div className="flex gap-2">
                <input
                  type={contactType === 'CHANGE_EMAIL' ? 'email' : 'text'}
                  placeholder={contactType === 'CHANGE_EMAIL' ? 'newemail@example.com' : '9876543210'}
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  required
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Send OTP
                </button>
              </div>
            </div>

            {otpSent && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-black tracking-widest text-center text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Password (Required for Step-Up Security)</label>
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={contactPassword}
                    onChange={(e) => setContactPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20"
                >
                  Verify OTP & Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Modal for Ownership Transfer */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-rose-600 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" /> Transfer Super Administrator Ownership
              </h3>
              <button onClick={() => setTransferModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1 font-medium">
              <p className="font-extrabold text-rose-900">⚠️ CRITICAL ACTION WARNING:</p>
              <p>Transferring Super Admin status will elevate the target staff member to full Super Administrator rights and reassign your current account to standard Administrator.</p>
            </div>

            <form onSubmit={handleTransferSuperAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Target Staff Member</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-bold focus:outline-none focus:border-rose-500"
                >
                  <option value="">Select Staff Account...</option>
                  {staffList
                    .filter((s) => s.role?.name !== 'SUPER_ADMIN')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email}) - Current Role: {s.role?.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Current Password</label>
                <input
                  type="password"
                  placeholder="Enter your current password"
                  value={transferPassword}
                  onChange={(e) => setTransferPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Type <span className="font-black text-rose-600">TRANSFER SUPER ADMIN</span> to Confirm
                </label>
                <input
                  type="text"
                  placeholder="TRANSFER SUPER ADMIN"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-black focus:outline-none focus:border-rose-500 uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-md shadow-rose-600/20"
                >
                  Confirm Ownership Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

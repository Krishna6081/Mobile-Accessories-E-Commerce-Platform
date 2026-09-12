import React from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  KeyRound,
  FileText,
  Users,
  ShieldCheck,
  UserCheck,
  Tag,
  MessageSquare,
  FileCode,
  BarChart3,
  LogOut,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';

const ROLE_LABELS = {
  CUSTOMER: 'Customer',
  MANAGER: 'Staff / Manager',
  ADMIN: 'Administrator',
  SUPER_ADMIN: 'Super Administrator',
};

export default function AdminLayout() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // If user is not logged in or is a CUSTOMER attempting to access /admin, redirect to 403 / login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'CUSTOMER') {
    return <Navigate to="/403" replace />;
  }

  const userPermissions = user.permissions || [];
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, perm: 'dashboard.view' },
    { label: 'Products', path: '/admin/products', icon: Package, perm: 'product.view' },
    { label: 'Categories & Brands', path: '/admin/categories', icon: SlidersHorizontal, perm: 'category.view' },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes, perm: 'inventory.view' },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, perm: 'order.view' },
    { label: 'Customers', path: '/admin/customers', icon: UserCheck, perm: 'customer.view' },
    { label: 'Coupons & Banners', path: '/admin/marketing', icon: Tag, perm: 'coupon.view' },
    { label: 'Reviews', path: '/admin/reviews', icon: MessageSquare, perm: 'review.view' },
    { label: 'CMS Content', path: '/admin/cms', icon: FileCode, perm: 'cms.view' },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3, perm: 'report.view' },
    { label: 'Staff Management', path: '/admin/staff', icon: Users, perm: 'staff.view' },
    { label: 'Roles & Permissions', path: '/admin/roles', icon: ShieldCheck, perm: 'role.view' },
    { label: 'Payment Gateway', path: '/admin/payment-settings', icon: KeyRound, perm: 'payment.view' },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText, perm: 'audit.view' },
    { label: 'Super Admin', path: '/admin/super-admin', icon: ShieldAlert, perm: 'superadmin.manage' },
  ];

  const filteredNav = navItems.filter((item) => {
    if (isSuperAdmin) return true;
    return userPermissions.includes(item.perm);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 backdrop-blur-md border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0 shadow-sm overflow-y-auto max-h-screen sticky top-0">
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2 pt-2">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 text-base font-black text-slate-900 tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center overflow-hidden border border-slate-700 shadow-md p-0.5">
                <img src="/mobixia-logo.jpg" alt="Mobixia Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-slate-900">Mobi<span className="text-blue-600">X</span>ia Admin</span>
            </Link>
          </div>

          {/* User Role Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/60 to-amber-50/60 border border-slate-200/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black flex items-center justify-center text-xs shadow-sm uppercase">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 truncate">{user?.name}</p>
              <span className="inline-block text-[10px] text-rose-600 font-extrabold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md border border-rose-200/50 mt-0.5">
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
            </div>
          </div>

          {/* Dynamic Navigation */}
          <nav className="space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black shadow-md shadow-rose-500/20 translate-x-1'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 pt-4 mt-6 border-t border-slate-200/80">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-rose-500" />
          </Link>

          <button
            onClick={() => {
              dispatch(logout());
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

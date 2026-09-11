import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  KeyRound,
  FileText,
  Users,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';

export default function AdminLayout() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, perm: 'reports.view' },
    { label: 'Products', path: '/admin/products', icon: Package, perm: 'product.view' },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes, perm: 'inventory.view' },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, perm: 'order.view' },
    { label: 'Staff & Roles', path: '/admin/staff', icon: Users, perm: 'staff.view' },
    { label: 'Payment Config', path: '/admin/payment-settings', icon: KeyRound, superOnly: true },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText, superOnly: true },
  ];

  const filteredNav = navItems.filter((item) => {
    if (item.superOnly && user?.role !== 'SUPER_ADMIN') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 backdrop-blur-md border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 pt-2">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 text-base font-black text-slate-900 tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center overflow-hidden border border-slate-700 shadow-md p-0.5">
                <img src="/mobixia-logo.jpg" alt="Mobixia Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-slate-900">Mobi<span className="text-blue-600">X</span>ia Admin</span>
            </Link>
          </div>

          {/* Staff Info */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/60 to-amber-50/60 border border-slate-200/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black flex items-center justify-center text-xs shadow-sm">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 truncate">{user?.name}</p>
              <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-wider">{user?.role}</span>
            </div>
          </div>

          <nav className="space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
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

        <div className="space-y-2 pt-4 border-t border-slate-200/80">
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

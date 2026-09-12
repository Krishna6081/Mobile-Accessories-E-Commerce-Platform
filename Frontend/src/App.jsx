import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';

import HomePage from './pages/customer/HomePage';
import ShopPage from './pages/customer/ShopPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';
import OrdersPage from './pages/customer/OrdersPage';
import WishlistPage from './pages/customer/WishlistPage';
import AccountPage from './pages/customer/AccountPage';
import CmsPageViewer from './pages/customer/CmsPageViewer';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AccessDeniedPage from './pages/AccessDeniedPage';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminPaymentSettingsPage from './pages/admin/AdminPaymentSettingsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminSuperAdminPage from './pages/admin/AdminSuperAdminPage';

function StorefrontLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
          },
        }}
      />
      <Routes>
        {/* Access Denied Route */}
        <Route path="/403" element={<AccessDeniedPage />} />

        {/* Customer Storefront Routes */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/category/:slug" element={<ShopPage />} />
          <Route path="/search" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrdersPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/account/profile" element={<AccountPage />} />

          {/* CMS Static Policy Routes */}
          <Route path="/about" element={<CmsPageViewer />} />
          <Route path="/contact" element={<CmsPageViewer />} />
          <Route path="/privacy-policy" element={<CmsPageViewer />} />
          <Route path="/terms" element={<CmsPageViewer />} />
          <Route path="/shipping-policy" element={<CmsPageViewer />} />
          <Route path="/refund-policy" element={<CmsPageViewer />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="super-admin" element={<AdminSuperAdminPage />} />
          <Route path="payment-settings" element={<AdminPaymentSettingsPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        </Route>
      </Routes>
    </>
  );
}

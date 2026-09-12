import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RoleGuard({ roles, children, fallback = null }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    if (fallback) return fallback;
    return <Navigate to="/403" replace />;
  }

  return children;
}

export function PermissionGuard({ permission, children, fallback = null }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Super Admin bypasses individual permission checks
  if (user.role === 'SUPER_ADMIN') {
    return children;
  }

  const hasPermission = user.permissions && user.permissions.includes(permission);

  if (!hasPermission) {
    if (fallback !== null) {
      return fallback;
    }
    return <Navigate to="/403" replace />;
  }

  return children;
}

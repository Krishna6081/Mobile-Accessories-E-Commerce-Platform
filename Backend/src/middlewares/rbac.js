const ApiResponse = require('../utils/response');

const requirePermission = (permissionName) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated user', 401);
    }

    // Super Admin bypasses individual permission checks
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!req.user.permissions || !req.user.permissions.includes(permissionName)) {
      return ApiResponse.error(res, 'You do not have permission to perform this action', 403);
    }

    next();
  };
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated user', 401);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(res, 'Access denied. Insufficient role hierarchy.', 403);
    }

    next();
  };
};

module.exports = {
  requirePermission,
  requireRole,
};

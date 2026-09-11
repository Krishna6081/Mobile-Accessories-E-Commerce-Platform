const { verifyAccessToken } = require('../utils/jwt');
const ApiResponse = require('../utils/response');
const prisma = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Authentication token missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.status === 'BLOCKED') {
      return ApiResponse.error(res, 'User account is inactive or blocked', 403);
    }

    // Attach permissions array to request
    const permissions = user.role.rolePermissions.map((rp) => rp.permission.name);

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      roleId: user.roleId,
      permissions,
    };

    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired access token', 401);
  }
};

module.exports = authenticate;

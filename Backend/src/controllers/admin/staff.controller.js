const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const ApiResponse = require('../../utils/response');
const AuditService = require('../../services/audit.service');

class StaffController {
  static async listStaff(req, res, next) {
    try {
      const staff = await prisma.user.findMany({
        where: { role: { name: { in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] } } },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          status: true,
          createdAt: true,
          role: { select: { id: true, name: true, description: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return ApiResponse.success(res, 'Staff members retrieved', staff);
    } catch (error) {
      next(error);
    }
  }

  static async createStaff(req, res, next) {
    try {
      const { name, email, mobile, password, roleId } = req.body;

      if (!name || !email || !password || !roleId) {
        return ApiResponse.error(res, 'Name, email, password, and roleId are required', 400);
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return ApiResponse.error(res, 'Email is already registered', 409);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          mobile: mobile || null,
          password: hashedPassword,
          roleId,
          isEmailVerified: true,
          isMobileVerified: true,
        },
        include: { role: true },
      });

      await AuditService.logAction({ userId: req.user.id, module: 'Staff', action: 'CREATE_STAFF', description: `Created staff user ${email} with role ${user.role.name}`, req });

      return ApiResponse.success(res, 'Staff member created successfully', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async listRoles(req, res, next) {
    try {
      const roles = await prisma.role.findMany({
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      });
      return ApiResponse.success(res, 'Roles retrieved', roles);
    } catch (error) {
      next(error);
    }
  }

  static async updateRolePermissions(req, res, next) {
    try {
      const { roleId } = req.params;
      const { permissionIds } = req.body; // Array of permission IDs

      if (!Array.isArray(permissionIds)) {
        return ApiResponse.error(res, 'permissionIds must be an array', 400);
      }

      await prisma.$transaction(async (tx) => {
        // Clear existing
        await tx.rolePermission.deleteMany({ where: { roleId } });

        // Add new permissions
        const data = permissionIds.map((pId) => ({ roleId, permissionId: pId }));
        await tx.rolePermission.createMany({ data });
      });

      await AuditService.logAction({ userId: req.user.id, module: 'Security', action: 'UPDATE_ROLE_PERMISSIONS', description: `Updated permissions for Role ${roleId}`, req });

      return ApiResponse.success(res, 'Role permissions updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StaffController;

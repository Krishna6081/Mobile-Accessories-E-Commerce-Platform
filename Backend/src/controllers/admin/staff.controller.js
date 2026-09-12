const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const ApiResponse = require('../../utils/response');
const AuditService = require('../../services/audit.service');

class StaffController {
  // --- STAFF MANAGEMENT ---
  static async listStaff(req, res, next) {
    try {
      const { search, role, status } = req.query;

      const where = {
        role: { name: { in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] } },
      };

      if (role) {
        where.role.name = role;
      }
      if (status) {
        where.status = status;
      }
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
          { mobile: { contains: search } },
        ];
      }

      const staff = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
              isSystem: true,
              status: true,
              rolePermissions: {
                select: {
                  permission: {
                    select: { id: true, name: true, module: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Format response to include flat permissions list
      const formattedStaff = staff.map((member) => ({
        ...member,
        role: {
          id: member.role.id,
          name: member.role.name,
          description: member.role.description,
          isSystem: member.role.isSystem,
          status: member.role.status,
          permissionsCount: member.role.rolePermissions.length,
          permissions: member.role.rolePermissions.map((rp) => rp.permission.name),
        },
      }));

      return ApiResponse.success(res, 'Staff members retrieved', formattedStaff);
    } catch (error) {
      next(error);
    }
  }

  static async createStaff(req, res, next) {
    try {
      const { name, email, mobile, password, roleId, status } = req.body;

      if (!name || !email || !password || !roleId) {
        return ApiResponse.error(res, 'Name, email, password, and role are required', 400);
      }

      const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
      if (!targetRole) {
        return ApiResponse.error(res, 'Selected role does not exist', 400);
      }

      // Security check: Only SUPER_ADMIN can create a SUPER_ADMIN account
      if (targetRole.name === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return ApiResponse.error(res, 'Only Super Administrators can create Super Admin accounts', 403);
      }

      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { mobile: mobile || undefined }] },
      });
      if (existing) {
        return ApiResponse.error(res, 'Email or mobile number is already registered', 409);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          mobile: mobile || null,
          password: hashedPassword,
          roleId: targetRole.id,
          status: status || 'ACTIVE',
          isEmailVerified: true,
          isMobileVerified: true,
        },
        include: { role: true },
      });

      await AuditService.logAction({
        userId: req.user.id,
        module: 'Staff',
        action: 'CREATE_STAFF',
        description: `Created staff member ${email} with role ${targetRole.name}`,
        req,
      });

      return ApiResponse.success(res, 'Staff member onboarded successfully', {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        status: user.status,
        role: user.role.name,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateStaff(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, mobile, password, roleId, status } = req.body;

      const existingStaff = await prisma.user.findUnique({
        where: { id },
        include: { role: true },
      });

      if (!existingStaff) {
        return ApiResponse.error(res, 'Staff member not found', 404);
      }

      // Security check: If target is SUPER_ADMIN or trying to upgrade to SUPER_ADMIN, caller must be SUPER_ADMIN
      if ((existingStaff.role.name === 'SUPER_ADMIN' || roleId) && req.user.role !== 'SUPER_ADMIN') {
        if (roleId) {
          const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
          if (targetRole && targetRole.name === 'SUPER_ADMIN') {
            return ApiResponse.error(res, 'Only Super Administrators can assign Super Admin role', 403);
          }
        }
        if (existingStaff.role.name === 'SUPER_ADMIN') {
          return ApiResponse.error(res, 'Only Super Administrators can edit Super Admin accounts', 403);
        }
      }

      const data = {};
      if (name) data.name = name;
      if (email) data.email = email;
      if (mobile !== undefined) data.mobile = mobile || null;
      if (status) data.status = status;
      if (roleId) data.roleId = roleId;
      if (password && password.trim() !== '') {
        data.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data,
        include: { role: true },
      });

      await AuditService.logAction({
        userId: req.user.id,
        module: 'Staff',
        action: 'UPDATE_STAFF',
        description: `Updated staff member ${updatedUser.email}`,
        req,
      });

      return ApiResponse.success(res, 'Staff member updated successfully', {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        status: updatedUser.status,
        role: updatedUser.role.name,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleStaffStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body; // ACTIVE or BLOCKED

      const existingStaff = await prisma.user.findUnique({
        where: { id },
        include: { role: true },
      });

      if (!existingStaff) {
        return ApiResponse.error(res, 'Staff member not found', 404);
      }

      if (existingStaff.role.name === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return ApiResponse.error(res, 'Only Super Administrators can modify Super Admin status', 403);
      }

      const newStatus = status || (existingStaff.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE');

      const updated = await prisma.user.update({
        where: { id },
        data: { status: newStatus },
      });

      await AuditService.logAction({
        userId: req.user.id,
        module: 'Staff',
        action: 'TOGGLE_STAFF_STATUS',
        description: `Changed staff status for ${updated.email} to ${newStatus}`,
        req,
      });

      return ApiResponse.success(res, `Staff member status updated to ${newStatus}`, {
        id: updated.id,
        status: updated.status,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- ROLE & PERMISSION MANAGEMENT ---
  static async listRoles(req, res, next) {
    try {
      const roles = await prisma.role.findMany({
        include: {
          rolePermissions: {
            include: { permission: true },
          },
          _count: {
            select: { users: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      const formattedRoles = roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
        status: r.status,
        usersCount: r._count.users,
        permissionsCount: r.rolePermissions.length,
        permissions: r.rolePermissions.map((rp) => rp.permission),
        permissionIds: r.rolePermissions.map((rp) => rp.permissionId),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

      return ApiResponse.success(res, 'Roles retrieved', formattedRoles);
    } catch (error) {
      next(error);
    }
  }

  static async createRole(req, res, next) {
    try {
      const { name, description, permissionIds, status } = req.body;

      if (!name) {
        return ApiResponse.error(res, 'Role name is required', 400);
      }

      const normalizedName = name.trim().toUpperCase().replace(/\s+/g, '_');

      const existing = await prisma.role.findUnique({ where: { name: normalizedName } });
      if (existing) {
        return ApiResponse.error(res, `Role '${normalizedName}' already exists`, 409);
      }

      const role = await prisma.$transaction(async (tx) => {
        const createdRole = await tx.role.create({
          data: {
            name: normalizedName,
            description: description || null,
            isSystem: false,
            status: status || 'ACTIVE',
          },
        });

        if (Array.isArray(permissionIds) && permissionIds.length > 0) {
          const rpData = permissionIds.map((pId) => ({
            roleId: createdRole.id,
            permissionId: pId,
          }));
          await tx.rolePermission.createMany({ data: rpData });
        }

        return createdRole;
      });

      await AuditService.logAction({
        userId: req.user.id,
        module: 'Security',
        action: 'CREATE_ROLE',
        description: `Created custom role ${normalizedName}`,
        req,
      });

      return ApiResponse.success(res, 'Role created successfully', role, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req, res, next) {
    try {
      const { roleId } = req.params;
      const { name, description, status, permissionIds } = req.body;

      const existingRole = await prisma.role.findUnique({ where: { id: roleId } });
      if (!existingRole) {
        return ApiResponse.error(res, 'Role not found', 404);
      }

      await prisma.$transaction(async (tx) => {
        const data = {};
        if (description !== undefined) data.description = description;
        if (status) data.status = status;
        if (name && !existingRole.isSystem) {
          data.name = name.trim().toUpperCase().replace(/\s+/g, '_');
        }

        await tx.role.update({
          where: { id: roleId },
          data,
        });

        if (Array.isArray(permissionIds)) {
          await tx.rolePermission.deleteMany({ where: { roleId } });
          if (permissionIds.length > 0) {
            const rpData = permissionIds.map((pId) => ({
              roleId,
              permissionId: pId,
            }));
            await tx.rolePermission.createMany({ data: rpData });
          }
        }
      });

      await AuditService.logAction({
        userId: req.user.id,
        module: 'Security',
        action: 'UPDATE_ROLE',
        description: `Updated role ${existingRole.name}`,
        req,
      });

      return ApiResponse.success(res, 'Role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteRole(req, res, next) {
    try {
      const { roleId } = req.params;
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: { _count: { select: { users: true } } },
      });

      if (!role) {
        return ApiResponse.error(res, 'Role not found', 404);
      }

      if (role.isSystem) {
        return ApiResponse.error(res, 'System roles cannot be deleted', 403);
      }

      if (role._count.users > 0) {
        return ApiResponse.error(res, `Cannot delete role with ${role._count.users} assigned users`, 400);
      }

      await prisma.role.delete({ where: { id: roleId } });

      await AuditService.logAction({
        userId: req.user.id,
        module: 'Security',
        action: 'DELETE_ROLE',
        description: `Deleted custom role ${role.name}`,
        req,
      });

      return ApiResponse.success(res, 'Role deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateRolePermissions(req, res, next) {
    try {
      const { roleId } = req.params;
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds)) {
        return ApiResponse.error(res, 'permissionIds must be an array', 400);
      }

      const role = await prisma.role.findUnique({ where: { id: roleId } });
      if (!role) {
        return ApiResponse.error(res, 'Role not found', 404);
      }

      await prisma.$transaction(async (tx) => {
        await tx.rolePermission.deleteMany({ where: { roleId } });

        if (permissionIds.length > 0) {
          const data = permissionIds.map((pId) => ({ roleId, permissionId: pId }));
          await tx.rolePermission.createMany({ data });
        }
      });

      await AuditService.logAction({
        userId: req.user.id,
        module: 'Security',
        action: 'UPDATE_ROLE_PERMISSIONS',
        description: `Updated permissions for Role ${role.name}`,
        req,
      });

      return ApiResponse.success(res, 'Role permissions updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async listPermissions(req, res, next) {
    try {
      const permissions = await prisma.permission.findMany({
        orderBy: [{ module: 'asc' }, { name: 'asc' }],
      });

      // Group permissions by module
      const groupedMap = {};
      permissions.forEach((p) => {
        if (!groupedMap[p.module]) {
          groupedMap[p.module] = [];
        }
        groupedMap[p.module].push(p);
      });

      return ApiResponse.success(res, 'Permissions retrieved', {
        all: permissions,
        grouped: groupedMap,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StaffController;


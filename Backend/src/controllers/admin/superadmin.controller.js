const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const ApiResponse = require('../../utils/response');
const AuditService = require('../../services/audit.service');
const EmailService = require('../../services/email.service');

class SuperAdminController {
  static async getProfile(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          status: true,
          isEmailVerified: true,
          isMobileVerified: true,
          createdAt: true,
          role: { select: { id: true, name: true, description: true } },
        },
      });

      return ApiResponse.success(res, 'Super Admin profile retrieved', user);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { name, currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      const updateData = {};

      if (name && name.trim() !== '') {
        updateData.name = name.trim();
      }

      if (newPassword && newPassword.trim() !== '') {
        if (!currentPassword) {
          return ApiResponse.error(res, 'Current password is required to set a new password', 400);
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return ApiResponse.error(res, 'Current password is incorrect', 401);
        }

        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      if (Object.keys(updateData).length === 0) {
        return ApiResponse.error(res, 'No changes provided for update', 400);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          updatedAt: true,
        },
      });

      await AuditService.logAction({
        userId,
        module: 'Security',
        action: 'UPDATE_SUPER_ADMIN_PROFILE',
        description: 'Super Admin updated profile details / password',
        req,
      });

      return ApiResponse.success(res, 'Profile updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  static async sendOtpForChange(req, res, next) {
    try {
      const { target, type } = req.body; // target: email or mobile, type: CHANGE_EMAIL or CHANGE_MOBILE

      if (!target || !type) {
        return ApiResponse.error(res, 'Target and change type are required', 400);
      }

      // Check if target is already used by another account
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ email: target }, { mobile: target }],
          NOT: { id: req.user.id },
        },
      });

      if (existing) {
        return ApiResponse.error(res, 'Email or mobile is already in use by another account', 409);
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.otpVerification.create({
        data: {
          target,
          otp,
          type,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
        },
      });

      if (type === 'CHANGE_EMAIL') {
        await EmailService.sendOtpEmail(target, otp, 'Super Admin Email Change Verification');
      }

      await AuditService.logAction({
        userId: req.user.id,
        module: 'Security',
        action: 'SEND_SENSITIVE_OTP',
        description: `Sent verification OTP for ${type} to ${target}`,
        req,
      });

      return ApiResponse.success(res, `Verification OTP sent to ${target}`);
    } catch (error) {
      next(error);
    }
  }

  static async verifyAndUpdateContact(req, res, next) {
    try {
      const { target, otp, type, currentPassword } = req.body;
      const userId = req.user.id;

      if (!target || !otp || !type || !currentPassword) {
        return ApiResponse.error(res, 'Target, OTP, type, and current password are required', 400);
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return ApiResponse.error(res, 'Incorrect current password', 401);
      }

      const otpRecord = await prisma.otpVerification.findFirst({
        where: { target, otp, type, isUsed: false },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return ApiResponse.error(res, 'Invalid or expired OTP', 400);
      }

      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      const updateData = type === 'CHANGE_EMAIL'
        ? { email: target, isEmailVerified: true }
        : { mobile: target, isMobileVerified: true };

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, name: true, email: true, mobile: true },
      });

      await AuditService.logAction({
        userId,
        module: 'Security',
        action: 'UPDATE_SUPER_ADMIN_CONTACT',
        description: `Super Admin updated ${type} to ${target} via OTP verification`,
        req,
      });

      return ApiResponse.success(res, 'Contact details updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  static async transferSuperAdmin(req, res, next) {
    try {
      const { targetUserId, currentPassword, confirmationText } = req.body;
      const currentSuperAdminId = req.user.id;

      if (confirmationText !== 'TRANSFER SUPER ADMIN') {
        return ApiResponse.error(res, 'Please type TRANSFER SUPER ADMIN to confirm ownership transfer', 400);
      }

      if (!currentPassword || !targetUserId) {
        return ApiResponse.error(res, 'Target user ID and current password are required', 400);
      }

      if (targetUserId === currentSuperAdminId) {
        return ApiResponse.error(res, 'You are already the Super Administrator', 400);
      }

      // Verify current password
      const currentAdmin = await prisma.user.findUnique({ where: { id: currentSuperAdminId } });
      const isPasswordValid = await bcrypt.compare(currentPassword, currentAdmin.password);
      if (!isPasswordValid) {
        return ApiResponse.error(res, 'Incorrect current password. Transfer aborted.', 401);
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: { role: true },
      });

      if (!targetUser) {
        return ApiResponse.error(res, 'Target staff member not found', 404);
      }

      const [superAdminRole, adminRole] = await Promise.all([
        prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } }),
        prisma.role.findUnique({ where: { name: 'ADMIN' } }),
      ]);

      await prisma.$transaction(async (tx) => {
        // Promote target to SUPER_ADMIN
        await tx.user.update({
          where: { id: targetUserId },
          data: { roleId: superAdminRole.id },
        });

        // Demote current initiator to ADMIN
        await tx.user.update({
          where: { id: currentSuperAdminId },
          data: { roleId: adminRole.id },
        });
      });

      await AuditService.logAction({
        userId: currentSuperAdminId,
        module: 'Security',
        action: 'TRANSFER_SUPER_ADMIN',
        description: `Transferred Super Administrator ownership from ${currentAdmin.email} to ${targetUser.email}`,
        req,
      });

      return ApiResponse.success(res, `Super Administrator ownership successfully transferred to ${targetUser.name} (${targetUser.email})`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SuperAdminController;

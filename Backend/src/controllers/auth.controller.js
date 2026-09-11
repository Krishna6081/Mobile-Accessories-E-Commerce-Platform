const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const ApiResponse = require('../utils/response');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const AuditService = require('../services/audit.service');
const EmailService = require('../services/email.service');

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, mobile, password } = req.body;

      if (!name || !email || !password) {
        return ApiResponse.error(res, 'Name, email, and password are required', 400);
      }

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { mobile: mobile || undefined }] },
      });

      if (existingUser) {
        return ApiResponse.error(res, 'Email or mobile number is already registered', 409);
      }

      const customerRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } });
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          mobile: mobile || null,
          password: hashedPassword,
          roleId: customerRole.id,
        },
      });

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.otpVerification.create({
        data: {
          target: email,
          otp,
          type: 'REGISTER',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
        },
      });

      await EmailService.sendOtpEmail(email, otp, 'Account Registration');
      await AuditService.logAction({ userId: user.id, module: 'Auth', action: 'REGISTER', description: `User registered: ${email}`, req });

      return ApiResponse.success(res, 'Registration successful. OTP sent to email.', {
        userId: user.id,
        email: user.email,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ApiResponse.error(res, 'Email and password are required', 400);
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      });

      if (!user || user.status === 'BLOCKED') {
        return ApiResponse.error(res, 'Invalid credentials or account blocked', 401);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return ApiResponse.error(res, 'Invalid credentials', 401);
      }

      const permissions = user.role.rolePermissions.map((rp) => rp.permission.name);

      const payload = { userId: user.id, email: user.email, role: user.role.name };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Save refresh token to DB
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await AuditService.logAction({ userId: user.id, module: 'Auth', action: 'LOGIN', description: `User logged in: ${email}`, req });

      return ApiResponse.success(res, 'Login successful', {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role.name,
          permissions,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token required', 400);
      }

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: { include: { role: true } } },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        return ApiResponse.error(res, 'Invalid or expired refresh token', 401);
      }

      const decoded = verifyRefreshToken(refreshToken);
      const newAccessToken = generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
        role: storedToken.user.role.name,
      });

      return ApiResponse.success(res, 'Token refreshed', { accessToken: newAccessToken });
    } catch (error) {
      return ApiResponse.error(res, 'Invalid refresh token', 401);
    }
  }

  static async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
      }
      if (req.user) {
        await AuditService.logAction({ userId: req.user.id, module: 'Auth', action: 'LOGOUT', description: 'User logged out', req });
      }
      return ApiResponse.success(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;
      const record = await prisma.otpVerification.findFirst({
        where: { target: email, otp, isUsed: false },
        orderBy: { createdAt: 'desc' },
      });

      if (!record || record.expiresAt < new Date()) {
        return ApiResponse.error(res, 'Invalid or expired OTP', 400);
      }

      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { isUsed: true },
      });

      await prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
      });

      return ApiResponse.success(res, 'OTP verified successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;

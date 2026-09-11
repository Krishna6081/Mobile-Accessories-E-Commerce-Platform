const prisma = require('../config/db');
const ApiResponse = require('../utils/response');

class CouponController {
  static async getCoupons(req, res, next) {
    try {
      const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return ApiResponse.success(res, 'Coupons retrieved', coupons);
    } catch (error) {
      next(error);
    }
  }

  static async validateCoupon(req, res, next) {
    try {
      const { code, amount } = req.body;
      const userId = req.user ? req.user.id : null;

      const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        return ApiResponse.error(res, 'Invalid or expired coupon code', 400);
      }

      const now = new Date();
      if (coupon.startDate > now || coupon.endDate < now) {
        return ApiResponse.error(res, 'Coupon is not active currently', 400);
      }

      if (amount < coupon.minOrderAmount) {
        return ApiResponse.error(res, `Minimum order value for ${coupon.code} is ₹${coupon.minOrderAmount}`, 400);
      }

      if (userId) {
        const usageCount = await prisma.couponUsage.count({
          where: { couponId: coupon.id, userId },
        });
        if (usageCount >= coupon.userUsageLimit) {
          return ApiResponse.error(res, 'Coupon usage limit reached', 400);
        }
      }

      let discount = coupon.discountType === 'PERCENTAGE'
        ? (amount * coupon.discountValue) / 100
        : coupon.discountValue;

      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }

      return ApiResponse.success(res, 'Coupon applied successfully', {
        code: coupon.code,
        discountAmount: discount,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCoupon(req, res, next) {
    try {
      const coupon = await prisma.coupon.create({ data: req.body });
      return ApiResponse.success(res, 'Coupon created', coupon, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCoupon(req, res, next) {
    try {
      const { id } = req.params;
      const coupon = await prisma.coupon.update({
        where: { id },
        data: req.body,
      });
      return ApiResponse.success(res, 'Coupon updated', coupon);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCoupon(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.coupon.delete({ where: { id } });
      return ApiResponse.success(res, 'Coupon deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CouponController;

const prisma = require('../../config/db');
const ApiResponse = require('../../utils/response');

class ReportsController {
  static async getSalesReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const where = {};
      if (startDate || endDate) {
        where.createdAt = {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate) } : {}),
        };
      }

      const [totalOrders, totalRevenue, statusBreakdown] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.aggregate({
          where: { ...where, paymentStatus: 'COMPLETED' },
          _sum: { grandTotal: true },
        }),
        prisma.order.groupBy({
          by: ['orderStatus'],
          where,
          _count: { id: true },
        }),
      ]);

      return ApiResponse.success(res, 'Sales report retrieved', {
        totalOrders,
        totalRevenue: totalRevenue._sum.grandTotal || 0,
        statusBreakdown,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductReport(req, res, next) {
    try {
      const topSellingItems = await prisma.orderItem.groupBy({
        by: ['productName'],
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      });

      return ApiResponse.success(res, 'Product performance report retrieved', topSellingItems);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportsController;

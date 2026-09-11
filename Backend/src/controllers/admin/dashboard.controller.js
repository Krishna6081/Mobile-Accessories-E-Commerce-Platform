const prisma = require('../../config/db');
const ApiResponse = require('../../utils/response');

class AdminDashboardController {
  static async getKpis(req, res, next) {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [
        todayOrdersCount,
        todayRevenueAgg,
        totalRevenueAgg,
        newCustomersCount,
        pendingOrdersCount,
        lowStockVariants,
        recentOrders,
      ] = await Promise.all([
        prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.order.aggregate({
          where: { createdAt: { gte: startOfToday }, paymentStatus: 'COMPLETED' },
          _sum: { grandTotal: true },
        }),
        prisma.order.aggregate({
          where: { paymentStatus: 'COMPLETED' },
          _sum: { grandTotal: true },
        }),
        prisma.user.count({ where: { role: { name: 'CUSTOMER' }, createdAt: { gte: startOfToday } } }),
        prisma.order.count({ where: { orderStatus: 'PLACED' } }),
        prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, email: true } } },
        }),
      ]);

      return ApiResponse.success(res, 'Dashboard KPIs retrieved', {
        todayOrders: todayOrdersCount,
        todayRevenue: todayRevenueAgg._sum.grandTotal || 0,
        totalRevenue: totalRevenueAgg._sum.grandTotal || 0,
        newCustomers: newCustomersCount,
        pendingOrders: pendingOrdersCount,
        lowStockProducts: lowStockVariants,
        recentOrders,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSalesChart(req, res, next) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, grandTotal: true, paymentStatus: true },
      });

      // Group sales by day
      const chartMap = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        chartMap[dateStr] = { date: dateStr, sales: 0, orders: 0 };
      }

      orders.forEach((ord) => {
        const dateStr = ord.createdAt.toISOString().split('T')[0];
        if (chartMap[dateStr]) {
          chartMap[dateStr].orders += 1;
          if (ord.paymentStatus === 'COMPLETED') {
            chartMap[dateStr].sales += ord.grandTotal;
          }
        }
      });

      const chartData = Object.values(chartMap).sort((a, b) => new Date(a.date) - new Date(b.date));
      return ApiResponse.success(res, 'Sales chart data retrieved', chartData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminDashboardController;

const prisma = require('../config/db');
const ApiResponse = require('../utils/response');
const { generateInvoicePdf } = require('../utils/pdfGenerator');
const AuditService = require('../services/audit.service');

class OrderController {
  static async getCustomerOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return ApiResponse.success(res, 'Customer orders retrieved', orders);
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDetails(req, res, next) {
    try {
      const { id } = req.params;
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
          user: { select: { id: true, name: true, email: true, mobile: true } },
        },
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      // Check authorization (customer can only view their own order)
      if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
        return ApiResponse.error(res, 'Unauthorized to view this order', 403);
      }

      return ApiResponse.success(res, 'Order details retrieved', order);
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const order = await prisma.order.findUnique({ where: { id } });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
        return ApiResponse.error(res, 'Unauthorized', 403);
      }

      if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
        return ApiResponse.error(res, `Cannot cancel order in ${order.orderStatus} status`, 400);
      }

      // Revert stock inside transaction
      await prisma.$transaction(async (tx) => {
        const items = await tx.orderItem.findMany({ where: { orderId: id } });
        for (const item of items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id },
          data: {
            orderStatus: 'CANCELLED',
            statusHistory: {
              create: {
                status: 'CANCELLED',
                comment: 'Cancelled by ' + (req.user.role === 'CUSTOMER' ? 'Customer' : 'Admin'),
                updatedBy: req.user.id,
              },
            },
          },
        });
      });

      await AuditService.logAction({ userId: req.user.id, module: 'Orders', action: 'CANCEL_ORDER', description: `Cancelled Order #${order.orderNumber}`, req });

      return ApiResponse.success(res, 'Order cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  static async downloadInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order.orderNumber}.pdf`);

      generateInvoicePdf(order, res);
    } catch (error) {
      next(error);
    }
  }

  // --- ADMIN ORDER MANAGEMENT ---

  static async getAdminOrders(req, res, next) {
    try {
      const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const where = {};
      if (status) where.orderStatus = status;
      if (paymentStatus) where.paymentStatus = paymentStatus;
      if (search) {
        where.OR = [
          { orderNumber: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
        ];
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true, mobile: true } },
            items: true,
          },
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count({ where }),
      ]);

      return ApiResponse.paginate(res, orders, pageNum, limitNum, total, 'Admin orders retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { orderStatus, paymentStatus, courierName, trackingNumber, comment } = req.body;

      const order = await prisma.order.update({
        where: { id },
        data: {
          ...(orderStatus && { orderStatus }),
          ...(paymentStatus && { paymentStatus }),
          ...(courierName && { courierName }),
          ...(trackingNumber && { trackingNumber }),
          statusHistory: {
            create: {
              status: orderStatus || 'UPDATED',
              comment: comment || `Status updated to ${orderStatus || 'N/A'}`,
              updatedBy: req.user.id,
            },
          },
        },
      });

      await AuditService.logAction({ userId: req.user.id, module: 'Orders', action: 'UPDATE_ORDER_STATUS', description: `Order #${order.orderNumber} updated to ${orderStatus}`, req });

      return ApiResponse.success(res, 'Order status updated', order);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;

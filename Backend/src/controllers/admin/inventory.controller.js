const prisma = require('../../config/db');
const ApiResponse = require('../../utils/response');
const AuditService = require('../../services/audit.service');

class InventoryController {
  static async getInventory(req, res, next) {
    try {
      const variants = await prisma.productVariant.findMany({
        include: {
          product: {
            select: { id: true, name: true, category: { select: { name: true } } },
          },
        },
        orderBy: { stock: 'asc' },
      });
      return ApiResponse.success(res, 'Inventory retrieved', variants);
    } catch (error) {
      next(error);
    }
  }

  static async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { stock, lowStockThreshold } = req.body;

      if (stock < 0) {
        return ApiResponse.error(res, 'Stock quantity cannot be negative', 400);
      }

      const updated = await prisma.productVariant.update({
        where: { id },
        data: {
          ...(stock !== undefined && { stock: parseInt(stock, 10) }),
          ...(lowStockThreshold !== undefined && { lowStockThreshold: parseInt(lowStockThreshold, 10) }),
        },
      });

      await AuditService.logAction({ userId: req.user.id, module: 'Inventory', action: 'UPDATE_STOCK', description: `Adjusted stock for SKU ${updated.sku} to ${stock}`, req });

      return ApiResponse.success(res, 'Stock level updated', updated);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InventoryController;

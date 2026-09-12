const prisma = require('../../config/db');
const ApiResponse = require('../../utils/response');
const AuditService = require('../../services/audit.service');

class CustomerAdminController {
  static async listCustomers(req, res, next) {
    try {
      const { search, status, page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const customerRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } });

      const where = {
        roleId: customerRole?.id,
      };

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

      const [customers, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            status: true,
            isEmailVerified: true,
            isMobileVerified: true,
            createdAt: true,
            _count: {
              select: {
                orders: true,
                reviews: true,
              },
            },
          },
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      return ApiResponse.paginate(res, customers, pageNum, limitNum, total, 'Customers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await prisma.user.findUnique({
        where: { id },
        include: {
          role: true,
          addresses: true,
          orders: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, orderNumber: true, grandTotal: true, orderStatus: true, createdAt: true },
          },
          _count: { select: { orders: true, reviews: true, wishlists: true } },
        },
      });

      if (!customer) {
        return ApiResponse.error(res, 'Customer not found', 404);
      }

      return ApiResponse.success(res, 'Customer details retrieved', customer);
    } catch (error) {
      next(error);
    }
  }

  static async toggleBlockCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body; // ACTIVE or BLOCKED

      const customer = await prisma.user.findUnique({
        where: { id },
        include: { role: true },
      });

      if (!customer) {
        return ApiResponse.error(res, 'Customer not found', 404);
      }

      if (customer.role.name !== 'CUSTOMER') {
        return ApiResponse.error(res, 'Target user is not a customer account', 400);
      }

      const newStatus = status || (customer.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE');

      const updated = await prisma.user.update({
        where: { id },
        data: { status: newStatus },
      });

      await AuditService.logAction({
        userId: req.user.id,
        module: 'Customers',
        action: 'TOGGLE_CUSTOMER_BLOCK',
        description: `Customer ${customer.email} status changed to ${newStatus}`,
        req,
      });

      return ApiResponse.success(res, `Customer status updated to ${newStatus}`, {
        id: updated.id,
        email: updated.email,
        status: updated.status,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, mobile, status } = req.body;

      const customer = await prisma.user.findUnique({ where: { id } });
      if (!customer) {
        return ApiResponse.error(res, 'Customer not found', 404);
      }

      const data = {};
      if (name) data.name = name;
      if (email) data.email = email;
      if (mobile !== undefined) data.mobile = mobile;
      if (status) data.status = status;

      const updated = await prisma.user.update({
        where: { id },
        data,
      });

      await AuditService.logAction({
        userId: req.user.id,
        module: 'Customers',
        action: 'UPDATE_CUSTOMER',
        description: `Updated details for customer ${updated.email}`,
        req,
      });

      return ApiResponse.success(res, 'Customer updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CustomerAdminController;

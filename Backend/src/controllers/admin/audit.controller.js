const prisma = require('../../config/db');
const ApiResponse = require('../../utils/response');

class AuditController {
  static async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 30, module } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const where = module ? { module } : {};

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true, role: { select: { name: true } } } },
          },
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.auditLog.count({ where }),
      ]);

      return ApiResponse.paginate(res, logs, pageNum, limitNum, total, 'Audit logs retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuditController;

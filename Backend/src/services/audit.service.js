const prisma = require('../config/db');
const logger = require('../config/logger');

class AuditService {
  static async logAction({ userId, module, action, description, req = null }) {
    try {
      const ipAddress = req ? req.headers['x-forwarded-for'] || req.socket.remoteAddress : null;
      const userAgent = req ? req.headers['user-agent'] : null;

      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          module,
          action,
          description,
          ipAddress: typeof ipAddress === 'string' ? ipAddress : JSON.stringify(ipAddress),
          userAgent: typeof userAgent === 'string' ? userAgent : JSON.stringify(userAgent),
        },
      });

      logger.info(`[AUDIT] [${module}] [${action}] User ${userId || 'System'}: ${description}`);
    } catch (error) {
      logger.error(`Failed to record audit log: ${error.message}`);
    }
  }
}

module.exports = AuditService;

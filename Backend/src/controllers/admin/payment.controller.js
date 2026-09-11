const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const ApiResponse = require('../../utils/response');
const { encrypt, maskSecret } = require('../../utils/crypto');
const AuditService = require('../../services/audit.service');

class PaymentCredentialsController {
  static async getCredentialsMasked(req, res, next) {
    try {
      const creds = await prisma.paymentCredential.findUnique({
        where: { provider: 'RAZORPAY' },
      });

      if (!creds) {
        return ApiResponse.success(res, 'Payment credentials not configured', {
          provider: 'RAZORPAY',
          mode: 'TEST',
          keyId: 'rzp_test_key_id_12345',
          keySecretMasked: '••••••••6789',
          webhookSecretMasked: '••••••••9999',
          isActive: true,
        });
      }

      return ApiResponse.success(res, 'Payment credentials retrieved (masked)', {
        id: creds.id,
        provider: creds.provider,
        mode: creds.mode,
        keyId: creds.keyId,
        keySecretMasked: maskSecret(creds.encryptedKeySecret),
        webhookSecretMasked: maskSecret(creds.encryptedWebhookSecret),
        isActive: creds.isActive,
        updatedAt: creds.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCredentials(req, res, next) {
    try {
      const { currentPassword, mode, keyId, keySecret, webhookSecret, isActive } = req.body;
      const superAdminId = req.user.id;

      if (!currentPassword) {
        return ApiResponse.error(res, 'Step-up security requirement: Current password is required.', 401);
      }

      // Verify Super Admin Password
      const user = await prisma.user.findUnique({ where: { id: superAdminId } });
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return ApiResponse.error(res, 'Step-up verification failed: Incorrect current password', 401);
      }

      if (!keyId || !keySecret) {
        return ApiResponse.error(res, 'Key ID and Key Secret are required', 400);
      }

      const encryptedKeySecret = encrypt(keySecret);
      const encryptedWebhookSecret = webhookSecret ? encrypt(webhookSecret) : null;

      const updated = await prisma.$transaction(async (tx) => {
        const cred = await tx.paymentCredential.upsert({
          where: { provider: 'RAZORPAY' },
          update: {
            mode: mode || 'TEST',
            keyId,
            encryptedKeySecret,
            encryptedWebhookSecret,
            isActive: isActive !== undefined ? isActive : true,
            updatedBy: superAdminId,
          },
          create: {
            provider: 'RAZORPAY',
            mode: mode || 'TEST',
            keyId,
            encryptedKeySecret,
            encryptedWebhookSecret,
            isActive: isActive !== undefined ? isActive : true,
            updatedBy: superAdminId,
          },
        });

        // Record history
        await tx.paymentCredentialHistory.create({
          data: {
            paymentCredentialId: cred.id,
            action: 'UPDATED',
            changedBy: superAdminId,
            keyId: cred.keyId,
            mode: cred.mode,
          },
        });

        return cred;
      });

      await AuditService.logAction({
        userId: superAdminId,
        module: 'Security',
        action: 'UPDATE_PAYMENT_CREDENTIALS',
        description: `Super Admin updated Razorpay Payment Credentials in ${mode} mode`,
        req,
      });

      return ApiResponse.success(res, 'Payment credentials updated successfully with AES-256 encryption at rest', {
        provider: updated.provider,
        mode: updated.mode,
        keyId: updated.keyId,
        keySecretMasked: maskSecret(keySecret),
        webhookSecretMasked: maskSecret(webhookSecret),
        isActive: updated.isActive,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCredentialHistory(req, res, next) {
    try {
      const history = await prisma.paymentCredentialHistory.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      return ApiResponse.success(res, 'Payment credential audit history retrieved', history);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentCredentialsController;

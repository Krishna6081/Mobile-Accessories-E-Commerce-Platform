const nodemailer = require('nodemailer');
const logger = require('../config/logger');
const prisma = require('../config/db');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASSWORD || 'mock_pass',
  },
});

class EmailService {
  static async sendEmail({ to, subject, html }) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Mobile Accessories" <noreply@accessories.com>',
        to,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);

      // Log notification to DB
      await prisma.notificationLog.create({
        data: {
          recipient: to,
          type: 'EMAIL',
          subject,
          body: html.substring(0, 500),
          status: 'SENT',
        },
      });

      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
      await prisma.notificationLog.create({
        data: {
          recipient: to,
          type: 'EMAIL',
          subject,
          body: html.substring(0, 500),
          status: 'FAILED',
        },
      });
      return false;
    }
  }

  static async sendOtpEmail(to, otp, type = 'Verification') {
    const subject = `Your Mobile Accessories OTP Code: ${otp}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${type} OTP Request</h2>
        <p>Use the following 6-digit OTP code to verify your action:</p>
        <h1 style="color: #2563eb; letter-spacing: 4px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;
    return this.sendEmail({ to, subject, html });
  }

  static async sendOrderConfirmation(to, orderNumber, grandTotal) {
    const subject = `Order Confirmed - #${orderNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Thank You for Your Order!</h2>
        <p>Your order <strong>#${orderNumber}</strong> has been successfully placed.</p>
        <p>Total Amount: <strong>₹${grandTotal}</strong></p>
        <p>We will notify you once your mobile accessories are packed and shipped.</p>
      </div>
    `;
    return this.sendEmail({ to, subject, html });
  }
}

module.exports = EmailService;

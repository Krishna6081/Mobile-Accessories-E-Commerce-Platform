const prisma = require('../config/db');
const ApiResponse = require('../utils/response');
const PaymentService = require('../services/payment.service');
const EmailService = require('../services/email.service');
const AuditService = require('../services/audit.service');

class CheckoutController {
  static async validateCheckout(req, res, next) {
    try {
      const { couponCode, cartId } = req.body;
      const userId = req.user.id;

      const cart = await prisma.cart.findFirst({
        where: cartId ? { id: cartId } : { userId },
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        return ApiResponse.error(res, 'Cart is empty', 400);
      }

      let subtotal = 0;
      const stockErrors = [];

      for (const item of cart.items) {
        if (item.quantity > item.variant.stock) {
          stockErrors.push(`"${item.variant.product.name}" (${item.variant.sku}) has only ${item.variant.stock} left in stock.`);
        }
        subtotal += item.variant.price * item.quantity;
      }

      if (stockErrors.length > 0) {
        return ApiResponse.error(res, 'Stock validation failed', 400, stockErrors);
      }

      // Coupon Validation
      let discountAmount = 0;
      let couponData = null;

      if (couponCode) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: couponCode.toUpperCase() },
        });

        if (!coupon || !coupon.isActive) {
          return ApiResponse.error(res, 'Invalid or expired coupon code', 400);
        }

        const now = new Date();
        if (coupon.startDate > now || coupon.endDate < now) {
          return ApiResponse.error(res, 'Coupon is not active at this time', 400);
        }

        if (subtotal < coupon.minOrderAmount) {
          return ApiResponse.error(res, `Minimum order amount for code ${coupon.code} is ₹${coupon.minOrderAmount}`, 400);
        }

        const userUsageCount = await prisma.couponUsage.count({
          where: { couponId: coupon.id, userId },
        });

        if (userUsageCount >= coupon.userUsageLimit) {
          return ApiResponse.error(res, 'You have already reached the maximum usage limit for this coupon', 400);
        }

        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }

        couponData = { id: coupon.id, code: coupon.code, discountAmount };
      }

      const shippingFee = subtotal > 499 ? 0 : 50;
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const tax = Math.round(taxableAmount * 0.18); // 18% GST slab for mobile accessories
      const grandTotal = Math.round(taxableAmount + shippingFee);

      return ApiResponse.success(res, 'Checkout calculation valid', {
        subtotal,
        discount: discountAmount,
        coupon: couponData,
        tax,
        shippingFee,
        grandTotal,
        itemCount: cart.items.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async placeOrder(req, res, next) {
    try {
      const { shippingAddress, billingAddress, paymentMethod, couponCode } = req.body;
      const userId = req.user.id;

      if (!shippingAddress || !paymentMethod) {
        return ApiResponse.error(res, 'Shipping address and payment method are required', 400);
      }

      // Execute Order Creation & Stock Deduction inside a DB Transaction
      const result = await prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findFirst({
          where: { userId },
          include: {
            items: {
              include: { variant: { include: { product: true } } },
            },
          },
        });

        if (!cart || cart.items.length === 0) {
          throw new Error('Cart is empty');
        }

        let subtotal = 0;
        const orderItemsData = [];

        for (const item of cart.items) {
          // Re-verify stock inside transaction
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (!variant || variant.stock < item.quantity) {
            throw new Error(`Item ${item.variant.product.name} is out of stock or insufficient quantity.`);
          }

          // Deduct stock
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: variant.stock - item.quantity },
          });

          const itemTotal = variant.price * item.quantity;
          subtotal += itemTotal;

          orderItemsData.push({
            variantId: variant.id,
            productName: item.variant.product.name,
            variantInfo: `${variant.color || ''} ${variant.modelCompatibility || ''}`.trim(),
            price: variant.price,
            quantity: item.quantity,
            totalPrice: itemTotal,
          });
        }

        // Coupon calculation inside transaction
        let discount = 0;
        let couponId = null;
        if (couponCode) {
          const coupon = await tx.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
          if (coupon && coupon.isActive && subtotal >= coupon.minOrderAmount) {
            couponId = coupon.id;
            discount = coupon.discountType === 'PERCENTAGE'
              ? (subtotal * coupon.discountValue) / 100
              : coupon.discountValue;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
            await tx.couponUsage.create({
              data: { couponId: coupon.id, userId },
            });
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }

        const shippingFee = subtotal > 499 ? 0 : 50;
        const taxable = Math.max(0, subtotal - discount);
        const tax = Math.round(taxable * 0.18);
        const grandTotal = Math.round(taxable + shippingFee);

        const orderNumber = 'ACC-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900);

        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            subtotal,
            discount,
            tax,
            shippingFee,
            grandTotal,
            paymentMethod,
            paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
            orderStatus: 'PLACED',
            couponId,
            items: { create: orderItemsData },
            statusHistory: {
              create: {
                status: 'PLACED',
                comment: 'Order placed by customer via ' + paymentMethod,
                updatedBy: userId,
              },
            },
          },
          include: { items: true },
        });

        // Clear cart
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return order;
      });

      // Handle Razorpay Payment initialization if online payment chosen
      let razorpayData = null;
      if (paymentMethod === 'RAZORPAY') {
        razorpayData = await PaymentService.createRazorpayOrder(result.grandTotal, result.orderNumber);
        await prisma.order.update({
          where: { id: result.id },
          data: { razorpayOrderId: razorpayData.id },
        });
      }

      await EmailService.sendOrderConfirmation(req.user.email, result.orderNumber, result.grandTotal);
      await AuditService.logAction({ userId, module: 'Orders', action: 'PLACE_ORDER', description: `Order placed: #${result.orderNumber}`, req });

      return ApiResponse.success(res, 'Order placed successfully', {
        orderId: result.id,
        orderNumber: result.orderNumber,
        grandTotal: result.grandTotal,
        paymentMethod: result.paymentMethod,
        razorpay: razorpayData,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req, res, next) {
    try {
      const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

      const isValid = await PaymentService.verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!isValid) {
        return ApiResponse.error(res, 'Payment verification failed. Invalid signature.', 400);
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          orderStatus: 'CONFIRMED',
          razorpayPaymentId,
          statusHistory: {
            create: {
              status: 'CONFIRMED',
              comment: `Razorpay Payment Verified (${razorpayPaymentId})`,
              updatedBy: req.user.id,
            },
          },
        },
      });

      await AuditService.logAction({ userId: req.user.id, module: 'Orders', action: 'VERIFY_PAYMENT', description: `Payment verified for Order #${order.orderNumber}`, req });

      return ApiResponse.success(res, 'Payment verified and order confirmed', order);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CheckoutController;

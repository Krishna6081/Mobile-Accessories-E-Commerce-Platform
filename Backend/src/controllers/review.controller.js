const prisma = require('../config/db');
const ApiResponse = require('../utils/response');

class ReviewController {
  static async submitReview(req, res, next) {
    try {
      const { productId, rating, title, comment, images } = req.body;
      const userId = req.user.id;

      if (!productId || !rating || !comment) {
        return ApiResponse.error(res, 'Product ID, rating, and comment are required', 400);
      }

      // BUSINESS RULE 8: Check if customer has a DELIVERED order containing this product
      const deliveredOrder = await prisma.order.findFirst({
        where: {
          userId,
          orderStatus: 'DELIVERED',
          items: {
            some: {
              variant: { productId },
            },
          },
        },
      });

      if (!deliveredOrder) {
        return ApiResponse.error(res, 'You can only review products from delivered orders.', 403);
      }

      const review = await prisma.review.create({
        data: {
          productId,
          userId,
          rating: parseInt(rating, 10),
          title: title || '',
          comment,
          images: images ? JSON.stringify(images) : null,
          isApproved: true, // auto approve in dev
        },
      });

      // Recalculate Product average rating
      const aggregations = await prisma.review.aggregate({
        where: { productId, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: aggregations._avg.rating || rating,
          reviewCount: aggregations._count.rating || 1,
        },
      });

      return ApiResponse.success(res, 'Review submitted successfully', review, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getProductReviews(req, res, next) {
    try {
      const { productId } = req.params;
      const reviews = await prisma.review.findMany({
        where: { productId, isApproved: true },
        include: { user: { select: { name: true, profileImage: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return ApiResponse.success(res, 'Reviews retrieved', reviews);
    } catch (error) {
      next(error);
    }
  }

  static async adminListReviews(req, res, next) {
    try {
      const reviews = await prisma.review.findMany({
        include: {
          product: { select: { name: true, slug: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return ApiResponse.success(res, 'Admin reviews retrieved', reviews);
    } catch (error) {
      next(error);
    }
  }

  static async adminModerateReview(req, res, next) {
    try {
      const { id } = req.params;
      const { isApproved, adminReply } = req.body;
      const review = await prisma.review.update({
        where: { id },
        data: {
          ...(isApproved !== undefined && { isApproved }),
          ...(adminReply !== undefined && { adminReply }),
        },
      });
      return ApiResponse.success(res, 'Review moderated successfully', review);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;

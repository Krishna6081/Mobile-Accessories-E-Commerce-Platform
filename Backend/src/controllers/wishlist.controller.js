const prisma = require('../config/db');
const ApiResponse = require('../utils/response');

class WishlistController {
  static async getWishlist(req, res, next) {
    try {
      const userId = req.user.id;
      const wishlist = await prisma.wishlist.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              variants: { take: 1 },
              images: { take: 1 },
              category: { select: { name: true } },
            },
          },
        },
      });
      return ApiResponse.success(res, 'Wishlist retrieved', wishlist);
    } catch (error) {
      next(error);
    }
  }

  static async toggleWishlist(req, res, next) {
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      const existing = await prisma.wishlist.findUnique({
        where: { userId_productId: { userId, productId } },
      });

      if (existing) {
        await prisma.wishlist.delete({ where: { id: existing.id } });
        return ApiResponse.success(res, 'Removed from wishlist', { added: false });
      } else {
        await prisma.wishlist.create({
          data: { userId, productId },
        });
        return ApiResponse.success(res, 'Added to wishlist', { added: true });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WishlistController;

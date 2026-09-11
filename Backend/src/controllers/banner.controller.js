const prisma = require('../config/db');
const ApiResponse = require('../utils/response');

class BannerController {
  static async getBanners(req, res, next) {
    try {
      const banners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      return ApiResponse.success(res, 'Banners retrieved', banners);
    } catch (error) {
      next(error);
    }
  }

  static async createBanner(req, res, next) {
    try {
      const banner = await prisma.banner.create({ data: req.body });
      return ApiResponse.success(res, 'Banner created', banner, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateBanner(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await prisma.banner.update({
        where: { id },
        data: req.body,
      });
      return ApiResponse.success(res, 'Banner updated', banner);
    } catch (error) {
      next(error);
    }
  }

  static async deleteBanner(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.banner.delete({ where: { id } });
      return ApiResponse.success(res, 'Banner deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BannerController;

const prisma = require('../config/db');
const ApiResponse = require('../utils/response');

class BrandController {
  static async getBrands(req, res, next) {
    try {
      const brands = await prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
      return ApiResponse.success(res, 'Brands retrieved', brands);
    } catch (error) {
      next(error);
    }
  }

  static async createBrand(req, res, next) {
    try {
      const { name, slug, logo, description } = req.body;
      const brand = await prisma.brand.create({
        data: { name, slug, logo, description },
      });
      return ApiResponse.success(res, 'Brand created', brand, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateBrand(req, res, next) {
    try {
      const { id } = req.params;
      const brand = await prisma.brand.update({
        where: { id },
        data: req.body,
      });
      return ApiResponse.success(res, 'Brand updated', brand);
    } catch (error) {
      next(error);
    }
  }

  static async deleteBrand(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.brand.delete({ where: { id } });
      return ApiResponse.success(res, 'Brand deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BrandController;

const prisma = require('../config/db');
const ApiResponse = require('../utils/response');

class CategoryController {
  static async getCategories(req, res, next) {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: { children: true },
        orderBy: { sortOrder: 'asc' },
      });
      return ApiResponse.success(res, 'Categories retrieved', categories);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const { name, slug, description, image, parentId, sortOrder } = req.body;
      const category = await prisma.category.create({
        data: { name, slug, description, image, parentId, sortOrder: sortOrder || 0 },
      });
      return ApiResponse.success(res, 'Category created', category, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const category = await prisma.category.update({
        where: { id },
        data: req.body,
      });
      return ApiResponse.success(res, 'Category updated', category);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.category.delete({ where: { id } });
      return ApiResponse.success(res, 'Category deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;

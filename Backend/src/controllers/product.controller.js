const prisma = require('../config/db');
const ApiResponse = require('../utils/response');
const AuditService = require('../services/audit.service');

class ProductController {
  static async getProducts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        brand,
        search,
        minPrice,
        maxPrice,
        rating,
        sortBy = 'createdAt',
        order = 'desc',
        featured,
        bestSeller,
      } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
      const skip = (pageNum - 1) * limitNum;

      const where = { status: true };

      if (category) {
        where.category = { slug: category };
      }
      if (brand) {
        where.brand = { slug: brand };
      }
      if (rating) {
        where.rating = { gte: parseFloat(rating) };
      }
      if (featured === 'true') {
        where.isFeatured = true;
      }
      if (bestSeller === 'true') {
        where.isBestSeller = true;
      }
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
        ];
      }

      // Filter variants price if min/max price supplied
      if (minPrice || maxPrice) {
        where.variants = {
          some: {
            price: {
              ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
              ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
            },
          },
        };
      }

      const sortOptions = {};
      if (sortBy === 'priceLow') {
        sortOptions.variants = { _count: 'asc' };
      } else if (sortBy === 'rating') {
        sortOptions.rating = 'desc';
      } else {
        sortOptions[sortBy] = order === 'asc' ? 'asc' : 'desc';
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: { select: { id: true, name: true, slug: true } },
            brand: { select: { id: true, name: true, slug: true } },
            variants: true,
            images: { orderBy: { sortOrder: 'asc' } },
          },
          skip,
          take: limitNum,
          orderBy: sortOptions,
        }),
        prisma.product.count({ where }),
      ]);

      return ApiResponse.paginate(res, products, pageNum, limitNum, total, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProductBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          brand: true,
          variants: true,
          images: { orderBy: { sortOrder: 'asc' } },
          reviews: {
            where: { isApproved: true },
            include: { user: { select: { name: true, profileImage: true } } },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!product) {
        return ApiResponse.error(res, 'Product not found', 404);
      }

      return ApiResponse.success(res, 'Product details retrieved', product);
    } catch (error) {
      next(error);
    }
  }

  static async searchAutoSuggest(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || q.length < 2) {
        return ApiResponse.success(res, 'Autosuggest results', []);
      }

      const products = await prisma.product.findMany({
        where: {
          status: true,
          OR: [
            { name: { contains: q } },
            { tags: { contains: q } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          images: { take: 1, select: { url: true } },
          variants: { take: 1, select: { price: true, mrp: true } },
        },
        take: 8,
      });

      return ApiResponse.success(res, 'Autosuggest results', products);
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req, res, next) {
    try {
      const { name, slug, description, specifications, categoryId, brandId, isFeatured, isBestSeller, tags, variants, images } = req.body;

      if (!name || !slug || !description || !categoryId) {
        return ApiResponse.error(res, 'Name, slug, description, and categoryId are required', 400);
      }

      const product = await prisma.product.create({
        data: {
          name,
          slug,
          description,
          specifications: specifications || {},
          categoryId,
          brandId: brandId || null,
          isFeatured: !!isFeatured,
          isBestSeller: !!isBestSeller,
          tags: tags || '',
          variants: {
            create: variants || [],
          },
          images: {
            create: (images || []).map((img, idx) => ({
              url: typeof img === 'string' ? img : img.url,
              sortOrder: idx,
              isPrimary: idx === 0,
            })),
          },
        },
        include: { variants: true, images: true },
      });

      await AuditService.logAction({ userId: req.user.id, module: 'Catalog', action: 'CREATE_PRODUCT', description: `Created product: ${name}`, req });

      return ApiResponse.success(res, 'Product created successfully', product, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, specifications, categoryId, brandId, isFeatured, isBestSeller, status, tags } = req.body;

      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(specifications && { specifications }),
          ...(categoryId && { categoryId }),
          ...(brandId !== undefined && { brandId }),
          ...(isFeatured !== undefined && { isFeatured }),
          ...(isBestSeller !== undefined && { isBestSeller }),
          ...(status !== undefined && { status }),
          ...(tags !== undefined && { tags }),
        },
        include: { variants: true, images: true },
      });

      await AuditService.logAction({ userId: req.user.id, module: 'Catalog', action: 'UPDATE_PRODUCT', description: `Updated product ${id}`, req });

      return ApiResponse.success(res, 'Product updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.product.delete({ where: { id } });
      await AuditService.logAction({ userId: req.user.id, module: 'Catalog', action: 'DELETE_PRODUCT', description: `Deleted product ${id}`, req });
      return ApiResponse.success(res, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;

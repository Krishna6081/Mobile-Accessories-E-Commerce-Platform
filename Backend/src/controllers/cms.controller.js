const prisma = require('../config/db');
const ApiResponse = require('../utils/response');

class CmsController {
  static async getCmsPage(req, res, next) {
    try {
      const { slug } = req.params;
      const page = await prisma.cmsPage.findUnique({
        where: { slug },
      });

      if (!page) {
        return ApiResponse.error(res, 'Page not found', 404);
      }

      return ApiResponse.success(res, 'CMS page retrieved', page);
    } catch (error) {
      next(error);
    }
  }

  static async updateCmsPage(req, res, next) {
    try {
      const { slug } = req.params;
      const { title, content, metaTitle, metaDesc } = req.body;

      const page = await prisma.cmsPage.upsert({
        where: { slug },
        update: { title, content, metaTitle, metaDesc },
        create: { slug, title, content, metaTitle, metaDesc },
      });

      return ApiResponse.success(res, 'CMS page updated successfully', page);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CmsController;

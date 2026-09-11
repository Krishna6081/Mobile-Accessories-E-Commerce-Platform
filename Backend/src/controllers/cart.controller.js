const prisma = require('../config/db');
const ApiResponse = require('../utils/response');

class CartController {
  static async getCart(req, res, next) {
    try {
      const { sessionId } = req.query;
      const userId = req.user ? req.user.id : null;

      if (!userId && !sessionId) {
        return ApiResponse.success(res, 'Empty cart', { items: [], subtotal: 0 });
      }

      let cart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: { id: true, name: true, slug: true, images: true, category: true, brand: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!cart) {
        return ApiResponse.success(res, 'Empty cart', { items: [], subtotal: 0 });
      }

      let subtotal = 0;
      const formattedItems = cart.items.map((item) => {
        const itemTotal = item.variant.price * item.quantity;
        subtotal += itemTotal;
        return {
          id: item.id,
          variantId: item.variantId,
          productName: item.variant.product.name,
          productSlug: item.variant.product.slug,
          color: item.variant.color,
          modelCompatibility: item.variant.modelCompatibility,
          sku: item.variant.sku,
          price: item.variant.price,
          mrp: item.variant.mrp,
          stock: item.variant.stock,
          quantity: item.quantity,
          totalPrice: itemTotal,
          image: item.variant.product.images[0]?.url || '',
        };
      });

      return ApiResponse.success(res, 'Cart retrieved', {
        cartId: cart.id,
        items: formattedItems,
        subtotal,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req, res, next) {
    try {
      const { variantId, quantity = 1, sessionId } = req.body;
      const userId = req.user ? req.user.id : null;

      if (!variantId) {
        return ApiResponse.error(res, 'Variant ID is required', 400);
      }

      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant || variant.stock < quantity) {
        return ApiResponse.error(res, 'Insufficient stock available for this product variant', 400);
      }

      let cart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId,
            sessionId: userId ? null : sessionId,
          },
        });
      }

      const existingItem = await prisma.cartItem.findUnique({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
      });

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty > variant.stock) {
          return ApiResponse.error(res, `Cannot add more. Maximum available stock is ${variant.stock}`, 400);
        }
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQty },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            variantId,
            quantity,
          },
        });
      }

      return ApiResponse.success(res, 'Item added to cart');
    } catch (error) {
      next(error);
    }
  }

  static async updateQuantity(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity <= 0) {
        await prisma.cartItem.delete({ where: { id } });
        return ApiResponse.success(res, 'Item removed from cart');
      }

      const item = await prisma.cartItem.findUnique({
        where: { id },
        include: { variant: true },
      });

      if (!item) {
        return ApiResponse.error(res, 'Cart item not found', 404);
      }

      if (quantity > item.variant.stock) {
        return ApiResponse.error(res, `Only ${item.variant.stock} units available in stock`, 400);
      }

      await prisma.cartItem.update({
        where: { id },
        data: { quantity },
      });

      return ApiResponse.success(res, 'Cart quantity updated');
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.cartItem.delete({ where: { id } });
      return ApiResponse.success(res, 'Item removed from cart');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CartController;

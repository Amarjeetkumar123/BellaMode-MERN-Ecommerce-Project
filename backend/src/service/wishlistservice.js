const userDao = require('../dbhelper/userdao');
const productDao = require('../dbhelper/productdao');
const { asyncHandler, sendSuccess, sendError, isValidObjectId } = require('../utils/commonUtils');

// GET /api/wishlist — the caller's saved products, fully populated.
exports.getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await userDao.getWishlist(req.userId);
    return sendSuccess(res, 200, 'OK', { wishlist });
});

// POST /api/wishlist/:productId — save a product (idempotent).
exports.addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!isValidObjectId(productId)) return sendError(res, 400, 'Invalid product id.');

    const product = await productDao.getProductById(productId);
    if (!product) return sendError(res, 404, 'Product not found.');

    await userDao.addToWishlist(req.userId, productId);
    const wishlist = await userDao.getWishlist(req.userId);
    return sendSuccess(res, 200, 'Added to wishlist.', { wishlist });
});

// DELETE /api/wishlist/:productId — remove a saved product.
exports.removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!isValidObjectId(productId)) return sendError(res, 400, 'Invalid product id.');

    await userDao.removeFromWishlist(req.userId, productId);
    const wishlist = await userDao.getWishlist(req.userId);
    return sendSuccess(res, 200, 'Removed from wishlist.', { wishlist });
});

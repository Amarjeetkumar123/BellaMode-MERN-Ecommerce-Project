const reviewDao = require('../dbhelper/reviewdao');
const productDao = require('../dbhelper/productdao');
const { asyncHandler, sendSuccess, sendError, toObjectId } = require('../utils/commonUtils');

// POST /api/reviews — create or update the caller's review, then sync product rating.
exports.addReview = asyncHandler(async (req, res) => {
    const { productId, rating, comment } = req.body;
    const product = await productDao.getProductById(productId);
    if (!product) return sendError(res, 404, 'Product not found.');

    const review = await reviewDao.upsertReview(productId, req.userId, {
        rating,
        comment: comment || '',
        product: productId,
        user: req.userId,
        userName: req.name,
    });

    const stats = await reviewDao.getProductRatingStats(toObjectId(productId));
    await productDao.setProductRating(productId, stats.avg, stats.count);

    return sendSuccess(res, 201, 'Review submitted successfully.', {
        review,
        rating: stats.avg,
        numReviews: stats.count,
    });
});

// GET /api/reviews/product/:productId — list reviews + aggregate rating.
exports.getReviewsByProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const reviews = await reviewDao.getReviews({ productArray: [productId] }, undefined, { create_date: -1 });
    const stats = await reviewDao.getProductRatingStats(toObjectId(productId));
    return sendSuccess(res, 200, 'OK', { reviews, rating: stats.avg, numReviews: stats.count });
});

const Review = require('../models/review.model');
const { createMongoAndFilterForColumns, modifyMongoQuery, fetchData } = require('./mongohelpers');

const FILTER_COLUMNS = ['_id', 'product', 'user'];

function getRawJsonQuery(filter = {}) {
    const filterJson = {};
    if (filter.reviewIdArray) filterJson._id = filter.reviewIdArray;
    if (filter.productArray) filterJson.product = filter.productArray;
    if (filter.userArray) filterJson.user = filter.userArray;
    return createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, [], [], []);
}

async function getReviews(filter, columnsRequired, sortParams, paginationParams) {
    const query = Review.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    return fetchData(query);
}

// Insert-or-update a user's review for a product.
async function upsertReview(productId, userId, data) {
    return Review.findOneAndUpdate(
        { product: productId, user: userId },
        { $set: { ...data, update_date: Date.now() }, $setOnInsert: { create_date: Date.now() } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
}

// Average rating + count for a product (used to sync the product doc).
async function getProductRatingStats(productId) {
    const agg = await Review.aggregate([
        { $match: { product: productId } },
        { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (!agg.length) return { avg: 0, count: 0 };
    return { avg: Math.round(agg[0].avg * 10) / 10, count: agg[0].count };
}

module.exports = { getReviews, upsertReview, getProductRatingStats };

const Review = require('../models/review.model');
const { LoggerClass } = require('../exception/LoggerClass');
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
    const loggerClass = new LoggerClass('getReviews::', arguments);
    const query = Review.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    const reviews = await fetchData(query);
    loggerClass.writeDebugLogs(reviews);
    return reviews;
}

// Insert-or-update a user's review for a product.
async function upsertReview(productId, userId, data) {
    const loggerClass = new LoggerClass('upsertReview::', arguments);
    const review = await Review.findOneAndUpdate(
        { product: productId, user: userId },
        { $set: { ...data, update_date: Date.now() }, $setOnInsert: { create_date: Date.now() } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    loggerClass.writeDebugLogs(review);
    return review;
}

// Average rating + count for a product (used to sync the product doc).
async function getProductRatingStats(productId) {
    const loggerClass = new LoggerClass('getProductRatingStats::', arguments);
    const agg = await Review.aggregate([
        { $match: { product: productId } },
        { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const stats = agg.length ? { avg: Math.round(agg[0].avg * 10) / 10, count: agg[0].count } : { avg: 0, count: 0 };
    loggerClass.writeDebugLogs(stats);
    return stats;
}

module.exports = { getReviews, upsertReview, getProductRatingStats };

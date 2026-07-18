const { Schema, model } = require('mongoose');
const { withMsTimestamps } = require('./modelHelpers');

const reviewSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
});

withMsTimestamps(reviewSchema);

// One review per user per product (service upserts on this key).
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = model('Review', reviewSchema);
module.exports = Review;

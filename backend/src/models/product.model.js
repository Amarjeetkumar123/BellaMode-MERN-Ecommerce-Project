const { Schema, model } = require('mongoose');
const { AUDIENCES } = require('../constants/constants');
const { withMsTimestamps } = require('./modelHelpers');

const productSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },
    images: [String],
    audience: { type: String, enum: AUDIENCES, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, default: '' },
    colors: [String],
    sizes: [String],
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isTrending: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
});

withMsTimestamps(productSchema);

// Text index powers keyword search; compound index powers the common filter path.
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ audience: 1, category: 1, price: 1 });

const Product = model('Product', productSchema);
module.exports = Product;

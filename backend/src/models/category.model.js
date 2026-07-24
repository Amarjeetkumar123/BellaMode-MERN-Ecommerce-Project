const { Schema, model } = require('mongoose');
const { AUDIENCES } = require('../constants/constants');
const { withMsTimestamps } = require('./modelHelpers');
const { tenantPlugin } = require('../context/storeContext');

const categorySchema = new Schema({
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    audience: { type: String, enum: AUDIENCES, required: true },
    image: String,
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
});

withMsTimestamps(categorySchema);
categorySchema.plugin(tenantPlugin);

const Category = model('Category', categorySchema);
module.exports = Category;

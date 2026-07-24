const { Schema, model } = require('mongoose');
const { withMsTimestamps } = require('./modelHelpers');
const { tenantPlugin } = require('../context/storeContext');

const blogSchema = new Schema({
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    subtitle: { type: String, default: '' },
    content: { type: String, default: '' },
    image: { type: String, default: '' },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    tags: [String],
    isPublished: { type: Boolean, default: true },
});

withMsTimestamps(blogSchema);
blogSchema.index({ title: 'text', subtitle: 'text' });
blogSchema.plugin(tenantPlugin);

const Blog = model('Blog', blogSchema);
module.exports = Blog;

const { Schema, model } = require('mongoose');
const { withMsTimestamps } = require('./modelHelpers');

const blogSchema = new Schema({
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

const Blog = model('Blog', blogSchema);
module.exports = Blog;

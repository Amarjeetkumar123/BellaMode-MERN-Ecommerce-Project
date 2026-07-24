const blogDao = require('../dbhelper/blogdao');
const { asyncHandler, sendSuccess, sendError, slugify, buildPagination } = require('../utils/commonUtils');

async function uniqueSlug(title) {
    const slug = slugify(title);
    let candidate = slug;
    let i = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await blogDao.getBlogBySlug(candidate, { global: true })) {
        candidate = `${slug}-${i++}`;
    }
    return candidate;
}

// GET /api/blogs — public list (published only unless admin passes all=true).
exports.listBlogs = asyncHandler(async (req, res) => {
    const pagination = buildPagination(req.query);
    const filter = {};
    if (req.query.all !== 'true') filter.isPublished = true;
    if (req.query.search) filter.searchObj = { search_text: req.query.search };
    const [blogs, total] = await Promise.all([
        blogDao.getBlogs(filter, undefined, { create_date: -1 }, pagination),
        blogDao.getBlogsCount(filter),
    ]);
    return sendSuccess(res, 200, 'OK', { blogs, total, totalPages: Math.ceil(total / pagination.page_size) });
});

exports.getBlog = asyncHandler(async (req, res) => {
    const blog = await blogDao.getBlogBySlug(req.params.slug);
    if (!blog) return sendError(res, 404, 'Blog not found.');
    return sendSuccess(res, 200, 'OK', { blog });
});

exports.createBlog = asyncHandler(async (req, res) => {
    const slug = await uniqueSlug(req.body.title);
    const blog = await blogDao.saveBlog({ ...req.body, slug, store: req.storeId, author: req.userId, authorName: req.name });
    return sendSuccess(res, 201, 'Blog created successfully.', { blog });
});

exports.updateBlog = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.title) data.slug = await uniqueSlug(data.title);
    const blog = await blogDao.updateBlogById(req.params.id, data, req.storeId);
    if (!blog) return sendError(res, 404, 'Blog not found.');
    return sendSuccess(res, 200, 'Blog updated successfully.', { blog });
});

exports.deleteBlog = asyncHandler(async (req, res) => {
    const blog = await blogDao.deleteBlogById(req.params.id, req.storeId);
    if (!blog) return sendError(res, 404, 'Blog not found.');
    return sendSuccess(res, 200, 'Blog deleted successfully.');
});

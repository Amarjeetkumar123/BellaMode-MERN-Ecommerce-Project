const Blog = require('../models/blog.model');
const {
    createMongoAndFilterForColumns,
    modifyMongoQuery,
    fetchData,
    fetchDataCount,
} = require('./mongohelpers');

const FILTER_COLUMNS = ['_id', 'slug', 'isPublished'];
const SEARCH_COLUMNS = ['title', 'subtitle'];

function getRawJsonQuery(filter = {}) {
    const filterJson = {};
    if (filter.blogIdArray) filterJson._id = filter.blogIdArray;
    if (filter.slugArray) filterJson.slug = filter.slugArray;
    if (filter.isPublished !== undefined) filterJson.isPublished = filter.isPublished;
    if (filter.searchObj) filterJson.search_params = filter.searchObj;
    return createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, [], [], SEARCH_COLUMNS);
}

async function getBlogs(filter, columnsRequired, sortParams, paginationParams) {
    const query = Blog.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    return fetchData(query);
}

async function getBlogsCount(filter) {
    return fetchDataCount(Blog.find(getRawJsonQuery(filter)));
}

async function getBlogBySlug(slug) {
    return Blog.findOne({ slug });
}

async function getBlogById(id) {
    return Blog.findById(id);
}

async function saveBlog(data) {
    return new Blog(data).save();
}

async function updateBlogById(id, data) {
    return Blog.findByIdAndUpdate(id, { $set: { ...data, update_date: Date.now() } }, { new: true });
}

async function deleteBlogById(id) {
    return Blog.findByIdAndDelete(id);
}

module.exports = {
    getBlogs,
    getBlogsCount,
    getBlogBySlug,
    getBlogById,
    saveBlog,
    updateBlogById,
    deleteBlogById,
};

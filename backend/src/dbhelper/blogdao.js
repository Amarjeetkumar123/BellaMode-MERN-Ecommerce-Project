const Blog = require('../models/blog.model');
const { LoggerClass } = require('../exception/LoggerClass');
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
    const loggerClass = new LoggerClass('getBlogs::', arguments);
    const query = Blog.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    const blogs = await fetchData(query);
    loggerClass.writeDebugLogs(blogs);
    return blogs;
}

async function getBlogsCount(filter) {
    const loggerClass = new LoggerClass('getBlogsCount::', arguments);
    const count = await fetchDataCount(Blog.find(getRawJsonQuery(filter)));
    loggerClass.writeDebugLogs(count);
    return count;
}

async function getBlogBySlug(slug, { global } = {}) {
    const loggerClass = new LoggerClass('getBlogBySlug::', arguments);
    const query = Blog.findOne({ slug });
    if (global) query.setOptions({ skipTenant: true });
    const blog = await query;
    loggerClass.writeDebugLogs(blog);
    return blog;
}

async function getBlogById(id) {
    const loggerClass = new LoggerClass('getBlogById::', arguments);
    const blog = await Blog.findById(id);
    loggerClass.writeDebugLogs(blog);
    return blog;
}

async function saveBlog(data) {
    const loggerClass = new LoggerClass('saveBlog::', arguments);
    const blog = await new Blog(data).save();
    loggerClass.writeDebugLogs(blog);
    return blog;
}

async function updateBlogById(id, data, storeId) {
    const loggerClass = new LoggerClass('updateBlogById::', arguments);
    const match = storeId ? { _id: id, store: storeId } : { _id: id };
    const blog = await Blog.findOneAndUpdate(match, { $set: { ...data, update_date: Date.now() } }, { new: true, skipTenant: true });
    loggerClass.writeDebugLogs(blog);
    return blog;
}

async function deleteBlogById(id, storeId) {
    const loggerClass = new LoggerClass('deleteBlogById::', arguments);
    const match = storeId ? { _id: id, store: storeId } : { _id: id };
    const blog = await Blog.findOneAndDelete(match, { skipTenant: true });
    loggerClass.writeDebugLogs(blog);
    return blog;
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

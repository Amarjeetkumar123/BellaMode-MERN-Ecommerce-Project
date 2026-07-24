const Category = require('../models/category.model');
const { LoggerClass } = require('../exception/LoggerClass');
const {
    createMongoAndFilterForColumns,
    modifyMongoQuery,
    fetchData,
    fetchDataCount,
} = require('./mongohelpers');

const FILTER_COLUMNS = ['_id', 'store', 'slug', 'audience', 'parent', 'isActive'];
const SEARCH_COLUMNS = ['name'];

function getRawJsonQuery(filter = {}) {
    const filterJson = {};
    if (filter.categoryIdArray) filterJson._id = filter.categoryIdArray;
    if (filter.storeArray) filterJson.store = filter.storeArray;
    if (filter.slugArray) filterJson.slug = filter.slugArray;
    if (filter.audienceArray) filterJson.audience = filter.audienceArray;
    if (filter.parentArray) filterJson.parent = filter.parentArray;
    if (filter.isActive !== undefined) filterJson.isActive = filter.isActive;
    if (filter.searchObj) filterJson.search_params = filter.searchObj;
    return createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, [], [], SEARCH_COLUMNS);
}

async function getCategories(filter, columnsRequired, sortParams, paginationParams) {
    const loggerClass = new LoggerClass('getCategories::', arguments);
    const query = Category.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    const categories = await fetchData(query);
    loggerClass.writeDebugLogs(categories);
    return categories;
}

async function getCategoriesCount(filter) {
    const loggerClass = new LoggerClass('getCategoriesCount::', arguments);
    const count = await fetchDataCount(Category.find(getRawJsonQuery(filter)));
    loggerClass.writeDebugLogs(count);
    return count;
}

async function getCategoryById(id) {
    const loggerClass = new LoggerClass('getCategoryById::', arguments);
    const category = await Category.findById(id);
    loggerClass.writeDebugLogs(category);
    return category;
}

// `global:true` bypasses tenant scoping (slug uniqueness is global in Phase 1).
async function getCategoryBySlug(slug, { global } = {}) {
    const loggerClass = new LoggerClass('getCategoryBySlug::', arguments);
    const query = Category.findOne({ slug });
    if (global) query.setOptions({ skipTenant: true });
    const category = await query;
    loggerClass.writeDebugLogs(category);
    return category;
}

async function saveCategory(data) {
    const loggerClass = new LoggerClass('saveCategory::', arguments);
    const category = await new Category(data).save();
    loggerClass.writeDebugLogs(category);
    return category;
}

async function updateCategoryById(id, data, storeId) {
    const loggerClass = new LoggerClass('updateCategoryById::', arguments);
    const match = storeId ? { _id: id, store: storeId } : { _id: id };
    const category = await Category.findOneAndUpdate(match, { $set: { ...data, update_date: Date.now() } }, { new: true, skipTenant: true });
    loggerClass.writeDebugLogs(category);
    return category;
}

async function deleteCategoryById(id, storeId) {
    const loggerClass = new LoggerClass('deleteCategoryById::', arguments);
    const match = storeId ? { _id: id, store: storeId } : { _id: id };
    const category = await Category.findOneAndDelete(match, { skipTenant: true });
    loggerClass.writeDebugLogs(category);
    return category;
}

module.exports = {
    getCategories,
    getCategoriesCount,
    getCategoryById,
    getCategoryBySlug,
    saveCategory,
    updateCategoryById,
    deleteCategoryById,
};

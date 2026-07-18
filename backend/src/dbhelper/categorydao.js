const Category = require('../models/category.model');
const {
    createMongoAndFilterForColumns,
    modifyMongoQuery,
    fetchData,
    fetchDataCount,
} = require('./mongohelpers');

const FILTER_COLUMNS = ['_id', 'slug', 'audience', 'parent', 'isActive'];
const SEARCH_COLUMNS = ['name'];

function getRawJsonQuery(filter = {}) {
    const filterJson = {};
    if (filter.categoryIdArray) filterJson._id = filter.categoryIdArray;
    if (filter.slugArray) filterJson.slug = filter.slugArray;
    if (filter.audienceArray) filterJson.audience = filter.audienceArray;
    if (filter.parentArray) filterJson.parent = filter.parentArray;
    if (filter.isActive !== undefined) filterJson.isActive = filter.isActive;
    if (filter.searchObj) filterJson.search_params = filter.searchObj;
    return createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, [], [], SEARCH_COLUMNS);
}

async function getCategories(filter, columnsRequired, sortParams, paginationParams) {
    const query = Category.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    return fetchData(query);
}

async function getCategoriesCount(filter) {
    return fetchDataCount(Category.find(getRawJsonQuery(filter)));
}

async function getCategoryById(id) {
    return Category.findById(id);
}

async function getCategoryBySlug(slug) {
    return Category.findOne({ slug });
}

async function saveCategory(data) {
    return new Category(data).save();
}

async function updateCategoryById(id, data) {
    return Category.findByIdAndUpdate(id, { $set: { ...data, update_date: Date.now() } }, { new: true });
}

async function deleteCategoryById(id) {
    return Category.findByIdAndDelete(id);
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

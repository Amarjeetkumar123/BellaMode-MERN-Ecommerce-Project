const Product = require('../models/product.model');
const { LoggerClass } = require('../exception/LoggerClass');
const {
    createMongoAndFilterForColumns,
    modifyMongoQuery,
    fetchData,
    fetchDataCount,
} = require('./mongohelpers');

// colors/sizes are arrays in the doc — $in matches array membership, so they filter correctly here.
// `store` is whitelisted so seller/facet queries can scope explicitly (aggregation isn't covered by the plugin).
const FILTER_COLUMNS = ['_id', 'store', 'slug', 'audience', 'category', 'colors', 'sizes', 'brand', 'isTrending', 'isFeatured', 'isActive'];
const RANGE_COLUMNS = ['price'];
const SEARCH_COLUMNS = ['name', 'description', 'brand'];

function getRawJsonQuery(filter = {}) {
    const filterJson = {};
    if (filter.productIdArray) filterJson._id = filter.productIdArray;
    if (filter.storeArray) filterJson.store = filter.storeArray;
    if (filter.slugArray) filterJson.slug = filter.slugArray;
    if (filter.audienceArray) filterJson.audience = filter.audienceArray;
    if (filter.categoryArray) filterJson.category = filter.categoryArray;
    if (filter.colorArray) filterJson.colors = filter.colorArray;
    if (filter.sizeArray) filterJson.sizes = filter.sizeArray;
    if (filter.brandArray) filterJson.brand = filter.brandArray;
    if (filter.priceRange) filterJson.price = filter.priceRange;
    if (filter.isTrending !== undefined) filterJson.isTrending = filter.isTrending;
    if (filter.isFeatured !== undefined) filterJson.isFeatured = filter.isFeatured;
    if (filter.isActive !== undefined) filterJson.isActive = filter.isActive;
    if (filter.searchObj) filterJson.search_params = filter.searchObj;
    return createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, RANGE_COLUMNS, [], SEARCH_COLUMNS);
}

async function getProducts(filter, columnsRequired, sortParams, paginationParams, populate) {
    const loggerClass = new LoggerClass('getProducts::', arguments);
    const query = Product.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    if (populate) query.populate(populate);
    const products = await fetchData(query);
    loggerClass.writeDebugLogs(products);
    return products;
}

async function getProductsCount(filter) {
    const loggerClass = new LoggerClass('getProductsCount::', arguments);
    const count = await fetchDataCount(Product.find(getRawJsonQuery(filter)));
    loggerClass.writeDebugLogs(count);
    return count;
}

async function getProductById(id) {
    const loggerClass = new LoggerClass('getProductById::', arguments);
    const product = await Product.findById(id)
        .populate('category', 'name slug audience')
        .populate('store', 'name slug status');
    loggerClass.writeDebugLogs(product);
    return product;
}

// `global:true` bypasses tenant scoping — needed for slug-uniqueness checks,
// since product slugs are globally unique in Phase 1.
async function getProductBySlug(slug, { global } = {}) {
    const loggerClass = new LoggerClass('getProductBySlug::', arguments);
    const query = Product.findOne({ slug })
        .populate('category', 'name slug audience')
        .populate('store', 'name slug status');
    if (global) query.setOptions({ skipTenant: true });
    const product = await query;
    loggerClass.writeDebugLogs(product);
    return product;
}

async function saveProduct(data) {
    const loggerClass = new LoggerClass('saveProduct::', arguments);
    const product = await new Product(data).save();
    loggerClass.writeDebugLogs(product);
    return product;
}

// storeId, when given, scopes the mutation so a seller can only touch their own
// store's product — a cross-store id returns null → the service 404s. This explicit
// scope is the authoritative isolation layer (the ALS plugin is only a backstop).
async function updateProductById(id, data, storeId) {
    const loggerClass = new LoggerClass('updateProductById::', arguments);
    const match = storeId ? { _id: id, store: storeId } : { _id: id };
    const product = await Product.findOneAndUpdate(match, { $set: { ...data, update_date: Date.now() } }, { new: true, skipTenant: true });
    loggerClass.writeDebugLogs(product);
    return product;
}

async function deleteProductById(id, storeId) {
    const loggerClass = new LoggerClass('deleteProductById::', arguments);
    const match = storeId ? { _id: id, store: storeId } : { _id: id };
    const product = await Product.findOneAndDelete(match, { skipTenant: true });
    loggerClass.writeDebugLogs(product);
    return product;
}

// Dynamic facets for the storefront filter UI, scoped to an optional base filter.
async function getFilterFacets(filter = {}) {
    const loggerClass = new LoggerClass('getFilterFacets::', arguments);
    const match = getRawJsonQuery(filter);
    const [colors, sizes, brands, priceAgg] = await Promise.all([
        Product.distinct('colors', match),
        Product.distinct('sizes', match),
        Product.distinct('brand', match),
        Product.aggregate([
            { $match: match },
            { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } },
        ]),
    ]);
    const price = priceAgg[0] || { minPrice: 0, maxPrice: 0 };
    const facets = {
        colors: colors.filter(Boolean).sort(),
        sizes: sizes.filter(Boolean).sort(),
        brands: brands.filter(Boolean).sort(),
        minPrice: price.minPrice || 0,
        maxPrice: price.maxPrice || 0,
    };
    loggerClass.writeDebugLogs(facets);
    return facets;
}

// Adjusts a product's rating + review count (called by the review service).
async function setProductRating(id, rating, numReviews) {
    const loggerClass = new LoggerClass('setProductRating::', arguments);
    const product = await Product.findByIdAndUpdate(
        id,
        { $set: { rating, numReviews, update_date: Date.now() } },
        { new: true }
    );
    loggerClass.writeDebugLogs(product);
    return product;
}

module.exports = {
    getProducts,
    getProductsCount,
    getProductById,
    getProductBySlug,
    saveProduct,
    updateProductById,
    deleteProductById,
    getFilterFacets,
    setProductRating,
};

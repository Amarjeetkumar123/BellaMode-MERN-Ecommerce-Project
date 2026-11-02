const Product = require('../models/product.model');
const {
    createMongoAndFilterForColumns,
    modifyMongoQuery,
    fetchData,
    fetchDataCount,
} = require('./mongohelpers');

// colors/sizes are arrays in the doc — $in matches array membership, so they filter correctly here.
const FILTER_COLUMNS = ['_id', 'slug', 'audience', 'category', 'colors', 'sizes', 'brand', 'isTrending', 'isFeatured', 'isActive'];
const RANGE_COLUMNS = ['price', 'stock'];
const SEARCH_COLUMNS = ['name', 'description', 'brand'];

function getRawJsonQuery(filter = {}) {
    const filterJson = {};
    if (filter.productIdArray) filterJson._id = filter.productIdArray;
    if (filter.slugArray) filterJson.slug = filter.slugArray;
    if (filter.audienceArray) filterJson.audience = filter.audienceArray;
    if (filter.categoryArray) filterJson.category = filter.categoryArray;
    if (filter.colorArray) filterJson.colors = filter.colorArray;
    if (filter.sizeArray) filterJson.sizes = filter.sizeArray;
    if (filter.brandArray) filterJson.brand = filter.brandArray;
    if (filter.priceRange) filterJson.price = filter.priceRange;
    if (filter.stockRange) filterJson.stock = filter.stockRange;
    if (filter.isTrending !== undefined) filterJson.isTrending = filter.isTrending;
    if (filter.isFeatured !== undefined) filterJson.isFeatured = filter.isFeatured;
    if (filter.isActive !== undefined) filterJson.isActive = filter.isActive;
    if (filter.searchObj) filterJson.search_params = filter.searchObj;
    const mongoFilter = createMongoAndFilterForColumns(filterJson, FILTER_COLUMNS, RANGE_COLUMNS, [], SEARCH_COLUMNS);
    if (filter.onSale) mongoFilter.$expr = { $gt: ['$oldPrice', '$price'] };
    return mongoFilter;
}

async function getProducts(filter, columnsRequired, sortParams, paginationParams, populate) {
    const query = Product.find(getRawJsonQuery(filter));
    modifyMongoQuery(query, columnsRequired, sortParams, paginationParams);
    if (populate) query.populate(populate);
    return fetchData(query);
}

async function getProductsCount(filter) {
    return fetchDataCount(Product.find(getRawJsonQuery(filter)));
}

async function getProductById(id) {
    return Product.findById(id).populate('category', 'name slug audience');
}

async function getProductBySlug(slug) {
    return Product.findOne({ slug }).populate('category', 'name slug audience');
}

async function saveProduct(data) {
    return new Product(data).save();
}

async function updateProductById(id, data) {
    return Product.findByIdAndUpdate(id, { $set: { ...data, update_date: Date.now() } }, { new: true });
}

async function deleteProductById(id) {
    return Product.findByIdAndDelete(id);
}

// Dynamic facets for the storefront filter UI, scoped to an optional base filter.
async function getFilterFacets(filter = {}) {
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
    return {
        colors: colors.filter(Boolean).sort(),
        sizes: sizes.filter(Boolean).sort(),
        brands: brands.filter(Boolean).sort(),
        minPrice: price.minPrice || 0,
        maxPrice: price.maxPrice || 0,
    };
}

// Adjusts a product's rating + review count (called by the review service).
async function setProductRating(id, rating, numReviews) {
    return Product.findByIdAndUpdate(
        id,
        { $set: { rating, numReviews, update_date: Date.now() } },
        { new: true }
    );
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

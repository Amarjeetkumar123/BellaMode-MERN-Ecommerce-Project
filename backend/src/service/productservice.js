const productDao = require('../dbhelper/productdao');
const categoryDao = require('../dbhelper/categorydao');
const storeDao = require('../dbhelper/storedao');
const {
    asyncHandler,
    sendSuccess,
    sendError,
    slugify,
    buildPagination,
    buildSort,
    isValidObjectId,
} = require('../utils/commonUtils');

async function uniqueSlug(name) {
    const slug = slugify(name);
    let candidate = slug;
    let i = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await productDao.getProductBySlug(candidate, { global: true })) {
        candidate = `${slug}-${i++}`;
    }
    return candidate;
}

// Resolves a ?category param (slug OR id) into category id(s) to filter on.
async function resolveCategoryIds(categoryParam) {
    if (!categoryParam) return undefined;
    if (isValidObjectId(categoryParam)) return [categoryParam];
    const category = await categoryDao.getCategoryBySlug(categoryParam);
    return category ? [category._id] : ['000000000000000000000000']; // no match → empty result
}

// Translates the request query into a ProductFilter-shaped object.
async function buildProductFilter(query, { activeOnly } = {}) {
    const filter = {};
    if (query.audience) filter.audienceArray = [query.audience];
    const categoryIds = await resolveCategoryIds(query.category);
    if (categoryIds) filter.categoryArray = categoryIds;
    if (query.color) filter.colorArray = String(query.color).split(',');
    if (query.size) filter.sizeArray = String(query.size).split(',');
    if (query.brand) filter.brandArray = String(query.brand).split(',');
    if (query.minPrice != null || query.maxPrice != null) {
        filter.priceRange = {};
        if (query.minPrice != null && query.minPrice !== '') filter.priceRange.from = Number(query.minPrice);
        if (query.maxPrice != null && query.maxPrice !== '') filter.priceRange.to = Number(query.maxPrice);
    }
    if (query.trending === 'true') filter.isTrending = true;
    if (query.featured === 'true') filter.isFeatured = true;
    if (query.search) filter.searchObj = { search_text: query.search };
    if (activeOnly) filter.isActive = true;
    return filter;
}

const NO_MATCH = '000000000000000000000000';

// The set of store ids a shopper is allowed to see (approved stores only). Falls
// back to a non-matching sentinel when nothing is approved, so an empty marketplace
// returns zero products rather than leaking every store.
async function approvedStoreScope() {
    const ids = await storeDao.getApprovedStoreIds();
    return ids.length ? ids.map(String) : [NO_MATCH];
}

// Resolves a ?store param (slug OR id) to a store id, or null if it doesn't exist.
async function resolveStoreId(param) {
    if (isValidObjectId(param)) return param;
    const store = await storeDao.getStoreBySlug(param);
    return store ? String(store._id) : null;
}

// The store scope for a public list: a single approved store when ?store is given
// (non-matching sentinel if it's missing or not approved), else all approved stores.
async function publicStoreScope(storeParam) {
    const scope = await approvedStoreScope();
    if (!storeParam) return scope;
    const one = await resolveStoreId(storeParam);
    return one && scope.includes(String(one)) ? [String(one)] : [NO_MATCH];
}

// Shared list runner. `storeId` scopes to one store (seller dashboard); omitted →
// global marketplace list constrained to approved stores. `activeOnly` hides
// inactive products from shoppers.
async function runProductList(req, { storeId, activeOnly, approvedOnly }) {
    const pagination = buildPagination(req.query);
    const sort = buildSort(req.query);
    const filter = await buildProductFilter(req.query, { activeOnly });
    if (storeId) filter.storeArray = [storeId];
    else if (approvedOnly) filter.storeArray = await publicStoreScope(req.query.store);
    const [products, total] = await Promise.all([
        productDao.getProducts(filter, undefined, sort, pagination, { path: 'category', select: 'name slug audience' }),
        productDao.getProductsCount(filter),
    ]);
    return {
        products,
        total,
        page: pagination.page_number,
        totalPages: Math.ceil(total / pagination.page_size),
    };
}

// GET /api/products — public marketplace, aggregated across all approved stores.
exports.listProducts = asyncHandler(async (req, res) => {
    const data = await runProductList(req, { activeOnly: true, approvedOnly: true });
    return sendSuccess(res, 200, 'OK', data);
});

// GET /api/stores/:storeId/products — a seller's own catalogue (req.storeId from loadOwnedStore),
// including inactive products so they can manage everything.
exports.listMyProducts = asyncHandler(async (req, res) => {
    const data = await runProductList(req, { storeId: req.storeId });
    return sendSuccess(res, 200, 'OK', data);
});

// Dynamic facets for the storefront filter sidebar (approved stores only, so the
// sidebar never advertises colours/sizes that only exist in hidden catalogues).
exports.getFilters = asyncHandler(async (req, res) => {
    const filter = await buildProductFilter(req.query, { activeOnly: true });
    filter.storeArray = await publicStoreScope(req.query.store);
    const facets = await productDao.getFilterFacets(filter);
    return sendSuccess(res, 200, 'OK', facets);
});

exports.getProduct = asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;
    const product = isValidObjectId(idOrSlug)
        ? await productDao.getProductById(idOrSlug)
        : await productDao.getProductBySlug(idOrSlug);
    if (!product) return sendError(res, 404, 'Product not found.');
    // A product from a pending/suspended store is not shoppable on the public PDP.
    const storeId = product.store && (product.store._id || product.store);
    const approved = (await approvedStoreScope()).map(String);
    if (!storeId || !approved.includes(String(storeId))) return sendError(res, 404, 'Product not found.');
    return sendSuccess(res, 200, 'OK', { product });
});

exports.createProduct = asyncHandler(async (req, res) => {
    const slug = await uniqueSlug(req.body.name);
    // store + author come from the authenticated seller context, never the body.
    const product = await productDao.saveProduct({ ...req.body, slug, store: req.storeId, author: req.userId });
    return sendSuccess(res, 201, 'Product created successfully.', { product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.name) data.slug = await uniqueSlug(data.name);
    // Scoped to the caller's store — another store's id resolves to null → 404.
    const product = await productDao.updateProductById(req.params.id, data, req.storeId);
    if (!product) return sendError(res, 404, 'Product not found.');
    return sendSuccess(res, 200, 'Product updated successfully.', { product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await productDao.deleteProductById(req.params.id, req.storeId);
    if (!product) return sendError(res, 404, 'Product not found.');
    return sendSuccess(res, 200, 'Product deleted successfully.');
});

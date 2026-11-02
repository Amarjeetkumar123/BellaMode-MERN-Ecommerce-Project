const productDao = require('../dbhelper/productdao');
const categoryDao = require('../dbhelper/categorydao');
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
    while (await productDao.getProductBySlug(candidate)) {
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
    // admin stock filter: out = 0, low = 1 to 5, in = 1 or more
    const STOCK = { out: { to: 0 }, low: { from: 1, to: 5 }, in: { from: 1 } };
    if (STOCK[query.stock]) filter.stockRange = STOCK[query.stock];
    if (query.trending === 'true') filter.isTrending = true;
    if (query.featured === 'true') filter.isFeatured = true;
    if (query.sale === 'true') filter.onSale = true;
    if (query.search) filter.searchObj = { search_text: query.search };
    if (activeOnly) filter.isActive = true;
    return filter;
}

exports.listProducts = asyncHandler(async (req, res) => {
    const pagination = buildPagination(req.query);
    const sort = buildSort(req.query);
    const filter = await buildProductFilter(req.query, { activeOnly: true });
    const [products, total] = await Promise.all([
        productDao.getProducts(filter, undefined, sort, pagination, { path: 'category', select: 'name slug audience' }),
        productDao.getProductsCount(filter),
    ]);
    return sendSuccess(res, 200, 'OK', {
        products,
        total,
        page: pagination.page_number,
        totalPages: Math.ceil(total / pagination.page_size),
    });
});

// Dynamic facets for the storefront filter sidebar.
exports.getFilters = asyncHandler(async (req, res) => {
    const filter = await buildProductFilter(req.query, { activeOnly: true });
    const facets = await productDao.getFilterFacets(filter);
    return sendSuccess(res, 200, 'OK', facets);
});

exports.getProduct = asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;
    const product = isValidObjectId(idOrSlug)
        ? await productDao.getProductById(idOrSlug)
        : await productDao.getProductBySlug(idOrSlug);
    if (!product) return sendError(res, 404, 'Product not found.');
    return sendSuccess(res, 200, 'OK', { product });
});

exports.createProduct = asyncHandler(async (req, res) => {
    const slug = await uniqueSlug(req.body.name);
    const product = await productDao.saveProduct({ ...req.body, slug, author: req.userId });
    return sendSuccess(res, 201, 'Product created successfully.', { product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.name) data.slug = await uniqueSlug(data.name);
    const product = await productDao.updateProductById(req.params.id, data);
    if (!product) return sendError(res, 404, 'Product not found.');
    return sendSuccess(res, 200, 'Product updated successfully.', { product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await productDao.deleteProductById(req.params.id);
    if (!product) return sendError(res, 404, 'Product not found.');
    return sendSuccess(res, 200, 'Product deleted successfully.');
});

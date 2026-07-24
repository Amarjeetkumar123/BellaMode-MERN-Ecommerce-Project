const categoryDao = require('../dbhelper/categorydao');
const { asyncHandler, sendSuccess, sendError, slugify } = require('../utils/commonUtils');

// Generates a slug that doesn't collide with an existing category.
async function uniqueSlug(name) {
    let slug = slugify(name);
    let candidate = slug;
    let i = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await categoryDao.getCategoryBySlug(candidate, { global: true })) {
        candidate = `${slug}-${i++}`;
    }
    return candidate;
}

function buildCategoryFilter(req, storeId) {
    const filter = {};
    if (req.query.audience) filter.audienceArray = [req.query.audience];
    if (req.query.active !== undefined) filter.isActive = req.query.active === 'true';
    if (req.query.search) filter.searchObj = { search_text: req.query.search };
    if (storeId) filter.storeArray = [storeId];
    return filter;
}

// GET /api/categories — public, aggregated across all stores.
exports.listCategories = asyncHandler(async (req, res) => {
    const categories = await categoryDao.getCategories(buildCategoryFilter(req), undefined, { sortOrder: 1, create_date: -1 });
    return sendSuccess(res, 200, 'OK', { categories });
});

// GET /api/categories/mine — a seller's own categories (req.storeId from resolveStore).
exports.listMyCategories = asyncHandler(async (req, res) => {
    const categories = await categoryDao.getCategories(buildCategoryFilter(req, req.storeId), undefined, { sortOrder: 1, create_date: -1 });
    return sendSuccess(res, 200, 'OK', { categories });
});

exports.getCategory = asyncHandler(async (req, res) => {
    const category = await categoryDao.getCategoryBySlug(req.params.slug);
    if (!category) return sendError(res, 404, 'Category not found.');
    return sendSuccess(res, 200, 'OK', { category });
});

exports.createCategory = asyncHandler(async (req, res) => {
    const slug = await uniqueSlug(req.body.name);
    const category = await categoryDao.saveCategory({ ...req.body, slug, store: req.storeId });
    return sendSuccess(res, 201, 'Category created successfully.', { category });
});

exports.updateCategory = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.name) data.slug = await uniqueSlug(data.name);
    const category = await categoryDao.updateCategoryById(req.params.id, data, req.storeId);
    if (!category) return sendError(res, 404, 'Category not found.');
    return sendSuccess(res, 200, 'Category updated successfully.', { category });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await categoryDao.deleteCategoryById(req.params.id, req.storeId);
    if (!category) return sendError(res, 404, 'Category not found.');
    return sendSuccess(res, 200, 'Category deleted successfully.');
});

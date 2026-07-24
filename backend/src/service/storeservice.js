const storeDao = require('../dbhelper/storedao');
const userDao = require('../dbhelper/userdao');
const { StoreFilter } = require('../filters/storefilter');
const { RESERVED_SLUGS } = require('../jsonvalidation/storeschema');
const { asyncHandler, sendSuccess, sendError, slugify, buildPagination } = require('../utils/commonUtils');
const { ROLES } = require('../constants/constants');

// Generates a store slug that doesn't collide and isn't reserved.
async function uniqueSlug(base) {
    let slug = slugify(base);
    if (RESERVED_SLUGS.includes(slug)) slug = `${slug}-store`;
    let candidate = slug;
    let i = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await storeDao.getStoreBySlug(candidate)) {
        candidate = `${slug}-${i++}`;
    }
    return candidate;
}

// POST /api/stores — a logged-in user creates their store (pending) and becomes a SELLER.
exports.createStore = asyncHandler(async (req, res) => {
    const existing = await storeDao.getStoreByOwner(req.userId);
    if (existing) return sendError(res, 409, 'You already own a store.');

    if (req.body.slug && RESERVED_SLUGS.includes(req.body.slug)) {
        return sendError(res, 400, 'That store slug is reserved.');
    }
    const slug = await uniqueSlug(req.body.slug || req.body.name);
    const store = await storeDao.saveStore({
        owner: req.userId,
        name: req.body.name,
        slug,
        subdomain: req.body.subdomain,
        status: 'pending',
    });
    // Link the store to the user and promote them to SELLER (unless already superadmin).
    const roleUpdate = req.role === ROLES.SUPERADMIN ? {} : { role: ROLES.SELLER };
    await userDao.updateUserById(req.userId, { store: store._id, ...roleUpdate });

    return sendSuccess(res, 201, 'Store created.', { store });
});

// GET /api/stores — platform admin lists all stores (optional ?status=).
exports.listStores = asyncHandler(async (req, res) => {
    const pagination = buildPagination(req.query);
    const filter = new StoreFilter();
    if (req.query.status) filter.statusArray = [req.query.status];
    if (req.query.search) filter.searchObj = { search_text: req.query.search };
    const [stores, total] = await Promise.all([
        storeDao.getStores(filter, undefined, { create_date: -1 }, pagination),
        storeDao.getStoresCount(filter),
    ]);
    return sendSuccess(res, 200, 'OK', { stores, total, totalPages: Math.ceil(total / pagination.page_size) });
});

// GET /api/stores/:storeId — the loaded store (loadOwnedStore already authorized + attached it).
exports.getStore = asyncHandler(async (req, res) => {
    return sendSuccess(res, 200, 'OK', { store: req.store });
});

// PATCH /api/stores/:storeId — owner edits name/slug/subdomain only.
// (status/commissionRate/owner are rejected by the schema; slug uniqueness re-checked.)
exports.updateStore = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.slug && data.slug !== req.store.slug) {
        if (RESERVED_SLUGS.includes(data.slug)) return sendError(res, 400, 'That store slug is reserved.');
        const clash = await storeDao.getStoreBySlug(data.slug);
        if (clash && String(clash._id) !== String(req.storeId)) return sendError(res, 409, 'Slug already in use.');
    }
    const store = await storeDao.updateStoreById(req.storeId, data);
    return sendSuccess(res, 200, 'Store updated.', { store });
});

// PATCH /api/stores/:storeId/status — platform admin approves/suspends + sets commission.
exports.updateStoreStatus = asyncHandler(async (req, res) => {
    const data = { status: req.body.status };
    if (req.body.commissionRate !== undefined) data.commissionRate = req.body.commissionRate;
    const store = await storeDao.updateStoreById(req.params.storeId, data);
    if (!store) return sendError(res, 404, 'Store not found.');
    return sendSuccess(res, 200, 'Store status updated.', { store });
});

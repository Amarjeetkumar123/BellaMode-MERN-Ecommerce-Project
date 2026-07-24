const storeDao = require('../dbhelper/storedao');
const settingDao = require('../dbhelper/settingdao');
const { parseSubdomain } = require('../utils/host');
const { asyncHandler, sendSuccess, sendError, isValidObjectId } = require('../utils/commonUtils');

// Only the fields a shopper should see — never owner, commissionRate, domains, etc.
function toPublicStore(store) {
    return {
        _id: store._id,
        name: store.name,
        slug: store.slug,
        subdomain: store.subdomain || null,
    };
}

// GET /api/storefronts/resolve — maps the request's Host header to a storefront.
// The SPA calls this on boot: on "acme.wearly.com" it returns Acme's store so the app
// renders that storefront; on the apex/"www" it returns { store: null } (marketplace).
exports.resolveHost = asyncHandler(async (req, res) => {
    const sub = parseSubdomain(req.hostname || req.headers.host);
    if (!sub) return sendSuccess(res, 200, 'OK', { store: null });

    // Prefer an explicit subdomain mapping, fall back to the slug for convenience.
    const store = (await storeDao.getStoreBySubdomain(sub)) || (await storeDao.getStoreBySlug(sub));
    if (!store || store.status !== 'approved') return sendSuccess(res, 200, 'OK', { store: null });

    return sendSuccess(res, 200, 'OK', { store: toPublicStore(store) });
});

// GET /api/storefronts/:slug — public store profile + its branding settings.
// Pending/suspended stores are invisible to shoppers (404), matching the product
// scoping so a store and its catalogue appear/disappear together.
exports.getStorefront = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const store = isValidObjectId(slug)
        ? await storeDao.getStoreById(slug)
        : await storeDao.getStoreBySlug(slug);
    if (!store || store.status !== 'approved') return sendError(res, 404, 'Store not found.');

    const settings = await settingDao.getSettings(store._id);
    return sendSuccess(res, 200, 'OK', { store: toPublicStore(store), settings });
});

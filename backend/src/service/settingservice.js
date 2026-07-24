const settingDao = require('../dbhelper/settingdao');
const storeDao = require('../dbhelper/storedao');
const { asyncHandler, sendSuccess, sendError } = require('../utils/commonUtils');

// GET /api/settings — public brand/site config.
// Optional ?store=<slug|id> targets a specific store; otherwise the default
// (platform) store's settings power the current single storefront.
exports.getSettings = asyncHandler(async (req, res) => {
    let store = null;
    if (req.query.store) {
        store = /^[0-9a-fA-F]{24}$/.test(req.query.store)
            ? await storeDao.getStoreById(req.query.store)
            : await storeDao.getStoreBySlug(req.query.store);
    }
    if (!store) store = await storeDao.getDefaultStore();
    if (!store) return sendSuccess(res, 200, 'OK', { settings: null }); // fresh DB, not seeded yet

    const settings = await settingDao.getSettings(store._id);
    return sendSuccess(res, 200, 'OK', { settings });
});

// GET /api/stores/:storeId/settings — a seller reads their own store's settings
// (req.storeId set by loadOwnedStore).
exports.getStoreSettings = asyncHandler(async (req, res) => {
    const settings = await settingDao.getSettings(req.storeId);
    return sendSuccess(res, 200, 'OK', { settings });
});

// PATCH /api/stores/:storeId/settings — seller updates their own store's settings
// (req.storeId set by loadOwnedStore).
exports.updateSettings = asyncHandler(async (req, res) => {
    if (!req.storeId) return sendError(res, 403, 'No store context.');
    const settings = await settingDao.updateSettings(req.storeId, req.body);
    return sendSuccess(res, 200, 'Settings updated successfully.', { settings });
});

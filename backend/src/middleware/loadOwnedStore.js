const storeDao = require('../dbhelper/storedao');
const { ROLES } = require('../constants/constants');
const { isValidObjectId } = require('../utils/commonUtils');
const { enterStore } = require('../context/storeContext');

// Ownership guard for the id-driven seller routes (`/api/stores/:storeId/...`).
// The store id is client-supplied, so ownership MUST be verified here — this is
// the single authorization point that makes every nested seller route safe.
// Runs AFTER checkAuth. Uses the andMiddleware next(isSuccess, code, body) contract.
//
// - Owner of the store → allowed.
// - SUPERADMIN → allowed on any store (cross-store platform management).
// - Anyone else / wrong store → 403 (never reaches the handler).
module.exports = async (req, res, next) => {
    try {
        const { storeId } = req.params;
        if (!isValidObjectId(storeId)) {
            return next(false, 400, { success: false, message: 'Invalid store id.' });
        }

        const store = await storeDao.getStoreById(storeId);
        if (!store) return next(false, 404, { success: false, message: 'Store not found.' });

        const isOwner = String(store.owner) === String(req.userId);
        if (!isOwner && req.role !== ROLES.SUPERADMIN) {
            return next(false, 403, { success: false, message: 'Access denied.' });
        }

        req.storeId = String(store._id);
        req.store = store;
        enterStore(req.storeId); // keep the Mongoose tenant-plugin backstop active
        return next(true);
    } catch (err) {
        return next(false, 500, { success: false, message: 'Failed to load store context.' });
    }
};

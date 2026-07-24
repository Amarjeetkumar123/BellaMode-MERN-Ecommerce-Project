const userDao = require('../dbhelper/userdao');
const storeDao = require('../dbhelper/storedao');
const { ROLES } = require('../constants/constants');
const { isValidObjectId } = require('../utils/commonUtils');
const { enterStore } = require('../context/storeContext');

// Resolves which store the current request acts on, for the seller-dashboard
// route group. Runs AFTER checkAuth. Sets req.storeId, enters the tenant context
// (so the Mongoose plugin backstop kicks in), and uses the custom
// next(isSuccess, code, body) contract so it composes with andMiddleware.
//
// - SELLER   → their own store (403 if they don't have one yet).
// - SUPERADMIN → their own store by default; may target any store via ?store=<id>.
module.exports = async (req, res, next) => {
    try {
        let storeId = null;

        // Platform owner may explicitly target a store (cross-store management).
        if (req.role === ROLES.SUPERADMIN && req.query.store) {
            if (!isValidObjectId(req.query.store)) {
                return next(false, 400, { success: false, message: 'Invalid store id.' });
            }
            const target = await storeDao.getStoreById(req.query.store);
            if (!target) return next(false, 404, { success: false, message: 'Store not found.' });
            storeId = String(target._id);
        } else {
            // Otherwise, the acting user's own store.
            const user = await userDao.getUserById(req.userId);
            if (user && user.store) {
                storeId = String(user.store);
            } else {
                const owned = await storeDao.getStoreByOwner(req.userId);
                if (owned) storeId = String(owned._id);
            }
        }

        if (!storeId) {
            return next(false, 403, {
                success: false,
                message: 'No store is associated with this account.',
            });
        }

        req.storeId = storeId;
        enterStore(storeId);
        return next(true);
    } catch (err) {
        return next(false, 500, { success: false, message: 'Failed to resolve store context.' });
    }
};

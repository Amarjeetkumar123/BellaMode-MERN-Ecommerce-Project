const { MESSAGES } = require('../constants/constants');

// Variadic role guard: checkRole('SUPERADMIN','ADMIN').
// Must run AFTER checkAuth (which sets req.role). Custom next(isSuccess, code, body) contract.
module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        if (req.role && allowedRoles.includes(req.role)) {
            return next(true);
        }
        return next(false, 403, { success: false, message: MESSAGES.ACCESS_DENIED });
    };
};

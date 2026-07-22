const jwt = require('jsonwebtoken');
const { TOKEN_SECRET, MESSAGES } = require('../constants/constants');

// Reads the JWT from the Authorization header (tolerates a "Bearer " prefix),
// verifies it, and hydrates req with the user context.
// Uses the custom next(isSuccess, code, body) contract so it composes with and/or middleware.
module.exports = (req, res, next) => {
    try {
        // Prefer the httpOnly cookie; the Authorization header remains supported
        // for API clients and tooling.
        let token = (req.cookies && req.cookies.token) || req.headers.authorization;
        if (!token) {
            return next(false, 401, { success: false, message: MESSAGES.AUTH_FAILED });
        }
        if (token.startsWith('Bearer ')) {
            token = token.slice(7).trim();
        }
        const decoded = jwt.verify(token, TOKEN_SECRET);
        if (!decoded) {
            return next(false, 401, { success: false, message: MESSAGES.AUTH_FAILED });
        }
        req.userId = decoded.userId;
        req.role = decoded.role;
        req.email = decoded.email;
        req.name = decoded.name;
        return next(true);
    } catch (error) {
        return next(false, 401, { success: false, message: MESSAGES.AUTH_FAILED });
    }
};

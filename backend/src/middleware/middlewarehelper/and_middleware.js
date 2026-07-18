const { fetchResponseForNextFailure, fetchResponseForNextTrue } = require('./middlewareutils');

// Proceeds only if EVERY middleware in the list succeeds (calls next(true)).
// Each wrapped middleware uses the custom next(isMiddlewareSuccess, code, body) contract.
exports.andMiddleware = (middlewares) => {
    return async (req, res, next) => {
        let middlewareIndex = 0;
        let allowed = false;
        let failResponseCode = 403;
        let failureReason = { success: false, message: 'Access denied.' };

        const runNextMiddleware = async () => {
            if (middlewareIndex < middlewares.length) {
                const currentMiddleware = middlewares[middlewareIndex];
                middlewareIndex++;
                await currentMiddleware(req, res, (isMiddlewareSuccess, localFailCode, localFailReason) => {
                    if (isMiddlewareSuccess) {
                        allowed = true;
                    } else if (!isMiddlewareSuccess && localFailCode && localFailReason) {
                        allowed = false;
                        failResponseCode = localFailCode;
                        failureReason = localFailReason;
                    }
                });
                if (allowed) {
                    await runNextMiddleware();
                } else {
                    fetchResponseForNextFailure(next, res, failResponseCode, failureReason);
                }
            } else {
                fetchResponseForNextTrue(next);
            }
        };

        await runNextMiddleware();
    };
};

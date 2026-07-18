const { fetchResponseForNextFailure, fetchResponseForNextTrue } = require('./middlewareutils');

// Proceeds if ANY middleware in the list succeeds (calls next(true)).
exports.orMiddleware = (middlewares) => {
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
                if (!allowed) {
                    await runNextMiddleware();
                } else {
                    fetchResponseForNextTrue(next);
                }
            } else if (allowed) {
                fetchResponseForNextTrue(next);
            } else {
                fetchResponseForNextFailure(next, res, failResponseCode, failureReason);
            }
        };

        await runNextMiddleware();
    };
};

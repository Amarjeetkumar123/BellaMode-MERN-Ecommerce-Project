const logger = require('../../config/logger');

// Detects whether `next` is our custom next(isSuccess, code, body) or the plain express next().
function checkIfNextIsCustomNext(next) {
    const match = next.toString().match(/\(([^)]*)\)/);
    const parameterNames = (match && match[1] ? match[1].split(',') : []).map((p) => p.trim());
    return parameterNames.includes('isMiddlewareSuccess');
}

function fetchResponseForNextTrue(next) {
    if (checkIfNextIsCustomNext(next)) {
        next(true);
    } else {
        next();
    }
}

function fetchResponseForNextFailure(next, res, failResponseCode, failureReason) {
    try {
        if (checkIfNextIsCustomNext(next)) {
            next(false, failResponseCode, failureReason);
        } else {
            res.status(failResponseCode).json(
                typeof failureReason === 'string' ? { success: false, message: failureReason } : failureReason
            );
        }
    } catch (error) {
        logger.error(error.message, { stack: error.stack });
    }
}

module.exports = {
    checkIfNextIsCustomNext,
    fetchResponseForNextTrue,
    fetchResponseForNextFailure,
};

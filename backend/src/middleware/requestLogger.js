const logger = require('../config/logger');

// Logs one line per HTTP request with method, path, status and duration.
// info level for normal responses, warn for 4xx, error for 5xx.
module.exports = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        const line = `${req.method} ${req.originalUrl} ${res.statusCode} — ${ms}ms`;
        if (res.statusCode >= 500) logger.error(line);
        else if (res.statusCode >= 400) logger.warn(line);
        else logger.info(line);
    });
    next();
};

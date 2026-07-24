const logger = require('../config/logger');

// Centralized error handler — standard express (err, req, res, next) signature; mounted last.
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
    logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, { stack: err.stack });

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'Field';
        const label = field.charAt(0).toUpperCase() + field.slice(1);
        return res.status(409).json({ success: false, message: `${label} already exists.` });
    }
    // Mongoose validation
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((e) => e.message).join(', ');
        return res.status(400).json({ success: false, message });
    }
    // Bad ObjectId etc.
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Invalid ${err.path}.` });
    }

    const status = err.status || err.statusCode || 500;
    return res.status(status).json({
        success: false,
        message: err.message || 'Internal server error.',
    });
};

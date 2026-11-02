// Stateless shared helpers used across services/DAOs (pronnel commonUtils analog).
const mongoose = require('mongoose');

const { DEFAULT_PAGE_SIZE } = require('../constants/constants');

function toObjectId(id) {
    return new mongoose.Types.ObjectId(id);
}

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function isValidEmail(str) {
    return typeof str === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

// Builds a slug from a name; appends a short suffix for uniqueness when provided.
function slugify(str, suffix) {
    const base = String(str || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return suffix ? `${base}-${suffix}` : base;
}

// Translates ?page & ?limit query params into the paginationParams shape mongohelpers expects.
function buildPagination(query = {}) {
    const page_number = Math.max(parseInt(query.page, 10) || 1, 1);
    const page_size = Math.max(parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE, 1);
    return { page_number, page_size };
}

// Translates ?sort=field:asc|desc (or price_asc/newest etc.) into a mongo sort object.
function buildSort(query = {}) {
    const sort = query.sort;
    switch (sort) {
        case 'price_asc':
            return { price: 1 };
        case 'price_desc':
            return { price: -1 };
        case 'oldest':
            return { create_date: 1 };
        case 'rating':
            return { rating: -1 };
        case 'stock_asc':
            return { stock: 1, create_date: -1 };
        case 'name_asc':
            return { name: 1 };
        case 'newest':
        default:
            return { create_date: -1 };
    }
}

function sendSuccess(res, status, message, data) {
    return res.status(status).json({ success: true, message, data });
}

function sendError(res, status, message) {
    return res.status(status).json({ success: false, message });
}

// Wraps an async express handler so thrown errors flow to the global error handler.
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    toObjectId,
    isValidObjectId,
    isValidEmail,
    slugify,
    buildPagination,
    buildSort,
    sendSuccess,
    sendError,
    asyncHandler,
};

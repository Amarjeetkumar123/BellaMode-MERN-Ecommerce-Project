// Central constants for the Wearly backend.
// Note: product taxonomy (categories/colors/sizes) is DATA and lives in the
// Category/Product collections — only fixed enums and config live here.

const TOKEN_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || '7d';

const ROLES = {
    SUPERADMIN: 'SUPERADMIN',
    ADMIN: 'ADMIN',
    USER: 'USER',
};

// Everyone who is allowed to manage the catalog / orders / cms.
const ADMIN_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN];

// The audiences a product/category can target (unisex store).
const AUDIENCES = ['men', 'women', 'kids', 'unisex'];

const ORDER_STATUS = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
};

const PAYMENT_METHOD = {
    COD: 'COD',
    RAZORPAY: 'RAZORPAY',
};

const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
};

const BANNER_POSITION = {
    HERO: 'hero',
    PROMO: 'promo',
    DEAL: 'deal',
};

const CURRENCY = 'INR';
const DEFAULT_PAGE_SIZE = 12;

// Commerce pricing config (server-side, so totals can't be tampered with client-side).
const TAX_RATE = 0.05;
const SHIPPING_FEE = 49;
const FREE_SHIPPING_THRESHOLD = 999;

const MESSAGES = {
    REGISTER_SUCCESS: 'User registered successfully.',
    LOGIN_SUCCESS: 'Logged in successfully.',
    LOGOUT_SUCCESS: 'Logged out successfully.',
    AUTH_FAILED: 'Authentication failed. Please log in again.',
    ACCESS_DENIED: 'Access denied. You do not have permission to perform this action.',
    USER_NOT_FOUND: 'User not found.',
    EMAIL_EXISTS: 'Email already exists.',
    USERNAME_EXISTS: 'Username already exists.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
};

module.exports = {
    TOKEN_SECRET,
    TOKEN_EXPIRY,
    ROLES,
    ADMIN_ROLES,
    AUDIENCES,
    ORDER_STATUS,
    PAYMENT_METHOD,
    PAYMENT_STATUS,
    BANNER_POSITION,
    CURRENCY,
    DEFAULT_PAGE_SIZE,
    TAX_RATE,
    SHIPPING_FEE,
    FREE_SHIPPING_THRESHOLD,
    MESSAGES,
};

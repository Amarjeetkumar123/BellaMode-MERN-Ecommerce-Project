const userDao = require('../dbhelper/userdao');
const generateToken = require('../middleware/generateToken');
const { asyncHandler, sendSuccess, sendError, buildPagination } = require('../utils/commonUtils');
const { MESSAGES, TOKEN_EXPIRY } = require('../constants/constants');

// The JWT is delivered as an httpOnly cookie so page scripts (and therefore any
// XSS) cannot read it. Cross-site deployments need COOKIE_SAMESITE=none +
// COOKIE_SECURE=true; same-origin dev works with the lax default.
const AUTH_COOKIE = 'token';
const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
});

// Shape a user document for API responses (never leak the password hash).
function toPublicUser(user) {
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        // The seller's own store id — the client uses it to address /api/stores/:storeId/… .
        store: user.store || null,
        profileImage: user.profileImage,
        bio: user.bio,
        profession: user.profession,
        phone: user.phone,
    };
}

exports.register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const existing = await userDao.findExistingUser(email, username);
    if (existing) {
        const message = existing.email === email ? MESSAGES.EMAIL_EXISTS : MESSAGES.USERNAME_EXISTS;
        return sendError(res, 409, message);
    }
    await userDao.saveUser({ username, email, password });
    return sendSuccess(res, 201, MESSAGES.REGISTER_SUCCESS);
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await userDao.getUserByEmail(email);
    if (!user) return sendError(res, 401, MESSAGES.INVALID_CREDENTIALS);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 401, MESSAGES.INVALID_CREDENTIALS);
    const token = generateToken(user);
    res.cookie(AUTH_COOKIE, token, cookieOptions());
    // `token` stays in the body for non-browser API clients; browsers use the cookie.
    return sendSuccess(res, 200, MESSAGES.LOGIN_SUCCESS, { token, user: toPublicUser(user) });
});

// Clears the httpOnly cookie; the JWT itself stays stateless.
exports.logout = asyncHandler(async (req, res) => {
    res.clearCookie(AUTH_COOKIE, { ...cookieOptions(), maxAge: undefined });
    return sendSuccess(res, 200, MESSAGES.LOGOUT_SUCCESS);
});

exports.getMe = asyncHandler(async (req, res) => {
    const user = await userDao.getUserById(req.userId);
    if (!user) return sendError(res, 404, MESSAGES.USER_NOT_FOUND);
    return sendSuccess(res, 200, 'OK', { user: toPublicUser(user) });
});

exports.editProfile = asyncHandler(async (req, res) => {
    const user = await userDao.updateUserById(req.userId, req.body);
    if (!user) return sendError(res, 404, MESSAGES.USER_NOT_FOUND);
    return sendSuccess(res, 200, 'Profile updated successfully.', { user: toPublicUser(user) });
});

exports.listUsers = asyncHandler(async (req, res) => {
    const pagination = buildPagination(req.query);
    const filter = {};
    if (req.query.search) filter.searchObj = { search_text: req.query.search };
    if (req.query.role) filter.roleArray = [req.query.role];
    const [users, total] = await Promise.all([
        userDao.getUsers(filter, ['_id', 'username', 'email', 'role', 'create_date'], { create_date: -1 }, pagination),
        userDao.getUsersCount(filter),
    ]);
    return sendSuccess(res, 200, 'OK', {
        users,
        total,
        totalPages: Math.ceil(total / pagination.page_size),
    });
});

exports.updateUserRole = asyncHandler(async (req, res) => {
    const user = await userDao.updateUserById(req.params.id, { role: req.body.role });
    if (!user) return sendError(res, 404, MESSAGES.USER_NOT_FOUND);
    return sendSuccess(res, 200, 'User role updated successfully.', { user: toPublicUser(user) });
});

exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await userDao.deleteUserById(req.params.id);
    if (!user) return sendError(res, 404, MESSAGES.USER_NOT_FOUND);
    return sendSuccess(res, 200, 'User deleted successfully.');
});

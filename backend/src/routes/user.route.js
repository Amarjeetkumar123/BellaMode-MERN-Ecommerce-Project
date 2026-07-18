const express = require('express');
const router = express.Router();

const userService = require('../service/userservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const {
    validateRegisterSchema,
    validateLoginSchema,
    validateEditProfileSchema,
    validateUpdateUserRoleSchema,
} = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

// ---- public ----
router.post('/register', andMiddleware([validateRegisterSchema]), userService.register);
router.post('/login', andMiddleware([validateLoginSchema]), userService.login);
router.post('/logout', userService.logout);

// ---- authenticated ----
router.get('/me', andMiddleware([checkAuth]), userService.getMe);
router.patch('/edit-profile', andMiddleware([checkAuth, validateEditProfileSchema]), userService.editProfile);

// ---- superadmin only (user/admin management) ----
router.get('/users', andMiddleware([checkAuth, checkRole(ROLES.SUPERADMIN)]), userService.listUsers);
router.put(
    '/users/:id',
    andMiddleware([checkAuth, checkRole(ROLES.SUPERADMIN), validateUpdateUserRoleSchema]),
    userService.updateUserRole
);
router.delete('/users/:id', andMiddleware([checkAuth, checkRole(ROLES.SUPERADMIN)]), userService.deleteUser);

module.exports = router;

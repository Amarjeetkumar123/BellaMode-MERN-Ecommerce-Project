const express = require('express');
const router = express.Router();

const categoryService = require('../service/categoryservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateCategorySchema, validateUpdateCategorySchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const adminGuard = () => andMiddleware([checkAuth, checkRole(ROLES.SUPERADMIN, ROLES.ADMIN)]);

// ---- public ----
router.get('/', categoryService.listCategories);
router.get('/:slug', categoryService.getCategory);

// ---- admin ----
router.post('/', andMiddleware([checkAuth, checkRole(ROLES.SUPERADMIN, ROLES.ADMIN), validateCreateCategorySchema]), categoryService.createCategory);
router.patch('/:id', andMiddleware([checkAuth, checkRole(ROLES.SUPERADMIN, ROLES.ADMIN), validateUpdateCategorySchema]), categoryService.updateCategory);
router.delete('/:id', adminGuard(), categoryService.deleteCategory);

module.exports = router;

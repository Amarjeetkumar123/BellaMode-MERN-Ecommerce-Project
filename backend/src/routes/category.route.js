const express = require('express');
const router = express.Router();

const categoryService = require('../service/categoryservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const resolveStore = require('../middleware/resolveStore');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateCategorySchema, validateUpdateCategorySchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const STORE_MGR = [ROLES.SUPERADMIN, ROLES.SELLER];
const sellerGuard = (...extra) => andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore, ...extra]);

// ---- seller dashboard (store-scoped) ---- must precede public /:slug
router.get('/mine', sellerGuard(), categoryService.listMyCategories);

// ---- public / marketplace ----
router.get('/', categoryService.listCategories);
router.get('/:slug', categoryService.getCategory);

// ---- seller writes (store-scoped) ----
router.post('/', sellerGuard(validateCreateCategorySchema), categoryService.createCategory);
router.patch('/:id', sellerGuard(validateUpdateCategorySchema), categoryService.updateCategory);
router.delete('/:id', sellerGuard(), categoryService.deleteCategory);

module.exports = router;

const express = require('express');
const router = express.Router();

const productService = require('../service/productservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const resolveStore = require('../middleware/resolveStore');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateProductSchema, validateUpdateProductSchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const STORE_MGR = [ROLES.SUPERADMIN, ROLES.SELLER];

// ---- seller dashboard (store-scoped) ---- must precede the public /:idOrSlug
router.get('/mine', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore]), productService.listMyProducts);

// ---- public / marketplace ---- (/filters before /:idOrSlug so it isn't a param)
router.get('/', productService.listProducts);
router.get('/filters', productService.getFilters);
router.get('/:idOrSlug', productService.getProduct);

// ---- seller writes (store-scoped) ----
router.post('/', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore, validateCreateProductSchema]), productService.createProduct);
router.patch('/:id', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore, validateUpdateProductSchema]), productService.updateProduct);
router.delete('/:id', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore]), productService.deleteProduct);

module.exports = router;

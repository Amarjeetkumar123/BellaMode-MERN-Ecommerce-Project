const express = require('express');
const router = express.Router();

const productService = require('../service/productservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateProductSchema, validateUpdateProductSchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const ADMIN = [ROLES.SUPERADMIN, ROLES.ADMIN];

// ---- public ---- (/filters must precede /:idOrSlug so it isn't captured as a param)
router.get('/', productService.listProducts);
router.get('/filters', productService.getFilters);
router.get('/:idOrSlug', productService.getProduct);

// ---- admin ----
router.post('/', andMiddleware([checkAuth, checkRole(...ADMIN), validateCreateProductSchema]), productService.createProduct);
router.patch('/:id', andMiddleware([checkAuth, checkRole(...ADMIN), validateUpdateProductSchema]), productService.updateProduct);
router.delete('/:id', andMiddleware([checkAuth, checkRole(...ADMIN)]), productService.deleteProduct);

module.exports = router;

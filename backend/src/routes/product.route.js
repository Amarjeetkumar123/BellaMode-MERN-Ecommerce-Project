const express = require('express');
const router = express.Router();

const productService = require('../service/productservice');

// Public / marketplace reads only (global, across all stores).
// Seller writes + the seller's own catalogue live under /api/stores/:storeId/products.
// (/filters must precede /:idOrSlug so it isn't captured as a param.)
router.get('/', productService.listProducts);
router.get('/filters', productService.getFilters);
router.get('/:idOrSlug', productService.getProduct);

module.exports = router;

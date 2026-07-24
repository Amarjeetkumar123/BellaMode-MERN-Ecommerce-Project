const express = require('express');
const router = express.Router();

const categoryService = require('../service/categoryservice');

// Public / marketplace reads only (global, across all stores).
// Seller writes + the seller's own categories live under /api/stores/:storeId/categories.
router.get('/', categoryService.listCategories);
router.get('/:slug', categoryService.getCategory);

module.exports = router;

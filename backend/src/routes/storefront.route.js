const express = require('express');
const router = express.Router();

const storefrontService = require('../service/storefrontservice');

// Public per-seller storefront profile (approved stores only). The storefront's
// product grid reuses GET /api/products?store=<slug>.
// `/resolve` must precede `/:slug` so it isn't captured as a slug.
router.get('/resolve', storefrontService.resolveHost);
router.get('/:slug', storefrontService.getStorefront);

module.exports = router;

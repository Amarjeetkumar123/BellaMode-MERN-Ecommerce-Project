const express = require('express');
const router = express.Router();

const bannerService = require('../service/bannerservice');

// Public read only. Seller writes live under /api/stores/:storeId/banners.
router.get('/', bannerService.listBanners);

module.exports = router;

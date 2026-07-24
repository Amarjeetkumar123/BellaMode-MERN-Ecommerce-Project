const express = require('express');
const router = express.Router();

const blogService = require('../service/blogservice');

// Public reads only. Seller writes live under /api/stores/:storeId/blogs.
router.get('/', blogService.listBlogs);
router.get('/:slug', blogService.getBlog);

module.exports = router;

const express = require('express');
const router = express.Router();

const wishlistService = require('../service/wishlistservice');
const checkAuth = require('../middleware/checkAuth');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');

// All wishlist routes are per-user, so every one of them requires auth.
// No AJV schemas here — these carry no request body, only a :productId param.
router.get('/', andMiddleware([checkAuth]), wishlistService.getWishlist);
router.post('/:productId', andMiddleware([checkAuth]), wishlistService.addToWishlist);
router.delete('/:productId', andMiddleware([checkAuth]), wishlistService.removeFromWishlist);

module.exports = router;

const express = require('express');
const router = express.Router();

const reviewService = require('../service/reviewservice');
const checkAuth = require('../middleware/checkAuth');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateReviewSchema } = require('../jsonvalidation/jsonvalidator');

router.get('/product/:productId', reviewService.getReviewsByProduct);
router.post('/', andMiddleware([checkAuth, validateCreateReviewSchema]), reviewService.addReview);

module.exports = router;

const express = require('express');
const router = express.Router();

const paymentService = require('../service/paymentservice');
const checkAuth = require('../middleware/checkAuth');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreatePaymentOrderSchema, validateVerifyPaymentSchema } = require('../jsonvalidation/jsonvalidator');

router.post('/order', andMiddleware([checkAuth, validateCreatePaymentOrderSchema]), paymentService.createPaymentOrder);
router.post('/verify', andMiddleware([checkAuth, validateVerifyPaymentSchema]), paymentService.verifyPayment);

module.exports = router;

const express = require('express');
const router = express.Router();

const orderService = require('../service/orderservice');
const checkAuth = require('../middleware/checkAuth');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateOrderSchema } = require('../jsonvalidation/jsonvalidator');

// ---- authenticated customer ---- (a buyer's own orders; not store-scoped)
router.post('/', andMiddleware([checkAuth, validateCreateOrderSchema]), orderService.createOrder);
router.get('/myorders', andMiddleware([checkAuth]), orderService.getMyOrders);
// Buyer, the fulfilling seller, or superadmin (checked in the service).
router.get('/:id', andMiddleware([checkAuth]), orderService.getOrder);

// Seller-dashboard order views (list / stats / status) live under
// /api/stores/:storeId/orders — store-scoped by loadOwnedStore.

module.exports = router;

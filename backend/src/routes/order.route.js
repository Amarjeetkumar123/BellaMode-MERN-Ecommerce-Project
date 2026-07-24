const express = require('express');
const router = express.Router();

const orderService = require('../service/orderservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const resolveStore = require('../middleware/resolveStore');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateOrderSchema, validateUpdateOrderStatusSchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const STORE_MGR = [ROLES.SUPERADMIN, ROLES.SELLER];

// ---- authenticated customer ---- (no store scope: a buyer's own orders)
router.post('/', andMiddleware([checkAuth, validateCreateOrderSchema]), orderService.createOrder);
router.get('/myorders', andMiddleware([checkAuth]), orderService.getMyOrders);

// ---- seller dashboard (store-scoped via resolveStore) ----
// NOTE: /stats must stay above `/:id`, otherwise "stats" is parsed as an order id.
router.get('/stats', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore]), orderService.getOrderStats);
router.get('/', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore]), orderService.getAllOrders);
router.patch('/:id/status', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore, validateUpdateOrderStatusSchema]), orderService.updateOrderStatus);

// ---- owner or admin (checked in service) ----
router.get('/:id', andMiddleware([checkAuth]), orderService.getOrder);

module.exports = router;

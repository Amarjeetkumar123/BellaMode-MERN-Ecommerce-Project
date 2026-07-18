const express = require('express');
const router = express.Router();

const orderService = require('../service/orderservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateOrderSchema, validateUpdateOrderStatusSchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const ADMIN = [ROLES.SUPERADMIN, ROLES.ADMIN];

// ---- authenticated user ----
router.post('/', andMiddleware([checkAuth, validateCreateOrderSchema]), orderService.createOrder);
router.get('/myorders', andMiddleware([checkAuth]), orderService.getMyOrders);

// ---- admin ----
router.get('/', andMiddleware([checkAuth, checkRole(...ADMIN)]), orderService.getAllOrders);
router.patch('/:id/status', andMiddleware([checkAuth, checkRole(...ADMIN), validateUpdateOrderStatusSchema]), orderService.updateOrderStatus);

// ---- owner or admin (checked in service) ----
router.get('/:id', andMiddleware([checkAuth]), orderService.getOrder);

module.exports = router;

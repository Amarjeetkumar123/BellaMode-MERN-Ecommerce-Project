const express = require('express');
const router = express.Router();

const supportService = require('../service/supportservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateSupportSchema, validateUpdateSupportSchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const ADMIN = [ROLES.SUPERADMIN, ROLES.ADMIN];

router.post('/', andMiddleware([checkAuth, validateCreateSupportSchema]), supportService.createRequest);
router.get('/mine', andMiddleware([checkAuth]), supportService.getMyRequests);
router.get('/', andMiddleware([checkAuth, checkRole(...ADMIN)]), supportService.getRequests);
router.patch('/:id', andMiddleware([checkAuth, checkRole(...ADMIN), validateUpdateSupportSchema]), supportService.updateRequest);

module.exports = router;

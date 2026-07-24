const express = require('express');
const router = express.Router();

const settingService = require('../service/settingservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const resolveStore = require('../middleware/resolveStore');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateUpdateSettingSchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

router.get('/', settingService.getSettings);
router.patch(
    '/',
    andMiddleware([checkAuth, checkRole(ROLES.SUPERADMIN, ROLES.SELLER), resolveStore, validateUpdateSettingSchema]),
    settingService.updateSettings
);

module.exports = router;

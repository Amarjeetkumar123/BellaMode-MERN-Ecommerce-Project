const express = require('express');
const router = express.Router();

const bannerService = require('../service/bannerservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateBannerSchema, validateUpdateBannerSchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const ADMIN = [ROLES.SUPERADMIN, ROLES.ADMIN];

router.get('/', bannerService.listBanners);
router.post('/', andMiddleware([checkAuth, checkRole(...ADMIN), validateCreateBannerSchema]), bannerService.createBanner);
router.patch('/:id', andMiddleware([checkAuth, checkRole(...ADMIN), validateUpdateBannerSchema]), bannerService.updateBanner);
router.delete('/:id', andMiddleware([checkAuth, checkRole(...ADMIN)]), bannerService.deleteBanner);

module.exports = router;

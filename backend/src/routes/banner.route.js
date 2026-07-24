const express = require('express');
const router = express.Router();

const bannerService = require('../service/bannerservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const resolveStore = require('../middleware/resolveStore');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateBannerSchema, validateUpdateBannerSchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const STORE_MGR = [ROLES.SUPERADMIN, ROLES.SELLER];

router.get('/', bannerService.listBanners);
router.post('/', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore, validateCreateBannerSchema]), bannerService.createBanner);
router.patch('/:id', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore, validateUpdateBannerSchema]), bannerService.updateBanner);
router.delete('/:id', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore]), bannerService.deleteBanner);

module.exports = router;

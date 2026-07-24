const bannerDao = require('../dbhelper/bannerdao');
const { asyncHandler, sendSuccess, sendError } = require('../utils/commonUtils');

// GET /api/banners?position=hero — public, active banners.
exports.listBanners = asyncHandler(async (req, res) => {
    const filter = { isActive: true };
    if (req.query.position) filter.positionArray = [req.query.position];
    if (req.query.all === 'true') delete filter.isActive; // admin view
    const banners = await bannerDao.getBanners(filter);
    return sendSuccess(res, 200, 'OK', { banners });
});

exports.createBanner = asyncHandler(async (req, res) => {
    const banner = await bannerDao.saveBanner({ ...req.body, store: req.storeId });
    return sendSuccess(res, 201, 'Banner created successfully.', { banner });
});

exports.updateBanner = asyncHandler(async (req, res) => {
    const banner = await bannerDao.updateBannerById(req.params.id, req.body, req.storeId);
    if (!banner) return sendError(res, 404, 'Banner not found.');
    return sendSuccess(res, 200, 'Banner updated successfully.', { banner });
});

exports.deleteBanner = asyncHandler(async (req, res) => {
    const banner = await bannerDao.deleteBannerById(req.params.id, req.storeId);
    if (!banner) return sendError(res, 404, 'Banner not found.');
    return sendSuccess(res, 200, 'Banner deleted successfully.');
});

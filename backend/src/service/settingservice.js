const settingDao = require('../dbhelper/settingdao');
const { asyncHandler, sendSuccess } = require('../utils/commonUtils');

// GET /api/settings — public brand/site config.
exports.getSettings = asyncHandler(async (req, res) => {
    const settings = await settingDao.getSettings();
    return sendSuccess(res, 200, 'OK', { settings });
});

// PATCH /api/settings — admin update.
exports.updateSettings = asyncHandler(async (req, res) => {
    const settings = await settingDao.updateSettings(req.body);
    return sendSuccess(res, 200, 'Settings updated successfully.', { settings });
});

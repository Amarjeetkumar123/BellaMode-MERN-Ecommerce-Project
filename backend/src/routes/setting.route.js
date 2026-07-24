const express = require('express');
const router = express.Router();

const settingService = require('../service/settingservice');

// Public read only (default/marketplace store, or ?store=<slug|id>).
// A seller reads/writes their own settings under /api/stores/:storeId/settings.
router.get('/', settingService.getSettings);

module.exports = router;

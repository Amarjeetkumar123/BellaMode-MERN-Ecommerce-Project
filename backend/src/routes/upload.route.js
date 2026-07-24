const express = require('express');
const router = express.Router();

const uploadService = require('../service/uploadservice');
const upload = require('../middleware/upload');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateUploadByUrlSchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const STORE_MGR = [ROLES.SUPERADMIN, ROLES.SELLER];

// multipart file upload (multer parses the file before the service runs)
router.post('/', andMiddleware([checkAuth, checkRole(...STORE_MGR)]), upload.single('image'), uploadService.uploadFile);

// ingest a remote image by URL
router.post('/url', andMiddleware([checkAuth, checkRole(...STORE_MGR), validateUploadByUrlSchema]), uploadService.uploadByUrl);

module.exports = router;

const express = require('express');
const router = express.Router();

const uploadService = require('../service/uploadservice');
const upload = require('../middleware/upload');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateUploadByUrlSchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const ADMIN = [ROLES.SUPERADMIN, ROLES.ADMIN];

// multipart file upload (multer parses the file before the service runs)
router.post('/', andMiddleware([checkAuth, checkRole(...ADMIN)]), upload.single('image'), uploadService.uploadFile);

// ingest a remote image by URL
router.post('/url', andMiddleware([checkAuth, checkRole(...ADMIN), validateUploadByUrlSchema]), uploadService.uploadByUrl);

module.exports = router;

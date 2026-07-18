const express = require('express');
const router = express.Router();

const blogService = require('../service/blogservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateBlogSchema, validateUpdateBlogSchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const ADMIN = [ROLES.SUPERADMIN, ROLES.ADMIN];

router.get('/', blogService.listBlogs);
router.get('/:slug', blogService.getBlog);
router.post('/', andMiddleware([checkAuth, checkRole(...ADMIN), validateCreateBlogSchema]), blogService.createBlog);
router.patch('/:id', andMiddleware([checkAuth, checkRole(...ADMIN), validateUpdateBlogSchema]), blogService.updateBlog);
router.delete('/:id', andMiddleware([checkAuth, checkRole(...ADMIN)]), blogService.deleteBlog);

module.exports = router;

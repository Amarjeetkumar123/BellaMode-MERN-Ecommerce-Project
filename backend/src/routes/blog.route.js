const express = require('express');
const router = express.Router();

const blogService = require('../service/blogservice');
const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const resolveStore = require('../middleware/resolveStore');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateCreateBlogSchema, validateUpdateBlogSchema } = require('../jsonvalidation/jsonvalidator');
const { ROLES } = require('../constants/constants');

const STORE_MGR = [ROLES.SUPERADMIN, ROLES.SELLER];

router.get('/', blogService.listBlogs);
router.get('/:slug', blogService.getBlog);
router.post('/', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore, validateCreateBlogSchema]), blogService.createBlog);
router.patch('/:id', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore, validateUpdateBlogSchema]), blogService.updateBlog);
router.delete('/:id', andMiddleware([checkAuth, checkRole(...STORE_MGR), resolveStore]), blogService.deleteBlog);

module.exports = router;

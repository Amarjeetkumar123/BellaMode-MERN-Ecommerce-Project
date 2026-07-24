const express = require('express');

const router = express.Router();

const checkAuth = require('../middleware/checkAuth');
const checkRole = require('../middleware/checkRole');
const loadOwnedStore = require('../middleware/loadOwnedStore');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { ROLES } = require('../constants/constants');

const storeService = require('../service/storeservice');
const productService = require('../service/productservice');
const categoryService = require('../service/categoryservice');
const orderService = require('../service/orderservice');
const bannerService = require('../service/bannerservice');
const blogService = require('../service/blogservice');
const settingService = require('../service/settingservice');

const {
    validateCreateStoreSchema,
    validateUpdateStoreSchema,
    validateUpdateStoreStatusSchema,
    validateCreateProductSchema,
    validateUpdateProductSchema,
    validateCreateCategorySchema,
    validateUpdateCategorySchema,
    validateUpdateOrderStatusSchema,
    validateCreateBannerSchema,
    validateUpdateBannerSchema,
    validateCreateBlogSchema,
    validateUpdateBlogSchema,
    validateUpdateSettingSchema,
} = require('../jsonvalidation/jsonvalidator');

// ================= store CRUD =================
router.get('/', andMiddleware([checkAuth, checkRole(ROLES.SUPERADMIN)]), storeService.listStores);
router.post('/', andMiddleware([checkAuth, validateCreateStoreSchema]), storeService.createStore);
// Platform-admin only; no ownership guard (a superadmin acts on any store).
router.patch('/:storeId/status', andMiddleware([checkAuth, checkRole(ROLES.SUPERADMIN), validateUpdateStoreStatusSchema]), storeService.updateStoreStatus);
router.get('/:storeId', andMiddleware([checkAuth, loadOwnedStore]), storeService.getStore);
router.patch('/:storeId', andMiddleware([checkAuth, loadOwnedStore, validateUpdateStoreSchema]), storeService.updateStore);

// ================= nested seller resources =================
// Every sub-router is authorized once by loadOwnedStore at the mount point, which
// sets req.storeId. The reused service functions already scope by req.storeId.
const ownerGuard = () => andMiddleware([checkAuth, loadOwnedStore]);

// ---- products ----
const productRouter = express.Router({ mergeParams: true });
productRouter.get('/', productService.listMyProducts);
productRouter.post('/', andMiddleware([validateCreateProductSchema]), productService.createProduct);
productRouter.patch('/:id', andMiddleware([validateUpdateProductSchema]), productService.updateProduct);
productRouter.delete('/:id', productService.deleteProduct);
router.use('/:storeId/products', ownerGuard(), productRouter);

// ---- categories ----
const categoryRouter = express.Router({ mergeParams: true });
categoryRouter.get('/', categoryService.listMyCategories);
categoryRouter.post('/', andMiddleware([validateCreateCategorySchema]), categoryService.createCategory);
categoryRouter.patch('/:id', andMiddleware([validateUpdateCategorySchema]), categoryService.updateCategory);
categoryRouter.delete('/:id', categoryService.deleteCategory);
router.use('/:storeId/categories', ownerGuard(), categoryRouter);

// ---- orders (seller dashboard) ----
const orderRouter = express.Router({ mergeParams: true });
orderRouter.get('/stats', orderService.getOrderStats);
orderRouter.get('/', orderService.getAllOrders);
orderRouter.patch('/:id/status', andMiddleware([validateUpdateOrderStatusSchema]), orderService.updateOrderStatus);
router.use('/:storeId/orders', ownerGuard(), orderRouter);

// ---- banners ----
const bannerRouter = express.Router({ mergeParams: true });
bannerRouter.post('/', andMiddleware([validateCreateBannerSchema]), bannerService.createBanner);
bannerRouter.patch('/:id', andMiddleware([validateUpdateBannerSchema]), bannerService.updateBanner);
bannerRouter.delete('/:id', bannerService.deleteBanner);
router.use('/:storeId/banners', ownerGuard(), bannerRouter);

// ---- blogs ----
const blogRouter = express.Router({ mergeParams: true });
blogRouter.post('/', andMiddleware([validateCreateBlogSchema]), blogService.createBlog);
blogRouter.patch('/:id', andMiddleware([validateUpdateBlogSchema]), blogService.updateBlog);
blogRouter.delete('/:id', blogService.deleteBlog);
router.use('/:storeId/blogs', ownerGuard(), blogRouter);

// ---- settings ----
const settingRouter = express.Router({ mergeParams: true });
settingRouter.get('/', settingService.getStoreSettings);
settingRouter.patch('/', andMiddleware([validateUpdateSettingSchema]), settingService.updateSettings);
router.use('/:storeId/settings', ownerGuard(), settingRouter);

module.exports = router;

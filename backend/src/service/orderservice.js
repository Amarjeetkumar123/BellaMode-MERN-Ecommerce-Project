const orderDao = require('../dbhelper/orderdao');
const productDao = require('../dbhelper/productdao');
const { asyncHandler, sendSuccess, sendError, buildPagination } = require('../utils/commonUtils');
const {
    ROLES,
    ORDER_STATUS,
    PAYMENT_METHOD,
    PAYMENT_STATUS,
    TAX_RATE,
    SHIPPING_FEE,
    FREE_SHIPPING_THRESHOLD,
    CURRENCY,
} = require('../constants/constants');

function round2(n) {
    return Math.round(n * 100) / 100;
}

// Builds order line-items from DB products (never trusts client-sent prices) and computes totals.
async function buildOrderTotals(items) {
    const lineItems = [];
    let itemsPrice = 0;
    for (const item of items) {
        // eslint-disable-next-line no-await-in-loop
        const product = await productDao.getProductById(item.product);
        if (!product) {
            const err = new Error(`Product ${item.product} not found.`);
            err.status = 404;
            throw err;
        }
        if (product.stock < item.quantity) {
            const err = new Error(`Insufficient stock for "${product.name}".`);
            err.status = 400;
            throw err;
        }
        itemsPrice += product.price * item.quantity;
        lineItems.push({
            product: product._id,
            name: product.name,
            image: product.images && product.images[0],
            price: product.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
        });
    }
    const tax = round2(itemsPrice * TAX_RATE);
    const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const totalPrice = round2(itemsPrice + tax + shippingPrice);
    return { lineItems, itemsPrice: round2(itemsPrice), tax, shippingPrice, totalPrice };
}

// POST /api/orders
exports.createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;
    const { lineItems, itemsPrice, tax, shippingPrice, totalPrice } = await buildOrderTotals(items);

    const order = await orderDao.saveOrder({
        user: req.userId,
        items: lineItems,
        itemsPrice,
        tax,
        shippingPrice,
        totalPrice,
        currency: CURRENCY,
        shippingAddress,
        paymentMethod,
        paymentStatus: PAYMENT_STATUS.PENDING,
        status: ORDER_STATUS.PENDING,
    });

    // Decrement stock now that the order is placed.
    for (const li of lineItems) {
        // eslint-disable-next-line no-await-in-loop
        const p = await productDao.getProductById(li.product);
        // eslint-disable-next-line no-await-in-loop
        await productDao.updateProductById(li.product, { stock: Math.max(0, p.stock - li.quantity) });
    }

    const needsPayment = paymentMethod === PAYMENT_METHOD.RAZORPAY;
    return sendSuccess(res, 201, 'Order placed successfully.', { order, needsPayment });
});

// GET /api/orders/myorders
exports.getMyOrders = asyncHandler(async (req, res) => {
    const orders = await orderDao.getOrders({ userArray: [req.userId] }, undefined, { create_date: -1 });
    return sendSuccess(res, 200, 'OK', { orders });
});

// GET /api/orders  (admin)
exports.getAllOrders = asyncHandler(async (req, res) => {
    const pagination = buildPagination(req.query);
    const filter = {};
    if (req.query.status) filter.statusArray = [req.query.status];
    const [orders, total] = await Promise.all([
        orderDao.getOrders(filter, undefined, { create_date: -1 }, pagination, { path: 'user', select: 'username email' }),
        orderDao.getOrdersCount(filter),
    ]);
    return sendSuccess(res, 200, 'OK', { orders, total, totalPages: Math.ceil(total / pagination.page_size) });
});

// GET /api/orders/:id  (owner or admin)
exports.getOrder = asyncHandler(async (req, res) => {
    const order = await orderDao.getOrderById(req.params.id);
    if (!order) return sendError(res, 404, 'Order not found.');
    const isOwner = String(order.user._id || order.user) === String(req.userId);
    const isAdmin = [ROLES.SUPERADMIN, ROLES.ADMIN].includes(req.role);
    if (!isOwner && !isAdmin) return sendError(res, 403, 'Access denied.');
    return sendSuccess(res, 200, 'OK', { order });
});

// PATCH /api/orders/:id/status  (admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await orderDao.updateOrderById(req.params.id, { status: req.body.status });
    if (!order) return sendError(res, 404, 'Order not found.');
    return sendSuccess(res, 200, 'Order status updated.', { order });
});

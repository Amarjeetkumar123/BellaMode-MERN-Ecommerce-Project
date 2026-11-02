const orderDao = require('../dbhelper/orderdao');
const productDao = require('../dbhelper/productdao');
const Support = require('../models/support.model');
const User = require('../models/user.model');
const { getRazorpayInstance } = require('../config/razorpay');
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
    SUPPORT_TOPIC,
} = require('../constants/constants');

// Customers can cancel until the order is shipped.
const CANCELLABLE = [ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING];

// Puts a cancelled order's items back in stock.
async function restoreStock(order) {
    for (const it of order.items) {
        // eslint-disable-next-line no-await-in-loop
        const p = await productDao.getProductById(it.product);
        // eslint-disable-next-line no-await-in-loop
        if (p) await productDao.updateProductById(it.product, { stock: p.stock + it.quantity });
    }
}

// Refunds an online payment in full through Razorpay. Returns the updated order, or null
// when it couldn't be refunded automatically (an admin then refunds it by hand).
async function refundOnline(order) {
    const rzp = getRazorpayInstance();
    if (!rzp || !order.razorpay?.paymentId) return null;
    try {
        await rzp.payments.refund(order.razorpay.paymentId, { amount: Math.round(order.totalPrice * 100) });
        return orderDao.updateOrderById(order._id, { paymentStatus: PAYMENT_STATUS.REFUNDED });
    } catch (err) {
        console.error('Razorpay refund failed for order', String(order._id), err?.error?.description || err.message);
        return null;
    }
}

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

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// payment filter → method + status
const PAYMENT_FILTER = {
    cod: { paymentMethodArray: [PAYMENT_METHOD.COD] },
    paid: { paymentMethodArray: [PAYMENT_METHOD.RAZORPAY], paymentStatusArray: [PAYMENT_STATUS.PAID] },
    unpaid: { paymentMethodArray: [PAYMENT_METHOD.RAZORPAY], paymentStatusArray: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.FAILED] },
    refunded: { paymentStatusArray: [PAYMENT_STATUS.REFUNDED] },
};
const ORDER_SORT = { oldest: { create_date: 1 }, total_desc: { totalPrice: -1 }, total_asc: { totalPrice: 1 } };

// GET /api/orders  (admin) ?status=&payment=cod|paid|unpaid|refunded&days=&search=&sort=newest|oldest|total_desc|total_asc
exports.getAllOrders = asyncHandler(async (req, res) => {
    const { status, payment, days, search, sort } = req.query;
    const pagination = buildPagination(req.query);
    const filter = { ...PAYMENT_FILTER[payment] };
    if (Object.values(ORDER_STATUS).includes(status)) filter.statusArray = [status];
    const d = parseInt(days, 10);
    if (d > 0) filter.sinceMs = Date.now() - d * 86400000;
    const q = String(search || '').trim().replace(/^#/, '').slice(0, 60);
    if (q) {
        const rx = new RegExp(escapeRegex(q), 'i');
        const users = await User.find({ $or: [{ username: rx }, { email: rx }] }, '_id').limit(200).lean();
        filter.search = { userIds: users.map((u) => u._id), ...(/^[0-9a-f]+$/i.test(q) && { idPart: q.toLowerCase() }) };
    }
    const [orders, total, statusCounts] = await Promise.all([
        orderDao.getOrders(filter, undefined, ORDER_SORT[sort] || { create_date: -1 }, pagination, { path: 'user', select: 'username email' }),
        orderDao.getOrdersCount(filter),
        orderDao.countByStatus(filter),
    ]);
    return sendSuccess(res, 200, 'OK', { orders, total, statusCounts, totalPages: Math.ceil(total / pagination.page_size) });
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

// PATCH /api/orders/:id/cancel  (owner) — only before it ships
exports.cancelMyOrder = asyncHandler(async (req, res) => {
    let order = await orderDao.updateOrderWhere(
        { _id: req.params.id, user: req.userId, status: { $in: CANCELLABLE } },
        { status: ORDER_STATUS.CANCELLED, cancelReason: (req.body.reason || '').trim() }
    );
    if (!order) {
        const existing = await orderDao.getOrderById(req.params.id);
        if (!existing || String(existing.user._id || existing.user) !== String(req.userId)) return sendError(res, 404, 'Order not found.');
        if (existing.status === ORDER_STATUS.CANCELLED) return sendError(res, 409, 'This order is already cancelled.');
        return sendError(res, 409, 'This order has already shipped, so it can’t be cancelled. Ask for help with it instead.');
    }
    await restoreStock(order);

    let refund = 'none';
    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
        const refunded = await refundOnline(order);
        if (refunded) { order = refunded; refund = 'done'; }
        else {
            // couldn't refund automatically: open a refund request so an admin sees it
            refund = 'pending';
            await Support.create({
                user: req.userId, order: order._id, topic: SUPPORT_TOPIC.REFUND,
                message: `Order cancelled by the customer${order.cancelReason ? ` (${order.cancelReason})` : ''}. It was paid online, so ₹${order.totalPrice} needs refunding.`,
            });
        }
    }
    return sendSuccess(res, 200, 'Order cancelled.', { order, refund });
});

// PATCH /api/orders/:id/status  (admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
    const before = await orderDao.getOrderById(req.params.id);
    if (!before) return sendError(res, 404, 'Order not found.');
    const order = await orderDao.updateOrderById(req.params.id, { status: req.body.status });
    // cancelling puts the items back on the shelf
    // ponytail: un-cancelling doesn't take them back out; set stock by hand if that ever happens
    if (req.body.status === ORDER_STATUS.CANCELLED && before.status !== ORDER_STATUS.CANCELLED) await restoreStock(order);
    return sendSuccess(res, 200, 'Order status updated.', { order });
});

// GET /api/orders/stats?days=30 — admin analytics, aggregated server-side so
// totals stay correct no matter how many orders exist.
exports.getOrderStats = asyncHandler(async (req, res) => {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
    const since = Date.now() - days * 86400000;
    const stats = await orderDao.getOrderStats(since);
    return sendSuccess(res, 200, 'OK', { ...stats, days });
});

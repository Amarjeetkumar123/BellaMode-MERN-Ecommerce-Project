const Support = require('../models/support.model');
const orderDao = require('../dbhelper/orderdao');
const { asyncHandler, sendSuccess, sendError, buildPagination } = require('../utils/commonUtils');
const { SUPPORT_STATUS } = require('../constants/constants');

// POST /api/support — a customer asks for help with one of their own orders
exports.createRequest = asyncHandler(async (req, res) => {
    const order = await orderDao.getOrderById(req.body.orderId);
    if (!order || String(order.user._id || order.user) !== String(req.userId)) return sendError(res, 404, 'Order not found.');
    // ponytail: no per-user rate limit; add one if requests get spammed
    const open = await Support.countDocuments({ order: order._id, status: SUPPORT_STATUS.OPEN });
    if (open >= 3) return sendError(res, 429, 'You already have open requests for this order. We’ll reply to those first.');
    const request = await Support.create({ user: req.userId, order: order._id, topic: req.body.topic, message: req.body.message.trim() });
    return sendSuccess(res, 201, 'Request sent.', { request });
});

// GET /api/support/mine — the customer's own requests, newest first
exports.getMyRequests = asyncHandler(async (req, res) => {
    const requests = await Support.find({ user: req.userId }).sort({ create_date: -1 }).lean();
    return sendSuccess(res, 200, 'OK', { requests });
});

// GET /api/support?status=OPEN — admin list
exports.getRequests = asyncHandler(async (req, res) => {
    const pagination = buildPagination(req.query);
    const filter = Object.values(SUPPORT_STATUS).includes(req.query.status) ? { status: req.query.status } : {};
    const [requests, total, openCount] = await Promise.all([
        Support.find(filter).sort({ create_date: -1 }).skip((pagination.page_number - 1) * pagination.page_size).limit(pagination.page_size)
            .populate('user', 'username email').populate('order', 'totalPrice status paymentMethod paymentStatus create_date cancelReason').lean(),
        Support.countDocuments(filter),
        Support.countDocuments({ status: SUPPORT_STATUS.OPEN }),
    ]);
    return sendSuccess(res, 200, 'OK', { requests, total, openCount, totalPages: Math.ceil(total / pagination.page_size) });
});

// PATCH /api/support/:id — admin replies and/or marks it resolved
exports.updateRequest = asyncHandler(async (req, res) => {
    const data = { update_date: Date.now() };
    if (req.body.status) data.status = req.body.status;
    if (req.body.reply !== undefined) data.reply = req.body.reply.trim();
    const request = await Support.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
    if (!request) return sendError(res, 404, 'Request not found.');
    return sendSuccess(res, 200, 'Request updated.', { request });
});

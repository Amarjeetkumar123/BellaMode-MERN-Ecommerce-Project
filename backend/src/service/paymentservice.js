const crypto = require('crypto');
const orderDao = require('../dbhelper/orderdao');
const { getRazorpayInstance, isRazorpayConfigured } = require('../config/razorpay');
const { asyncHandler, sendSuccess, sendError } = require('../utils/commonUtils');
const { PAYMENT_METHOD, PAYMENT_STATUS, ORDER_STATUS, CURRENCY } = require('../constants/constants');

// POST /api/payments/order — creates a Razorpay order for one of our RAZORPAY orders.
exports.createPaymentOrder = asyncHandler(async (req, res) => {
    if (!isRazorpayConfigured()) {
        return sendError(res, 503, 'Payments are not configured. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.');
    }
    const order = await orderDao.getOrderById(req.body.orderId);
    if (!order) return sendError(res, 404, 'Order not found.');
    if (String(order.user._id || order.user) !== String(req.userId)) {
        return sendError(res, 403, 'Access denied.');
    }
    if (order.paymentMethod !== PAYMENT_METHOD.RAZORPAY) {
        return sendError(res, 400, 'This order is not a Razorpay order.');
    }

    const razorpay = getRazorpayInstance();
    const rpOrder = await razorpay.orders.create({
        amount: Math.round(order.totalPrice * 100), // paise
        currency: CURRENCY,
        receipt: String(order._id),
    });

    await orderDao.updateOrderById(order._id, { razorpay: { orderId: rpOrder.id } });

    return sendSuccess(res, 201, 'Payment order created.', {
        razorpayOrderId: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order._id,
    });
});

// POST /api/payments/verify — verifies the Razorpay signature and marks the order paid.
exports.verifyPayment = asyncHandler(async (req, res) => {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await orderDao.getOrderById(orderId);
    if (!order) return sendError(res, 404, 'Order not found.');
    if (String(order.user._id || order.user) !== String(req.userId)) {
        return sendError(res, 403, 'Access denied.');
    }

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        await orderDao.updateOrderById(orderId, { paymentStatus: PAYMENT_STATUS.FAILED });
        return sendError(res, 400, 'Payment verification failed.');
    }

    const updated = await orderDao.updateOrderById(orderId, {
        paymentStatus: PAYMENT_STATUS.PAID,
        status: ORDER_STATUS.PROCESSING,
        razorpay: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
        },
    });

    return sendSuccess(res, 200, 'Payment verified successfully.', { order: updated });
});

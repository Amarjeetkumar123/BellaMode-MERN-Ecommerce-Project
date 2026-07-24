const crypto = require('crypto');
const orderDao = require('../dbhelper/orderdao');
const payoutDao = require('../dbhelper/payoutdao');
const { getRazorpayInstance, isRazorpayConfigured } = require('../config/razorpay');
const { asyncHandler, sendSuccess, sendError } = require('../utils/commonUtils');
const { PAYMENT_METHOD, PAYMENT_STATUS, ORDER_STATUS, CURRENCY } = require('../constants/constants');

// Loads every order in a checkout group and verifies the caller owns them and they
// are payable via Razorpay. Returns the orders or throws a tagged error.
async function loadPayableGroup(paymentGroup, userId) {
    const orders = await orderDao.getOrdersByPaymentGroup(paymentGroup);
    if (!orders.length) {
        const err = new Error('Order not found.'); err.status = 404; throw err;
    }
    for (const o of orders) {
        if (String(o.user._id || o.user) !== String(userId)) {
            const err = new Error('Access denied.'); err.status = 403; throw err;
        }
        if (o.paymentMethod !== PAYMENT_METHOD.RAZORPAY) {
            const err = new Error('This order is not a Razorpay order.'); err.status = 400; throw err;
        }
    }
    return orders;
}

// Builds Route transfer instructions — one per order whose store has a linked
// account. Orders from not-yet-linked stores are simply omitted; their share stays
// in the platform account (recorded as a "held" payout at verify time).
function buildTransfers(orders) {
    const transfers = [];
    for (const o of orders) {
        const account = o.store && o.store.razorpayAccountId;
        if (!account) continue;
        transfers.push({
            account,
            amount: Math.round(o.sellerAmount * 100),
            currency: o.currency || CURRENCY,
            notes: { order: String(o._id), paymentGroup: o.paymentGroup },
            on_hold: false,
        });
    }
    return transfers;
}

// POST /api/payments/order — creates ONE Razorpay order covering an entire checkout
// group, with Route transfers splitting the money to each seller minus commission.
exports.createPaymentOrder = asyncHandler(async (req, res) => {
    if (!isRazorpayConfigured()) {
        return sendError(res, 503, 'Payments are not configured. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.');
    }
    const orders = await loadPayableGroup(req.body.paymentGroup, req.userId);
    const grandTotal = orders.reduce((s, o) => s + o.totalPrice, 0);
    const transfers = buildTransfers(orders);

    const razorpay = getRazorpayInstance();
    const rpOrder = await razorpay.orders.create({
        amount: Math.round(grandTotal * 100), // paise
        currency: CURRENCY,
        receipt: req.body.paymentGroup,
        ...(transfers.length ? { transfers } : {}),
    });

    await orderDao.updateOrdersByPaymentGroup(req.body.paymentGroup, { 'razorpay.orderId': rpOrder.id });

    return sendSuccess(res, 201, 'Payment order created.', {
        razorpayOrderId: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentGroup: req.body.paymentGroup,
    });
});

// Best-effort map of linked-account id -> Route transfer id, read back from Razorpay
// after capture so each payout row can reference its transfer. Never throws.
async function fetchTransferMap(razorpay, razorpayOrderId) {
    const map = {};
    try {
        const res = await razorpay.orders.fetchTransferOrder(razorpayOrderId);
        for (const t of (res.transfers || res.items || [])) {
            if (t.recipient) map[t.recipient] = t.id;
        }
    } catch (e) { /* transfers may be absent (no linked accounts) — leave map empty */ }
    return map;
}

// Records the per-seller split of a paid group as Payout rows (idempotent by order).
async function recordPayouts(orders, razorpayPaymentId, transferMap) {
    for (const o of orders) {
        const account = o.store && o.store.razorpayAccountId;
        const transferId = account ? transferMap[account] : undefined;
        const status = account ? (transferId ? 'routed' : 'held') : 'held';
        // eslint-disable-next-line no-await-in-loop
        await payoutDao.savePayout({
            store: o.store._id || o.store,
            order: o._id,
            paymentGroup: o.paymentGroup,
            amount: o.sellerAmount,
            commission: o.commissionAmount,
            currency: o.currency || CURRENCY,
            razorpayPaymentId,
            transferId,
            status,
        });
        if (transferId) {
            // eslint-disable-next-line no-await-in-loop
            await orderDao.updateOrderById(o._id, { 'razorpay.transferId': transferId });
        }
    }
}

// POST /api/payments/verify — verifies the group's signature, marks every sibling
// order paid, and writes the payout records for each seller's share.
exports.verifyPayment = asyncHandler(async (req, res) => {
    const { paymentGroup, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const orders = await loadPayableGroup(paymentGroup, req.userId);

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        await orderDao.updateOrdersByPaymentGroup(paymentGroup, { paymentStatus: PAYMENT_STATUS.FAILED });
        return sendError(res, 400, 'Payment verification failed.');
    }

    await orderDao.updateOrdersByPaymentGroup(paymentGroup, {
        paymentStatus: PAYMENT_STATUS.PAID,
        status: ORDER_STATUS.PROCESSING,
        'razorpay.orderId': razorpay_order_id,
        'razorpay.paymentId': razorpay_payment_id,
        'razorpay.signature': razorpay_signature,
    });

    const transferMap = await fetchTransferMap(getRazorpayInstance(), razorpay_order_id);
    await recordPayouts(orders, razorpay_payment_id, transferMap);

    const updated = await orderDao.getOrdersByPaymentGroup(paymentGroup);
    return sendSuccess(res, 200, 'Payment verified successfully.', { orders: updated, paymentGroup });
});

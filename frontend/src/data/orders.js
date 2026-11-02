// Order status → what the customer sees. Statuses come from the backend (ORDER_STATUS).
export const ORDER_STEPS = ['Placed', 'Packed', 'Shipped', 'Delivered'];
export const ORDER_STEP = { PENDING: 1, PROCESSING: 2, SHIPPED: 3, DELIVERED: 4, CANCELLED: 0 };
export const ORDER_LABEL = { PENDING: 'Order placed', PROCESSING: 'Being packed', SHIPPED: 'On the way', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };
export const orderTone = (s) => (s === 'DELIVERED' ? 'done' : s === 'CANCELLED' ? 'cancel' : 'way');
export const isOpenOrder = (o) => orderTone(o.status) === 'way';
export const orderNo = (o) => o._id.slice(-8).toUpperCase();

const DAY = 864e5;
export const fmtDate = (ms, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => new Date(ms).toLocaleDateString('en-IN', opts);
// Matches the shipping page promise: 3–6 days from the order.
export const etaRange = (ms) => {
    const d = (n) => fmtDate(ms + n * DAY, { weekday: 'short', day: 'numeric', month: 'short' });
    return `${d(3)} – ${d(6)}`;
};
export const PAYMENT_LABEL = { COD: 'Cash on delivery', RAZORPAY: 'Paid online' };
// Customers can cancel until it ships (matches the backend).
export const canCancel = (o) => ['PENDING', 'PROCESSING'].includes(o.status);
export const HELP_TOPIC = { REFUND: 'Refund', RETURN: 'Return or exchange', DAMAGED: 'Damaged item', WRONG_ITEM: 'Wrong item', DELIVERY: 'Delivery', PAYMENT: 'Payment', OTHER: 'Something else' };

const { Schema, model } = require('mongoose');
const { withMsTimestamps } = require('./modelHelpers');
const { tenantPlugin } = require('../context/storeContext');
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, CURRENCY } = require('../constants/constants');

const orderItemSchema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        image: String,
        price: Number,
        quantity: { type: Number, required: true, min: 1 },
        size: String,
        color: String,
    },
    { _id: false }
);

const shippingAddressSchema = new Schema(
    {
        fullName: String,
        phone: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: { type: String, default: 'India' },
    },
    { _id: false }
);

const orderSchema = new Schema({
    // The store this order is fulfilled by. One order = one store; a cart spanning
    // sellers is split into sibling per-store orders sharing one paymentGroup.
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Groups the sibling orders created by a single multi-seller checkout, so one
    // Razorpay payment (with Route transfers) settles all of them at once.
    paymentGroup: { type: String, index: true },
    // Split economics for this order: the platform's cut and the seller's net,
    // computed from itemsPrice × store.commissionRate at checkout.
    commissionAmount: { type: Number, default: 0 },
    sellerAmount: { type: Number, default: 0 },
    items: { type: [orderItemSchema], required: true },
    itemsPrice: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    currency: { type: String, default: CURRENCY },
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
        type: String,
        enum: [PAYMENT_METHOD.COD, PAYMENT_METHOD.RAZORPAY],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PAID, PAYMENT_STATUS.FAILED],
        default: PAYMENT_STATUS.PENDING,
    },
    razorpay: {
        orderId: String,
        paymentId: String,
        signature: String,
        // Route transfer id (trf_…) crediting this order's seller share.
        transferId: String,
    },
    status: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.PENDING,
    },
});

withMsTimestamps(orderSchema);
orderSchema.index({ user: 1, create_date: -1 });
orderSchema.index({ store: 1, create_date: -1 });
orderSchema.plugin(tenantPlugin);

const Order = model('Order', orderSchema);
module.exports = Order;

const { Schema, model } = require('mongoose');
const { withMsTimestamps } = require('./modelHelpers');
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
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING,
    },
    razorpay: {
        orderId: String,
        paymentId: String,
        signature: String,
    },
    status: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.PENDING,
    },
    // set when the customer cancels it themselves
    cancelReason: String,
});

withMsTimestamps(orderSchema);
orderSchema.index({ user: 1, create_date: -1 });

const Order = model('Order', orderSchema);
module.exports = Order;

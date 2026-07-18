const def = require('./schemaDefinitions');

// Create a Razorpay order for one of our existing orders.
exports.createPaymentOrderSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['orderId'],
    properties: {
        orderId: def.objectId,
    },
};

// Verify a Razorpay payment callback signature.
exports.verifyPaymentSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['orderId', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
    properties: {
        orderId: def.objectId,
        razorpay_order_id: def.nonEmptyString,
        razorpay_payment_id: def.nonEmptyString,
        razorpay_signature: def.nonEmptyString,
    },
};

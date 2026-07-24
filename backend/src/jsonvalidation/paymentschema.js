const def = require('./schemaDefinitions');

// Create a Razorpay order for a whole checkout group (all sibling per-seller orders).
exports.createPaymentOrderSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['paymentGroup'],
    properties: {
        paymentGroup: def.nonEmptyString,
    },
};

// Verify a Razorpay payment callback signature for a checkout group.
exports.verifyPaymentSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['paymentGroup', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
    properties: {
        paymentGroup: def.nonEmptyString,
        razorpay_order_id: def.nonEmptyString,
        razorpay_payment_id: def.nonEmptyString,
        razorpay_signature: def.nonEmptyString,
    },
};

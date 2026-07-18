const def = require('./schemaDefinitions');
const { ORDER_STATUS, PAYMENT_METHOD } = require('../constants/constants');

const shippingAddress = {
    type: 'object',
    additionalProperties: false,
    required: ['fullName', 'phone', 'line1', 'city', 'state', 'postalCode'],
    properties: {
        fullName: def.nonEmptyString,
        phone: def.nonEmptyString,
        line1: def.nonEmptyString,
        line2: def.trimString,
        city: def.nonEmptyString,
        state: def.nonEmptyString,
        postalCode: def.nonEmptyString,
        country: def.trimString,
    },
};

const orderItem = {
    type: 'object',
    additionalProperties: false,
    required: ['product', 'quantity'],
    properties: {
        product: def.objectId,
        quantity: { type: 'integer', minimum: 1 },
        size: def.trimString,
        color: def.trimString,
    },
};

exports.createOrderSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['items', 'shippingAddress', 'paymentMethod'],
    properties: {
        items: { type: 'array', minItems: 1, items: orderItem },
        shippingAddress,
        paymentMethod: { enum: [PAYMENT_METHOD.COD, PAYMENT_METHOD.RAZORPAY] },
    },
};

exports.updateOrderStatusSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['status'],
    properties: {
        status: { enum: Object.values(ORDER_STATUS) },
    },
};

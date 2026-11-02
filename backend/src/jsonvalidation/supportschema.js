const { SUPPORT_TOPIC, SUPPORT_STATUS } = require('../constants/constants');

exports.createSupportSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['orderId', 'topic', 'message'],
    properties: {
        orderId: { type: 'string', pattern: '^[a-f0-9]{24}$' },
        topic: { enum: Object.values(SUPPORT_TOPIC) },
        message: { type: 'string', minLength: 10, maxLength: 1000 },
    },
};

exports.updateSupportSchema = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
        status: { enum: Object.values(SUPPORT_STATUS) },
        reply: { type: 'string', maxLength: 1000 },
    },
};

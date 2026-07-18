const def = require('./schemaDefinitions');

exports.createReviewSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['productId', 'rating'],
    properties: {
        productId: def.objectId,
        rating: { type: 'integer', minimum: 1, maximum: 5 },
        comment: { type: 'string', maxLength: 1000 },
    },
};

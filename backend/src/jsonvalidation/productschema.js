const def = require('./schemaDefinitions');
const { AUDIENCES } = require('../constants/constants');

exports.createProductSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'price', 'audience', 'category'],
    properties: {
        name: { type: 'string', minLength: 1, maxLength: 120 },
        description: def.trimString,
        price: def.positiveNumber,
        oldPrice: def.positiveNumber,
        images: def.stringArray,
        audience: { enum: AUDIENCES },
        category: def.objectId,
        brand: def.trimString,
        colors: def.stringArray,
        sizes: def.stringArray,
        stock: { type: 'integer', minimum: 0 },
        isTrending: def.boolean,
        isFeatured: def.boolean,
        isActive: def.boolean,
    },
};

exports.updateProductSchema = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
        name: { type: 'string', minLength: 1, maxLength: 120 },
        description: def.trimString,
        price: def.positiveNumber,
        oldPrice: def.positiveNumber,
        images: def.stringArray,
        audience: { enum: AUDIENCES },
        category: def.objectId,
        brand: def.trimString,
        colors: def.stringArray,
        sizes: def.stringArray,
        stock: { type: 'integer', minimum: 0 },
        isTrending: def.boolean,
        isFeatured: def.boolean,
        isActive: def.boolean,
    },
};

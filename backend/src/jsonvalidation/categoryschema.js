const def = require('./schemaDefinitions');
const { AUDIENCES } = require('../constants/constants');

exports.createCategorySchema = {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'audience'],
    properties: {
        name: { type: 'string', minLength: 1, maxLength: 60 },
        audience: { enum: AUDIENCES },
        image: def.trimString,
        parent: { anyOf: [def.objectId, { type: 'null' }] },
        isActive: def.boolean,
        sortOrder: { type: 'number' },
    },
};

exports.updateCategorySchema = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
        name: { type: 'string', minLength: 1, maxLength: 60 },
        audience: { enum: AUDIENCES },
        image: def.trimString,
        parent: { anyOf: [def.objectId, { type: 'null' }] },
        isActive: def.boolean,
        sortOrder: { type: 'number' },
    },
};

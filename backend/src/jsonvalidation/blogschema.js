const def = require('./schemaDefinitions');

exports.createBlogSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['title'],
    properties: {
        title: { type: 'string', minLength: 1, maxLength: 160 },
        subtitle: { type: 'string', maxLength: 200 },
        content: def.trimString,
        image: def.trimString,
        tags: def.stringArray,
        isPublished: def.boolean,
    },
};

exports.updateBlogSchema = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
        title: { type: 'string', minLength: 1, maxLength: 160 },
        subtitle: { type: 'string', maxLength: 200 },
        content: def.trimString,
        image: def.trimString,
        tags: def.stringArray,
        isPublished: def.boolean,
    },
};

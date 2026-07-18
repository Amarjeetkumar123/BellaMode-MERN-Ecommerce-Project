const def = require('./schemaDefinitions');

// For ingesting a remote image by URL (the multipart file path has no JSON body to validate).
exports.uploadByUrlSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['imageUrl'],
    properties: {
        imageUrl: { type: 'string', minLength: 4 },
        folder: def.trimString,
    },
};

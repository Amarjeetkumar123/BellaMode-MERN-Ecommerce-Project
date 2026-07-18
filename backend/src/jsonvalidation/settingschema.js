const def = require('./schemaDefinitions');

exports.updateSettingSchema = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
        brandName: { type: 'string', minLength: 1, maxLength: 60 },
        logoUrl: def.trimString,
        heroTagline: { type: 'string', maxLength: 160 },
        currency: def.trimString,
        contactEmail: def.trimString,
        contactPhone: def.trimString,
        socialLinks: {
            type: 'object',
            additionalProperties: false,
            properties: {
                facebook: def.trimString,
                instagram: def.trimString,
                twitter: def.trimString,
                youtube: def.trimString,
            },
        },
    },
};

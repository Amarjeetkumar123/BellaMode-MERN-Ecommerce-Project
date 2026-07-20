const def = require('./schemaDefinitions');

exports.updateSettingSchema = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
        brandName: { type: 'string', minLength: 1, maxLength: 60 },
        logoUrl: def.trimString,
        heroTagline: { type: 'string', maxLength: 160 },
        activeAudiences: {
            type: 'array',
            items: { type: 'string', enum: ['women', 'men', 'girls', 'boys', 'kids'] },
            uniqueItems: true,
        },
        audienceHeroImages: {
            type: 'object',
            additionalProperties: false,
            properties: {
                women: def.trimString,
                men: def.trimString,
                girls: def.trimString,
                boys: def.trimString,
                kids: def.trimString,
            },
        },
        audienceImages: {
            type: 'object',
            additionalProperties: false,
            properties: {
                women: def.trimString,
                men: def.trimString,
                girls: def.trimString,
                boys: def.trimString,
                kids: def.trimString,
                footwear: def.trimString,
            },
        },
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

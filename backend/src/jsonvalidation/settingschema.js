const def = require('./schemaDefinitions');

const short = (n) => ({ type: 'string', maxLength: n });
const heroSlides = {
    type: 'array',
    maxItems: 5,
    items: {
        type: 'object',
        additionalProperties: false,
        required: ['image'],
        properties: {
            image: { type: 'string', minLength: 1, maxLength: 1000 },
            layout: { type: 'string', enum: ['right', 'wide', 'wide-right'] },
            kicker: short(40),
            title: short(60),
            script: short(24),
            text: short(200),
            cta: short(30),
            link: short(300),
            note: short(40),
        },
    },
};

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
            items: { type: 'string', enum: ['women', 'men', 'kids'] },
            uniqueItems: true,
        },
        audienceHeroImages: {
            type: 'object',
            additionalProperties: false,
            properties: {
                women: def.trimString,
                men: def.trimString,
                kids: def.trimString,
            },
        },
        audienceImages: {
            type: 'object',
            additionalProperties: false,
            properties: {
                women: def.trimString,
                men: def.trimString,
                kids: def.trimString,
                footwear: def.trimString,
            },
        },
        heroSlides: {
            type: 'object',
            additionalProperties: false,
            properties: { men: heroSlides, women: heroSlides, kids: heroSlides },
        },
        announcement: {
            type: 'object',
            additionalProperties: false,
            properties: {
                enabled: { type: 'boolean' },
                messages: {
                    type: 'array',
                    items: { type: 'string', maxLength: 160 },
                    maxItems: 6,
                },
                link: def.trimString,
                bgColor: def.trimString,
                textColor: def.trimString,
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

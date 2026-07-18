const def = require('./schemaDefinitions');
const { BANNER_POSITION } = require('../constants/constants');

const bannerProps = {
    title: def.trimString,
    subtitle: def.trimString,
    image: def.trimString,
    link: def.trimString,
    ctaText: def.trimString,
    position: { enum: Object.values(BANNER_POSITION) },
    isActive: def.boolean,
    sortOrder: { type: 'number' },
};

exports.createBannerSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['position'],
    properties: bannerProps,
};

exports.updateBannerSchema = {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: bannerProps,
};

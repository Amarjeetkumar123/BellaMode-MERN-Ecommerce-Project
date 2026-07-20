const { Schema, model } = require('mongoose');
const { withMsTimestamps } = require('./modelHelpers');
const { CURRENCY } = require('../constants/constants');

// Singleton brand/site settings — a single document powers dynamic branding.
const settingSchema = new Schema({
    key: { type: String, default: 'brand', unique: true },
    brandName: { type: String, default: 'Wearly' },
    logoUrl: { type: String, default: '' },
    heroTagline: { type: String, default: 'Style for everyone.' },
    // Which shopper audiences the storefront serves (run a Men-only / Women+Girls / … store).
    activeAudiences: { type: [String], default: ['women', 'men', 'kids', 'boys', 'girls'] },
    // Optional lifestyle images for the homepage "Shop by Category" tiles, keyed by audience.
    audienceImages: {
        women: { type: String, default: '' },
        men: { type: String, default: '' },
        girls: { type: String, default: '' },
        boys: { type: String, default: '' },
        kids: { type: String, default: '' },
        footwear: { type: String, default: '' },
    },
    // Optional per-audience editorial hero banner images (wide), keyed by audience.
    audienceHeroImages: {
        women: { type: String, default: '' },
        men: { type: String, default: '' },
        girls: { type: String, default: '' },
        boys: { type: String, default: '' },
        kids: { type: String, default: '' },
    },
    currency: { type: String, default: CURRENCY },
    contactEmail: String,
    contactPhone: String,
    socialLinks: {
        facebook: String,
        instagram: String,
        twitter: String,
        youtube: String,
    },
});

withMsTimestamps(settingSchema);

const Setting = model('Setting', settingSchema);
module.exports = Setting;

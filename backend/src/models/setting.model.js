const { Schema, model } = require('mongoose');
const { withMsTimestamps } = require('./modelHelpers');
const { CURRENCY } = require('../constants/constants');

// Singleton brand/site settings — a single document powers dynamic branding.
const settingSchema = new Schema({
    key: { type: String, default: 'brand', unique: true },
    brandName: { type: String, default: 'Wearly' },
    logoUrl: { type: String, default: '' },
    heroTagline: { type: String, default: 'Style for everyone.' },
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

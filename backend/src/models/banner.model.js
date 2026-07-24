const { Schema, model } = require('mongoose');
const { withMsTimestamps } = require('./modelHelpers');
const { tenantPlugin } = require('../context/storeContext');
const { BANNER_POSITION } = require('../constants/constants');

// Homepage content blocks (hero/promo/deal) — store-managed, drives dynamic sections.
const bannerSchema = new Schema({
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    link: { type: String, default: '' },
    ctaText: { type: String, default: '' },
    position: {
        type: String,
        enum: Object.values(BANNER_POSITION),
        default: BANNER_POSITION.HERO,
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
});

withMsTimestamps(bannerSchema);
bannerSchema.plugin(tenantPlugin);

const Banner = model('Banner', bannerSchema);
module.exports = Banner;

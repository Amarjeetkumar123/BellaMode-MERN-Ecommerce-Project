const { Schema, model } = require('mongoose');
const { withMsTimestamps } = require('./modelHelpers');

// A seller's store — the tenant boundary. Every ownable document (product,
// category, order, setting, banner, blog) carries a `store` ref back to one of these.
// Phase 1: one owner per store. Staff/membership is a later enhancement.
const storeSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    // Lifecycle for the (later) onboarding/approval flow. New stores start pending;
    // the migrated Store #1 is created approved.
    status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'pending', index: true },
    // Platform commission %, applied in the (later) Razorpay Route payouts phase.
    commissionRate: { type: Number, default: 0, min: 0, max: 100 },
    // Forward-compat routing stubs — unused in Phase 1, wired up in the Storefronts phase.
    subdomain: { type: String, unique: true, sparse: true },
    domains: { type: [String], default: [] },
});

withMsTimestamps(storeSchema);

const Store = model('Store', storeSchema);
module.exports = Store;

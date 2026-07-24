const { Schema, model } = require('mongoose');
const { withMsTimestamps } = require('./modelHelpers');
const { CURRENCY } = require('../constants/constants');

// A record of one seller's share of one paid order. Written when a Route-split
// payment is verified; `status` tracks whether Razorpay actually routed the money
// to the seller's linked account (or held it, if the account isn't linked yet).
const payoutSchema = new Schema({
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    paymentGroup: { type: String, index: true },
    // itemsPrice for this order = amount + commission (platform's cut).
    amount: { type: Number, required: true },       // seller's net (routed)
    commission: { type: Number, default: 0 },       // platform's cut
    currency: { type: String, default: CURRENCY },
    razorpayPaymentId: { type: String },
    transferId: { type: String },
    // routed  → a Route transfer credited the seller's linked account
    // held    → payment captured but no linked account, share retained by platform
    // failed  → transfer attempt failed
    status: { type: String, enum: ['held', 'routed', 'failed'], default: 'held', index: true },
});

withMsTimestamps(payoutSchema);
payoutSchema.index({ store: 1, create_date: -1 });
// One payout per order — makes verify idempotent under retries/webhooks.
payoutSchema.index({ order: 1 }, { unique: true });

const Payout = model('Payout', payoutSchema);
module.exports = Payout;

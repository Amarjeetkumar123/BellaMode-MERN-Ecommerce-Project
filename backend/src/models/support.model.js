const { Schema, model } = require('mongoose');
const { withMsTimestamps } = require('./modelHelpers');
const { SUPPORT_TOPIC, SUPPORT_STATUS } = require('../constants/constants');

// A customer's help request about one order (refund, return, damaged item…), answered by an admin.
const supportSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    topic: { type: String, enum: Object.values(SUPPORT_TOPIC), required: true },
    message: { type: String, required: true },
    status: { type: String, enum: Object.values(SUPPORT_STATUS), default: SUPPORT_STATUS.OPEN },
    reply: { type: String, default: '' },
});

withMsTimestamps(supportSchema);
supportSchema.index({ user: 1, create_date: -1 });
supportSchema.index({ status: 1, create_date: -1 });

module.exports = model('Support', supportSchema);

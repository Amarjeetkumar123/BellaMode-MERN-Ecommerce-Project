const { Schema, model } = require('mongoose');
const { withMsTimestamps } = require('./modelHelpers');

// Newsletter sign-ups from the footer.
const subscriberSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
});

withMsTimestamps(subscriberSchema);

module.exports = model('Subscriber', subscriberSchema);

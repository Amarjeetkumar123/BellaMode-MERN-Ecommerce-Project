const express = require('express');
const router = express.Router();

const Subscriber = require('../models/subscriber.model');
const { andMiddleware } = require('../middleware/middlewarehelper/and_middleware');
const { validateNewsletterSchema } = require('../jsonvalidation/jsonvalidator');
const { asyncHandler, sendSuccess } = require('../utils/commonUtils');

// POST /api/newsletter — idempotent, and the same reply either way so it can't be used
// to find out which emails are already on the list.
router.post('/', andMiddleware([validateNewsletterSchema]), asyncHandler(async (req, res) => {
    const email = req.body.email.trim().toLowerCase();
    await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
    return sendSuccess(res, 200, 'Subscribed.');
}));

module.exports = router;

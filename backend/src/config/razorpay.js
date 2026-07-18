const Razorpay = require('razorpay');

const isRazorpayConfigured = () =>
    Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

let instance = null;
function getRazorpayInstance() {
    if (!isRazorpayConfigured()) return null;
    if (!instance) {
        instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return instance;
}

module.exports = { getRazorpayInstance, isRazorpayConfigured };

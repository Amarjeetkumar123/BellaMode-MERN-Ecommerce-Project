// Demo orders for the admin overview graphs: ~90 days of orders from a few demo customers.
// Run: node seed/seedOrders.js          (replaces earlier demo orders)
//      node seed/seedOrders.js --undo   (removes the demo customers and their orders)
require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');

const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const Product = require('../src/models/product.model');
const Order = require('../src/models/order.model');
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, TAX_RATE, SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } = require('../src/constants/constants');

const DEMO_DOMAIN = '@demo.wearly.local';
const DAY = 86400000;
const CUSTOMERS = [
    ['Aarav Sharma', 'Mumbai', 'Maharashtra'], ['Diya Patel', 'Ahmedabad', 'Gujarat'], ['Kabir Singh', 'Delhi', 'Delhi'],
    ['Meera Iyer', 'Chennai', 'Tamil Nadu'], ['Rohan Gupta', 'Bengaluru', 'Karnataka'], ['Ananya Das', 'Kolkata', 'West Bengal'],
    ['Vihaan Reddy', 'Hyderabad', 'Telangana'], ['Isha Nair', 'Kochi', 'Kerala'],
];

const rand = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rand(a.length)];
const round2 = (n) => Math.round(n * 100) / 100;

// Older orders have mostly arrived; recent ones are still moving. A few get cancelled.
function statusFor(ageDays) {
    if (Math.random() < 0.07) return ORDER_STATUS.CANCELLED;
    if (ageDays > 8) return ORDER_STATUS.DELIVERED;
    if (ageDays > 4) return pick([ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED]);
    if (ageDays > 1) return pick([ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED]);
    return pick([ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING]);
}

async function removeDemo() {
    const ids = (await User.find({ email: { $regex: `${DEMO_DOMAIN.replace(/\./g, '\\.')}$` } }, '_id')).map((u) => u._id);
    const { deletedCount } = await Order.deleteMany({ user: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
    console.log(`Removed ${deletedCount} demo orders and ${ids.length} demo customers.`);
}

async function seed() {
    const products = await Product.find({ stock: { $gt: 0 } }).lean();
    if (!products.length) throw new Error('No products in stock. Run npm run seed first.');
    // a handful of best sellers so that chart has a clear shape
    const popular = products.slice(0, 6);

    const users = [];
    for (const [name, city, state] of CUSTOMERS) {
        const email = name.toLowerCase().replace(' ', '.') + DEMO_DOMAIN;
        // random password nobody knows: these accounts are for data only, not for signing in
        users.push({ user: await User.create({ username: name, email, password: crypto.randomBytes(24).toString('hex') }), city, state });
    }

    const orders = [];
    for (let age = 89; age >= 0; age--) {
        const day = new Date(Date.now() - age * DAY);
        const weekend = [0, 6].includes(day.getDay());
        // slow growth over the quarter, busier weekends
        const count = rand(3) + Math.round((90 - age) / 30) + (weekend ? 2 : 0);
        for (let k = 0; k < count; k++) {
            const { user, city, state } = pick(users);
            const lines = new Map();
            for (let i = 0, n = 1 + rand(3); i < n; i++) {
                const p = Math.random() < 0.45 ? pick(popular) : pick(products);
                const prev = lines.get(String(p._id));
                lines.set(String(p._id), {
                    product: p._id, name: p.name, image: p.images?.[0], price: p.price,
                    quantity: (prev?.quantity || 0) + 1, size: prev?.size || pick(p.sizes?.length ? p.sizes : ['M']), color: prev?.color || p.colors?.[0],
                });
            }
            const items = [...lines.values()];
            const itemsPrice = round2(items.reduce((s, it) => s + it.price * it.quantity, 0));
            const tax = round2(itemsPrice * TAX_RATE);
            const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
            const status = statusFor(age);
            const paymentMethod = Math.random() < 0.6 ? PAYMENT_METHOD.RAZORPAY : PAYMENT_METHOD.COD;
            const paid = paymentMethod === PAYMENT_METHOD.RAZORPAY ? status !== ORDER_STATUS.CANCELLED : status === ORDER_STATUS.DELIVERED;
            const at = day.getTime() - rand(DAY / 2);
            orders.push({
                user: user._id, items, itemsPrice, tax, shippingPrice, totalPrice: round2(itemsPrice + tax + shippingPrice),
                shippingAddress: { fullName: user.username, phone: '9' + String(100000000 + rand(899999999)), line1: `${1 + rand(200)} MG Road`, city, state, postalCode: String(400001 + rand(300000)) },
                paymentMethod, paymentStatus: paid ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
                status, create_date: at, update_date: at,
            });
        }
    }
    await Order.insertMany(orders);
    console.log(`Added ${orders.length} demo orders from ${users.length} demo customers over the last 90 days.`);
}

(async () => {
    await connectDB();
    try {
        await removeDemo();
        if (!process.argv.includes('--undo')) await seed();
    } finally {
        await mongoose.disconnect();
    }
})().catch((err) => { console.error(err); process.exit(1); });

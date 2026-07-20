// Creates (or upgrades) a single SUPERADMIN user — non-destructive: it does NOT
// touch products, categories or orders. Run: node seed/createSuperadmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const { ROLES } = require('../src/constants/constants');

async function run() {
    const email = process.env.ADMIN_EMAIL || 'superadmin@wearly.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';
    const username = process.env.ADMIN_NAME || 'Wearly Superadmin';

    await connectDB();

    let admin = await User.findOne({ email });
    if (admin) {
        admin.role = ROLES.SUPERADMIN;
        admin.username = username;
        admin.password = password; // re-hashed by the pre-save hook
        await admin.save();
        console.log(`✓ Superadmin updated → ${email}`);
    } else {
        admin = new User({ username, email, password, role: ROLES.SUPERADMIN });
        await admin.save();
        console.log(`✓ Superadmin created → ${email} / ${password}`);
    }

    await mongoose.connection.close();
    process.exit(0);
}

run().catch(async (err) => {
    console.error('Failed to create superadmin:', err.message);
    await mongoose.connection.close();
    process.exit(1);
});

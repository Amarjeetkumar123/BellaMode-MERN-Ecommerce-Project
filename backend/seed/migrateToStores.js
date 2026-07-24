// One-time, idempotent migration to the multi-seller tenancy foundation.
// Creates Store #1 (owner = the existing superadmin), backfills a `store` ref on
// every existing product/category/order/banner/blog and the singleton setting, and
// converts any legacy ADMIN user to SELLER. Safe to re-run — it skips docs that
// already have a store. Run: node seed/migrateToStores.js
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../src/config/db');
const logger = require('../src/config/logger');
const User = require('../src/models/user.model');
const Store = require('../src/models/store.model');
const Product = require('../src/models/product.model');
const Category = require('../src/models/category.model');
const Order = require('../src/models/order.model');
const Banner = require('../src/models/banner.model');
const Blog = require('../src/models/blog.model');
const Setting = require('../src/models/setting.model');
const { ROLES } = require('../src/constants/constants');

async function run() {
    await connectDB();

    // 1. Roles: any legacy ADMIN becomes a SELLER.
    const roleRes = await User.updateMany({ role: 'ADMIN' }, { $set: { role: ROLES.SELLER } });
    logger.info(`✓ ${roleRes.modifiedCount} ADMIN user(s) → SELLER`);

    // 2. Find (or elect) the platform owner.
    let owner = await User.findOne({ role: ROLES.SUPERADMIN }).sort({ create_date: 1 });
    if (!owner) owner = await User.findOne({}).sort({ create_date: 1 });
    if (!owner) {
        logger.error('No users found — run the seed first.');
        await mongoose.connection.close();
        process.exit(1);
    }

    // 3. Store #1 (idempotent).
    let store = await Store.findOne({ slug: 'wearly' });
    if (!store) {
        store = await Store.create({ owner: owner._id, name: 'Wearly', slug: 'wearly', status: 'approved' });
        logger.info(`✓ Store #1 created (owner ${owner.email})`);
    } else {
        logger.info('• Store #1 already exists — reusing');
    }
    await User.findByIdAndUpdate(owner._id, { store: store._id });

    // 4. Backfill store on every tenant collection (only docs missing one).
    // updateMany bypasses the tenant plugin (no request context here), so these
    // reach all legacy documents.
    const targets = [
        ['products', Product], ['categories', Category], ['orders', Order],
        ['banners', Banner], ['blogs', Blog],
    ];
    for (const [label, Model] of targets) {
        // eslint-disable-next-line no-await-in-loop
        const res = await Model.updateMany(
            { $or: [{ store: { $exists: false } }, { store: null }] },
            { $set: { store: store._id } }
        );
        logger.info(`✓ ${label}: ${res.modifiedCount} backfilled`);
    }

    // 5. Settings: drop the stale unique index on the legacy `key` field — with
    // per-store settings, multiple docs legitimately share no `key`.
    try {
        await Setting.collection.dropIndex('key_1');
        logger.info('✓ dropped stale settings index key_1');
    } catch (e) {
        // index may not exist (fresh DB) — ignore
    }

    // Settings: reconcile the legacy singleton (key:'brand', no store) with any
    // store-scoped doc. Idempotent in all combinations.
    const scoped = await Setting.findOne({ store: store._id });
    const legacy = await Setting.findOne({ store: { $exists: false } });
    if (legacy && !scoped) {
        // Pure migration: promote the singleton to Store #1.
        await Setting.updateOne({ _id: legacy._id }, { $set: { store: store._id }, $unset: { key: '' } });
        logger.info('✓ settings: singleton promoted to Store #1');
    } else if (legacy && scoped) {
        // A store-scoped doc already holds the data → the singleton is redundant.
        await Setting.deleteOne({ _id: legacy._id });
        logger.info('✓ settings: dropped redundant legacy singleton');
    } else if (!scoped) {
        await Setting.create({ store: store._id });
        logger.info('✓ settings: created default for Store #1');
    } else {
        logger.info('• settings already store-scoped');
    }

    // 6. Verify — no unscoped docs, no ADMIN users left.
    const unscoped = {};
    for (const [label, Model] of targets) {
        // eslint-disable-next-line no-await-in-loop
        unscoped[label] = await Model.countDocuments({ $or: [{ store: { $exists: false } }, { store: null }] });
    }
    const adminsLeft = await User.countDocuments({ role: 'ADMIN' });
    logger.info(`Verification: ${JSON.stringify({ ...unscoped, adminUsers: adminsLeft })}`);
    const clean = Object.values(unscoped).every((n) => n === 0) && adminsLeft === 0;
    logger.info(clean ? '\n✅ Migration complete — all data scoped to Store #1.' : '\n⚠ Some docs remain unscoped — investigate.');

    await mongoose.connection.close();
    process.exit(clean ? 0 : 1);
}

run().catch(async (err) => {
    logger.error(`Migration failed: ${err.message}`, { stack: err.stack });
    await mongoose.connection.close();
    process.exit(1);
});

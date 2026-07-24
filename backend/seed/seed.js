// Seeds the Wearly database: superadmin, categories, products.
// (Blogs / settings / banners are added by the CMS phase and re-seed here too.)
// Run: node seed/seed.js
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../src/config/db');
const logger = require('../src/config/logger');
const User = require('../src/models/user.model');
const Category = require('../src/models/category.model');
const Product = require('../src/models/product.model');
const Setting = require('../src/models/setting.model');
const Banner = require('../src/models/banner.model');
const Blog = require('../src/models/blog.model');
const Order = require('../src/models/order.model');
const Store = require('../src/models/store.model');
const { ROLES } = require('../src/constants/constants');
const { slugify } = require('../src/utils/commonUtils');
const { CATEGORIES, PRODUCTS, SETTINGS, BANNERS, BLOGS } = require('./seedData');

// A weak default is fine for a local dev database but must never reach a real
// deployment, so anything other than development requires an explicit password.
function resolveAdminPassword() {
    const fromEnv = process.env.ADMIN_PASSWORD;
    if (fromEnv) return fromEnv;
    if ((process.env.NODE_ENV || 'development') !== 'development') {
        throw new Error(
            'ADMIN_PASSWORD must be set when NODE_ENV is not "development" — refusing to seed a well-known default password.'
        );
    }
    logger.warn('⚠  ADMIN_PASSWORD not set — using the dev-only default. Set ADMIN_PASSWORD before deploying.');
    return 'Admin@123';
}

async function seedSuperadmin() {
    const email = process.env.ADMIN_EMAIL || 'admin@wearly.com';
    const password = resolveAdminPassword();
    const username = process.env.ADMIN_NAME || 'Wearly Admin';

    let admin = await User.findOne({ email });
    if (admin) {
        admin.role = ROLES.SUPERADMIN;
        admin.username = username;
        admin.password = password; // re-hashed by pre-save hook
        await admin.save();
        logger.info(`✓ Superadmin updated: ${email}`);
    } else {
        admin = new User({ username, email, password, role: ROLES.SUPERADMIN });
        await admin.save();
        logger.info(`✓ Superadmin created: ${email} / ${password}`);
    }
    return admin;
}

// Store #1 — the platform's own store, owner = the seeded superadmin.
async function seedStore(ownerId) {
    let store = await Store.findOne({ slug: 'wearly' });
    if (!store) {
        store = await Store.create({ owner: ownerId, name: 'Wearly', slug: 'wearly', status: 'approved' });
        logger.info('✓ Store #1 created (wearly)');
    } else {
        store.owner = ownerId;
        store.status = 'approved';
        await store.save();
        logger.info('✓ Store #1 updated (wearly)');
    }
    // Link the superadmin to their store for resolveStore.
    await User.findByIdAndUpdate(ownerId, { store: store._id });
    return store._id;
}

async function seedCategories(storeId) {
    await Category.deleteMany({});
    const docs = CATEGORIES.map((c) => ({
        ...c,
        store: storeId,
        slug: slugify(`${c.name}-${c.audience}`),
        isActive: true,
    }));
    const created = await Category.insertMany(docs);
    logger.info(`✓ ${created.length} categories seeded`);

    // Map "audience::CategoryName" → category _id for product linking.
    const map = new Map();
    created.forEach((cat) => map.set(`${cat.audience}::${cat.name}`, cat._id));
    return map;
}

async function seedProducts(categoryMap, authorId, storeId) {
    // Orders embed product refs, so wiping products without clearing orders
    // leaves line items pointing at documents that no longer exist.
    const orphaned = await Order.countDocuments({});
    if (orphaned > 0) {
        await Order.deleteMany({});
        logger.info(`✓ ${orphaned} order(s) cleared (their products are being replaced)`);
    }
    await Product.deleteMany({});
    const docs = PRODUCTS.map((p) => {
        // Lifestyle categories (Footwear, Watches, …) are shared `unisex` categories, but the
        // products inside them carry a real audience so they can be filtered per department.
        // `categoryAudience` lets a men's shoe live in the unisex Footwear category.
        const categoryId = categoryMap.get(`${p.categoryAudience || p.audience}::${p.categoryName}`);
        return {
            store: storeId,
            name: p.name,
            slug: slugify(`${p.name}-${p.audience}`),
            description: p.description || '',
            price: p.price,
            oldPrice: p.oldPrice,
            images: [p.image],
            audience: p.audience,
            category: categoryId,
            brand: p.brand || '',
            colors: p.colors || [],
            sizes: p.sizes || [],
            stock: p.stock || 0,
            rating: p.rating || 0,
            numReviews: 0,
            isTrending: Boolean(p.isTrending),
            isFeatured: Boolean(p.isFeatured),
            isActive: true,
            author: authorId,
        };
    });
    const created = await Product.insertMany(docs);
    logger.info(`✓ ${created.length} products seeded`);
}

async function seedSettings(storeId) {
    // Drop the stale unique index on the legacy `key` field if it lingers.
    try { await Setting.collection.dropIndex('key_1'); } catch (e) { /* not present */ }
    // Remove any pre-multi-seller singleton settings (no store) so it can't linger.
    await Setting.deleteMany({ store: { $exists: false } });
    const { key, ...rest } = SETTINGS; // drop the legacy singleton key
    await Setting.findOneAndUpdate({ store: storeId }, { $set: { ...rest, store: storeId } }, { upsert: true, setDefaultsOnInsert: true });
    logger.info('✓ Brand settings seeded');
}

async function seedBanners(storeId) {
    await Banner.deleteMany({});
    await Banner.insertMany(BANNERS.map((b) => ({ ...b, store: storeId, isActive: true })));
    logger.info(`✓ ${BANNERS.length} banners seeded`);
}

async function seedBlogs(authorId, storeId) {
    await Blog.deleteMany({});
    const docs = BLOGS.map((b) => ({
        ...b,
        store: storeId,
        slug: slugify(b.title),
        author: authorId,
        authorName: 'Wearly Editorial',
        isPublished: true,
    }));
    await Blog.insertMany(docs);
    logger.info(`✓ ${docs.length} blogs seeded`);
}

async function run() {
    await connectDB();
    const admin = await seedSuperadmin();
    const storeId = await seedStore(admin._id);
    const categoryMap = await seedCategories(storeId);
    await seedProducts(categoryMap, admin._id, storeId);
    await seedSettings(storeId);
    await seedBanners(storeId);
    await seedBlogs(admin._id, storeId);
    logger.info('\n✅ Seed complete.');
    await mongoose.connection.close();
    process.exit(0);
}

run().catch(async (err) => {
    logger.error(`Seed failed: ${err.message}`, { stack: err.stack });
    await mongoose.connection.close();
    process.exit(1);
});

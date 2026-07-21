// Seeds the Wearly database: superadmin, categories, products.
// (Blogs / settings / banners are added by the CMS phase and re-seed here too.)
// Run: node seed/seed.js
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const Category = require('../src/models/category.model');
const Product = require('../src/models/product.model');
const Setting = require('../src/models/setting.model');
const Banner = require('../src/models/banner.model');
const Blog = require('../src/models/blog.model');
const { ROLES } = require('../src/constants/constants');
const { slugify } = require('../src/utils/commonUtils');
const { CATEGORIES, PRODUCTS, SETTINGS, BANNERS, BLOGS } = require('./seedData');

async function seedSuperadmin() {
    const email = process.env.ADMIN_EMAIL || 'admin@wearly.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';
    const username = process.env.ADMIN_NAME || 'Wearly Admin';

    let admin = await User.findOne({ email });
    if (admin) {
        admin.role = ROLES.SUPERADMIN;
        admin.username = username;
        admin.password = password; // re-hashed by pre-save hook
        await admin.save();
        console.log(`✓ Superadmin updated: ${email}`);
    } else {
        admin = new User({ username, email, password, role: ROLES.SUPERADMIN });
        await admin.save();
        console.log(`✓ Superadmin created: ${email} / ${password}`);
    }
    return admin;
}

async function seedCategories() {
    await Category.deleteMany({});
    const docs = CATEGORIES.map((c) => ({
        ...c,
        slug: slugify(`${c.name}-${c.audience}`),
        isActive: true,
    }));
    const created = await Category.insertMany(docs);
    console.log(`✓ ${created.length} categories seeded`);

    // Map "audience::CategoryName" → category _id for product linking.
    const map = new Map();
    created.forEach((cat) => map.set(`${cat.audience}::${cat.name}`, cat._id));
    return map;
}

async function seedProducts(categoryMap, authorId) {
    await Product.deleteMany({});
    const docs = PRODUCTS.map((p) => {
        // Lifestyle categories (Footwear, Watches, …) are shared `unisex` categories, but the
        // products inside them carry a real audience so they can be filtered per department.
        // `categoryAudience` lets a men's shoe live in the unisex Footwear category.
        const categoryId = categoryMap.get(`${p.categoryAudience || p.audience}::${p.categoryName}`);
        return {
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
    console.log(`✓ ${created.length} products seeded`);
}

async function seedSettings() {
    await Setting.findOneAndUpdate({ key: 'brand' }, { $set: SETTINGS }, { upsert: true, setDefaultsOnInsert: true });
    console.log('✓ Brand settings seeded');
}

async function seedBanners() {
    await Banner.deleteMany({});
    await Banner.insertMany(BANNERS.map((b) => ({ ...b, isActive: true })));
    console.log(`✓ ${BANNERS.length} banners seeded`);
}

async function seedBlogs(authorId) {
    await Blog.deleteMany({});
    const docs = BLOGS.map((b) => ({
        ...b,
        slug: slugify(b.title),
        author: authorId,
        authorName: 'Wearly Editorial',
        isPublished: true,
    }));
    await Blog.insertMany(docs);
    console.log(`✓ ${docs.length} blogs seeded`);
}

async function run() {
    await connectDB();
    const admin = await seedSuperadmin();
    const categoryMap = await seedCategories();
    await seedProducts(categoryMap, admin._id);
    await seedSettings();
    await seedBanners();
    await seedBlogs(admin._id);
    console.log('\n✅ Seed complete.');
    await mongoose.connection.close();
    process.exit(0);
}

run().catch(async (err) => {
    console.error('Seed failed:', err);
    await mongoose.connection.close();
    process.exit(1);
});

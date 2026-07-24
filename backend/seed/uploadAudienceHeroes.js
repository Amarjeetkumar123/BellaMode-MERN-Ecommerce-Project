// Uploads per-audience hero images to Cloudinary and saves the URLs into
// settings.audienceHeroImages (non-destructive — touches only that field).
//
// Usage: drop wide (16:9) images named  hero-men.jpg / hero-women.jpg /
//   hero-kids.jpg / hero-boys.jpg / hero-girls.jpg  (png/jpg/webp all fine)
//   into frontend/src/assets/images/, then run:
//     node seed/uploadAudienceHeroes.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const logger = require('../src/config/logger');
const Setting = require('../src/models/setting.model');
const { cloudinary, isCloudinaryConfigured } = require('../src/config/cloudinary');

const AUDIENCES = ['men', 'women', 'kids', 'boys', 'girls'];
const IMAGES_DIR = path.join(__dirname, '..', '..', 'frontend', 'src', 'assets', 'images');
const EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

function findFile(aud) {
    for (const ext of EXTS) {
        const p = path.join(IMAGES_DIR, `hero-${aud}${ext}`);
        if (fs.existsSync(p)) return p;
    }
    return null;
}

async function run() {
    if (!isCloudinaryConfigured()) {
        logger.error('✗ Cloudinary is not configured (set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET in .env).');
        process.exit(1);
    }
    await connectDB();

    const heroes = {};
    for (const aud of AUDIENCES) {
        const file = findFile(aud);
        if (!file) { logger.info(`– hero-${aud}: no file found, skipping`); continue; }
        process.stdout.write(`↑ uploading hero-${aud} … `);
        const res = await cloudinary.uploader.upload(file, { folder: 'wearly/heroes' });
        heroes[aud] = res.secure_url;
        logger.info(res.secure_url);
    }

    if (!Object.keys(heroes).length) {
        logger.info('\nNothing uploaded. Add hero-<audience>.jpg files to frontend/src/assets/images/.');
        await mongoose.connection.close();
        process.exit(0);
    }

    const setKeys = Object.fromEntries(Object.entries(heroes).map(([k, v]) => [`audienceHeroImages.${k}`, v]));
    await Setting.findOneAndUpdate({ key: 'brand' }, { $set: { ...setKeys, update_date: Date.now() } }, { upsert: true });
    logger.info(`\n✓ Saved ${Object.keys(heroes).length} hero image URL(s) to settings.audienceHeroImages`);

    await mongoose.connection.close();
    process.exit(0);
}

run().catch(async (err) => {
    logger.error('Upload failed:', err.message);
    await mongoose.connection.close();
    process.exit(1);
});

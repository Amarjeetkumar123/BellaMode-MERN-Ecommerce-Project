require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('./src/config/cloudinary'); // configure Cloudinary SDK at boot
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;

// ---- middleware ----
app.use(cookieParser());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
// CORS_ORIGIN may be a comma-separated allowlist (e.g. local dev + deployed frontend).
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
app.use(
    cors({
        origin: (origin, callback) => {
            // allow non-browser clients (no origin) and any allowlisted origin
            if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);

// ---- routes ----
app.use('/api/auth', require('./src/routes/user.route'));
app.use('/api/categories', require('./src/routes/category.route'));
app.use('/api/products', require('./src/routes/product.route'));
app.use('/api/reviews', require('./src/routes/review.route'));
app.use('/api/orders', require('./src/routes/order.route'));
app.use('/api/payments', require('./src/routes/payment.route'));
app.use('/api/wishlist', require('./src/routes/wishlist.route'));
app.use('/api/settings', require('./src/routes/setting.route'));
app.use('/api/banners', require('./src/routes/banner.route'));
app.use('/api/blogs', require('./src/routes/blog.route'));
app.use('/api/upload', require('./src/routes/upload.route'));
app.use('/api/newsletter', require('./src/routes/newsletter.route'));
app.use('/api/support', require('./src/routes/support.route'));

app.get('/', (req, res) => res.send('Wearly API is running.'));

// ---- error handler (must be last) ----
app.use(errorHandler);

connectDB()
    .then(() => {
        app.listen(port, () => console.log(`Server is running on port ${port}`));
    })
    .catch((err) => {
        console.error('Failed to connect to the database:', err);
        process.exit(1);
    });

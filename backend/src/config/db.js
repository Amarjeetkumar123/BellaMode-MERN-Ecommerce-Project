const mongoose = require('mongoose');
const logger = require('./logger');

async function connectDB() {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wearly';
    await mongoose.connect(uri);
    logger.info('Database successfully connected.');
}

module.exports = connectDB;

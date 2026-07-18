const mongoose = require('mongoose');

async function connectDB() {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wearly';
    await mongoose.connect(uri);
    console.log('Database successfully connected.');
}

module.exports = connectDB;

const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const { ROLES } = require('../constants/constants');

const addressSchema = new Schema(
    {
        label: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: { type: String, default: 'India' },
        phone: String,
    },
    { _id: false }
);

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.USER],
        default: ROLES.USER,
    },
    profileImage: String,
    bio: { type: String, maxlength: 200 },
    profession: String,
    phone: String,
    addresses: [addressSchema],
    create_date: { type: Number, default: () => Date.now() },
    update_date: { type: Number, default: () => Date.now() },
});

// Hash password when set/changed, and keep millisecond timestamps current.
userSchema.pre('save', async function (next) {
    if (this.isNew && !this.create_date) this.create_date = Date.now();
    this.update_date = Date.now();
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = model('User', userSchema);
module.exports = User;

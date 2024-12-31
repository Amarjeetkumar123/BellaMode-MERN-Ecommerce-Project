const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const secretKey = process.env.JWT_SECRET_KEY;
const generateToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found.");
        const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, { expiresIn: "1h" });
        return token;
    } catch (error) {
        throw error;
    }
}
module.exports = generateToken;
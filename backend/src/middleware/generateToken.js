const jwt = require('jsonwebtoken');
const { TOKEN_SECRET, TOKEN_EXPIRY } = require('../constants/constants');

// Signs a JWT carrying the identity claims that checkAuth reads back.
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            role: user.role,
            email: user.email,
            name: user.username,
        },
        TOKEN_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
};

module.exports = generateToken;

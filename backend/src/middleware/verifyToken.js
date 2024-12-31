const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).send({ message: "Invalid token" })
        const decoded = jwt.verify(token, secretKey);
        if (!decoded) return res.status(401).send({ message: "Invalid token or not valid." })
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({ message: "Auth failed." })
    }
}
module.exports = verifyToken;
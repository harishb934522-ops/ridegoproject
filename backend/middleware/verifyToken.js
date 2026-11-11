const jwt = require('jsonwebtoken');

// Middleware to check JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || 'ridego_jwt_secret_key_2026';
        const decoded = jwt.verify(token, secret);
        req.user = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;

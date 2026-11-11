const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || 'ridego_jwt_secret_key_2026';
    return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

module.exports = generateToken;

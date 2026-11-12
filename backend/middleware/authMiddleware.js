const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Captain = require('../models/captainModel');
const Admin = require('../models/adminModel');
const getJwtSecret = require('../config/jwt');

// Protect routes with JWT authentication
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, getJwtSecret());

            // Attempt to resolve User, Captain, or Admin
            let user = await User.findById(decoded.id).select('-password');
            if (!user) {
                user = await Captain.findById(decoded.id).select('-password');
            }
            if (!user) {
                user = await Admin.findById(decoded.id).select('-password');
            }

            req.user = user || { _id: decoded.id };
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token invalid');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protect };

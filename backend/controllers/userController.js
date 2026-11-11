const User = require('../models/userModel');
const Ride = require('../models/rideModel');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');

// @desc Register user
// @route POST /api/users/register
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            result: 'Error',
            message: 'Please provide all required fields (name, email, password)',
        });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
        return res.status(400).json({
            result: 'Error',
            message: `User already exists with email ${email}`,
        });
    }

    const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        password,
        phone: phone || '9876543210',
    });

    if (user) {
        const token = generateToken(user._id);
        return res.status(201).json({
            result: 'Success',
            message: 'Registration successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                wallet: user.wallet,
                token,
            },
        });
    } else {
        return res.status(400).json({
            result: 'Error',
            message: 'Invalid user data',
        });
    }
});

// @desc Login user
// @route POST /api/users/login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            result: 'Error',
            message: 'Please provide both email and password',
        });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);
        return res.json({
            result: 'Success',
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                wallet: user.wallet,
                token,
            },
        });
    } else {
        return res.status(401).json({
            result: 'Error',
            message: 'Invalid email or password',
        });
    }
});

// @desc Get user profile & history
// @route GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user;
    const user = await User.findById(userId).select('-password');

    if (!user) {
        return res.status(404).json({
            result: 'Error',
            message: 'User not found',
        });
    }

    // Retrieve user's rides sorted by most recent
    const rides = await Ride.find({
        $or: [{ user: user._id }, { _id: { $in: user.rideHistory || [] } }]
    })
        .populate('captain', 'name phone vehicleDetails rating')
        .sort({ createdAt: -1 });

    const totalRides = rides.length;
    const totalSpent = rides.reduce((acc, r) => acc + (r.price || r.fare || 0), 0);

    return res.json({
        result: 'Success',
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            wallet: user.wallet,
            totalRides,
            totalSpent,
            rating: 5.0,
            rideHistory: rides,
        },
    });
});

module.exports = { registerUser, loginUser, getUserProfile };

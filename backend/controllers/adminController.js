const User = require('../models/userModel');
const Captain = require('../models/captainModel');
const Ride = require('../models/rideModel');
const Admin = require('../models/adminModel');
const Coupon = require('../models/couponModel');
const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');

// Register Administrator
const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ result: 'Error', message: 'Provide admin details' });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existingAdmin) {
        return res.status(400).json({
            result: 'Error',
            message: 'Admin already exists with this email'
        });
    }

    const admin = await Admin.create({
        name,
        email: email.toLowerCase().trim(),
        password
    });

    if (admin) {
        return res.status(201).json({
            result: 'Success',
            message: 'Admin registered successfully',
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                token: generateToken(admin._id),
            }
        });
    } else {
        return res.status(400).json({
            result: 'Error',
            message: 'Invalid admin data'
        });
    }
});

// Login Admin
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (admin && (await admin.matchPassword(password))) {
        return res.json({
            result: 'Success',
            message: 'Admin logged in successfully',
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                token: generateToken(admin._id),
            }
        });
    } else {
        return res.status(401).json({
            result: 'Error',
            message: 'Email or Password incorrect'
        });
    }
});

// Overall income & financial metrics
const getIncomeDetails = asyncHandler(async (req, res) => {
    const completedRides = await Ride.find({ status: 'completed' });
    const totalIncome = completedRides.reduce((acc, r) => acc + (r.price || r.fare || 0), 0);
    const totalTips = completedRides.reduce((acc, r) => acc + (r.tip || 0), 0);
    return res.json({ totalIncome, totalTips });
});

// API to get comprehensive metrics for the admin dashboard
const getCounts = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments();
    const captainCount = await Captain.countDocuments();
    const rideCount = await Ride.countDocuments();
    const sosCount = await Ride.countDocuments({ sosTriggered: true, status: { $ne: 'completed' } });
    const couponCount = await Coupon.countDocuments({ isActive: true });

    const completedRides = await Ride.find({ status: 'completed' });
    const totalIncome = completedRides.reduce((acc, r) => acc + (r.price || r.fare || 0), 0);
    const totalTips = completedRides.reduce((acc, r) => acc + (r.tip || 0), 0);

    return res.json({
        result: 'Success',
        counts: {
            totalUsers: userCount || 0,
            totalCaptains: captainCount || 0,
            totalRides: rideCount || 0,
            activeSosAlerts: sosCount || 0,
            activeCoupons: couponCount || 0,
            totalIncome: totalIncome || 0,
            totalTips: totalTips || 0
        }
    });
});

// Get all drivers/captains
const getAllDrivers = asyncHandler(async (req, res) => {
    const captains = await Captain.find({}).sort({ createdAt: -1 });

    const formatted = captains.map(c => ({
        id: c._id,
        _id: c._id,
        name: c.name,
        vehicle: c.vehicleDetails ? c.vehicleDetails.type : 'Bike',
        vehicleNumber: c.vehicleDetails ? c.vehicleDetails.vehicleNumber : 'TN 23 AB 1234',
        vehicleModel: c.vehicleDetails ? c.vehicleDetails.vehicleModel : 'Standard',
        status: c.status || 'Active',
        rating: c.rating || 4.9,
        phone: c.phone
    }));

    return res.json({
        result: 'Success',
        drivers: formatted
    });
});

// Admin toggle driver status (Active / Busy / Offline)
const updateDriverStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const captain = await Captain.findById(req.params.id);
    if (!captain) {
        return res.status(404).json({ result: 'Error', message: 'Driver not found' });
    }
    if (status) captain.status = status;
    await captain.save();
    return res.json({ result: 'Success', message: `Driver status updated to ${captain.status}`, driver: captain });
});

// Admin add driver
const addDriver = asyncHandler(async (req, res) => {
    const { name, vehicle, phone } = req.body;

    if (!name) {
        return res.status(400).json({ result: 'Error', message: 'Driver name is required' });
    }

    const vehicleType = vehicle || 'Bike';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const vehicleNumber = `TN 23 ${vehicleType.slice(0, 2).toUpperCase()} ${randomNum}`;

    const captain = await Captain.create({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '')}${randomNum}@ridego.com`,
        password: 'password123',
        phone: phone || `9840${randomNum}12`,
        vehicleDetails: {
            type: vehicleType,
            vehicleNumber,
            vehicleModel: `${vehicleType} Model`
        },
        status: 'Active'
    });

    return res.status(201).json({
        result: 'Success',
        message: 'Driver added successfully',
        driver: {
            id: captain._id,
            _id: captain._id,
            name: captain.name,
            vehicle: captain.vehicleDetails.type,
            vehicleNumber: captain.vehicleDetails.vehicleNumber,
            status: captain.status
        }
    });
});

// Get all bookings with rich telemetry
const getAllBookings = asyncHandler(async (req, res) => {
    const rides = await Ride.find({})
        .populate('user', 'name email phone')
        .populate('captain', 'name phone vehicleDetails')
        .sort({ createdAt: -1 });

    const formatted = rides.map(r => ({
        id: r._id,
        _id: r._id,
        customer: r.user ? r.user.name : 'Customer',
        customerPhone: r.user ? r.user.phone : 'N/A',
        driver: r.captain ? r.captain.name : 'Unassigned',
        driverVehicle: r.captain && r.captain.vehicleDetails ? r.captain.vehicleDetails.vehicleNumber : 'N/A',
        location: `${r.pickup || r.startLocation} → ${r.drop || r.endLocation}`,
        vehicleType: r.vehicleType || 'Bike Taxi',
        status: r.status === 'completed' ? 'Completed' : r.status === 'confirmed' || r.status === 'on the way' || r.status === 'started' ? 'Accepted' : r.status === 'cancelled' ? 'Cancelled' : 'Pending',
        rawStatus: r.status,
        fare: r.price || r.fare || 50,
        discount: r.discount || 0,
        paymentMethod: r.paymentMethod || 'pending',
        otp: r.otp || '----',
        isOtpVerified: r.isOtpVerified || false,
        sosTriggered: r.sosTriggered || false,
        rating: r.rating || 0,
        compliments: r.compliments || [],
        tip: r.tip || 0,
        date: r.date || 'Today'
    }));

    return res.json({
        result: 'Success',
        bookings: formatted
    });
});

// Resolve SOS Alert
const resolveSos = asyncHandler(async (req, res) => {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
        return res.status(404).json({ result: 'Error', message: 'Ride not found' });
    }
    ride.sosTriggered = false;
    ride.chatMessages.push({
        sender: 'system',
        text: 'SOS alert marked as resolved by RideGo Admin Command.'
    });
    await ride.save();
    return res.json({ result: 'Success', message: 'SOS alert resolved successfully' });
});

// Ratings, compliments, and reviews feed
const getFeedbackFeed = asyncHandler(async (req, res) => {
    const reviewedRides = await Ride.find({ rating: { $gt: 0 } })
        .populate('user', 'name email')
        .populate('captain', 'name vehicleDetails')
        .sort({ updatedAt: -1 })
        .limit(20);

    const feedback = reviewedRides.map(r => ({
        rideId: r._id,
        customer: r.user ? r.user.name : 'Customer',
        driver: r.captain ? r.captain.name : 'Driver',
        vehicle: r.vehicleType,
        rating: r.rating,
        compliments: r.compliments || [],
        tip: r.tip || 0,
        date: r.date || new Date(r.updatedAt).toLocaleDateString()
    }));

    return res.json({ result: 'Success', feedback });
});

module.exports = {
    registerAdmin,
    loginAdmin,
    getIncomeDetails,
    getCounts,
    getAllDrivers,
    updateDriverStatus,
    addDriver,
    getAllBookings,
    resolveSos,
    getFeedbackFeed
};

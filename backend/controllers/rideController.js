const Ride = require('../models/rideModel');
const User = require('../models/userModel');
const Captain = require('../models/captainModel');
const asyncHandler = require('express-async-handler');

// Helper to ensure at least one captain exists per vehicle type
const getOrCreateCaptain = async (vehicleType) => {
    const vType = (vehicleType || 'bike').toLowerCase();
    let queryType = 'bike';
    if (vType.includes('auto')) queryType = 'auto';
    else if (vType.includes('parcel')) queryType = 'parcel carrier';

    let captain = await Captain.findOne({
        $or: [
            { 'vehicleDetails.type': new RegExp(queryType, 'i') },
            { 'vehicleDetails.type': new RegExp(vType, 'i') }
        ]
    });

    if (!captain) {
        const defaultCaptains = {
            bike: {
                name: 'Arun',
                email: 'arun.captain@ridego.com',
                password: 'password123',
                phone: '9840112233',
                vehicleDetails: { type: 'Bike', vehicleNumber: 'TN 23 AB 1234', vehicleModel: 'Honda Activa 6G' },
                rating: 4.9,
                status: 'Active'
            },
            auto: {
                name: 'Kumar',
                email: 'kumar.captain@ridego.com',
                password: 'password123',
                phone: '9840223344',
                vehicleDetails: { type: 'Auto', vehicleNumber: 'TN 23 AC 5678', vehicleModel: 'Bajaj RE Auto' },
                rating: 4.8,
                status: 'Active'
            },
            parcel: {
                name: 'Suresh',
                email: 'suresh.captain@ridego.com',
                password: 'password123',
                phone: '9840334455',
                vehicleDetails: { type: 'Parcel Carrier', vehicleNumber: 'TN 23 AD 9999', vehicleModel: 'Hero Splendor Carrier' },
                rating: 4.9,
                status: 'Active'
            }
        };

        const config = defaultCaptains[queryType] || defaultCaptains.bike;
        captain = await Captain.create(config);
    }

    return captain;
};

// @desc Book a ride
// @route POST /api/rides/book
const bookRide = asyncHandler(async (req, res) => {
    const {
        userId,
        captainId,
        pickup,
        drop,
        startLocation,
        endLocation,
        vehicleType,
        price,
        fare,
        date,
        time,
        paymentMethod,
        appliedCoupon,
        discount,
        parcelDetails
    } = req.body;

    const fromLoc = pickup || startLocation;
    const toLoc = drop || endLocation;
    const baseFare = Number(fare || price || 50);
    const rideDiscount = Number(discount || 0);
    const finalPrice = Math.max(baseFare - rideDiscount, 0);

    if (!fromLoc || !toLoc) {
        return res.status(400).json({
            result: 'Error',
            message: 'Please provide both pickup and drop locations'
        });
    }

    // Determine or assign Captain
    let assignedCaptain;
    if (captainId) {
        assignedCaptain = await Captain.findById(captainId);
    }
    if (!assignedCaptain) {
        assignedCaptain = await getOrCreateCaptain(vehicleType);
    }

    const effectiveUserId = userId || (req.user && req.user._id);
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const ride = new Ride({
        user: effectiveUserId,
        captain: assignedCaptain ? assignedCaptain._id : undefined,
        startLocation: fromLoc,
        endLocation: toLoc,
        pickup: fromLoc,
        drop: toLoc,
        vehicleType: vehicleType || 'Bike Taxi',
        price: finalPrice,
        fare: finalPrice,
        discount: rideDiscount,
        appliedCoupon: appliedCoupon || '',
        date: date || new Date().toISOString().split('T')[0],
        time: time || '12:00 PM',
        status: 'pending',
        paymentMethod: paymentMethod || 'pending',
        otp: generatedOtp,
        isOtpVerified: false,
        parcelDetails: parcelDetails || { category: 'Documents', weight: 1, recipientPhone: '' },
        chatMessages: [
            { sender: 'system', text: `Ride booked with ${assignedCaptain ? assignedCaptain.name : 'your driver'}. Share OTP ${generatedOtp} when boarding.` }
        ]
    });

    const savedRide = await ride.save();

    if (effectiveUserId) {
        await User.findByIdAndUpdate(effectiveUserId, {
            $addToSet: { rideHistory: savedRide._id }
        });
    }

    const populatedRide = await Ride.findById(savedRide._id).populate('captain', 'name phone vehicleDetails rating status');

    return res.status(201).json({
        result: 'Success',
        message: 'Ride booked successfully',
        ride: populatedRide
    });
});

// @desc Verify Ride OTP (Driver enters OTP to start trip)
// @route POST /api/rides/:id/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { otp } = req.body;

    const ride = await Ride.findById(id);
    if (!ride) {
        return res.status(404).json({ result: 'Error', message: 'Ride not found' });
    }

    if (ride.otp !== String(otp).trim()) {
        return res.status(400).json({ result: 'Error', message: 'Invalid OTP. Please check the rider screen.' });
    }

    ride.isOtpVerified = true;
    ride.status = 'started';
    ride.chatMessages.push({
        sender: 'system',
        text: 'OTP Verified successfully. Trip started!'
    });
    await ride.save();

    const updated = await Ride.findById(id).populate('captain', 'name phone vehicleDetails rating status');
    return res.json({ result: 'Success', message: 'OTP verified! Trip is now in progress.', ride: updated });
});

// @desc Trigger SOS alert
// @route POST /api/rides/:id/sos
const triggerSos = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ride = await Ride.findById(id);
    if (!ride) {
        return res.status(404).json({ result: 'Error', message: 'Ride not found' });
    }

    ride.sosTriggered = true;
    ride.chatMessages.push({
        sender: 'system',
        text: 'EMERGENCY SOS ALERT TRIGGERED. Emergency services & RideGo Support have been notified.'
    });
    await ride.save();

    return res.json({
        result: 'Success',
        message: 'SOS Alert broadcasted successfully! Emergency contacts and RideGo command center notified.',
        ride
    });
});

// @desc Submit post-ride feedback & tip
// @route POST /api/rides/:id/feedback
const submitFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, compliments, tip } = req.body;

    const ride = await Ride.findById(id);
    if (!ride) {
        return res.status(404).json({ result: 'Error', message: 'Ride not found' });
    }

    ride.rating = Number(rating) || 5;
    if (compliments && Array.isArray(compliments)) {
        ride.compliments = compliments;
    }
    if (tip && Number(tip) > 0) {
        ride.tip = Number(tip);
    }
    await ride.save();

    // Reward user with 20 RideGo coins for completing a ride and leaving a review!
    if (ride.user) {
        await User.findByIdAndUpdate(ride.user, {
            $inc: { coins: 20 }
        });
    }

    return res.json({
        result: 'Success',
        message: 'Thank you for your rating! 20 RideGo coins added to your reward balance.',
        ride
    });
});

// @desc In-ride live chat message
// @route POST /api/rides/:id/chat
const addChatMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { sender, text } = req.body;

    if (!text) {
        return res.status(400).json({ result: 'Error', message: 'Message text required' });
    }

    const ride = await Ride.findById(id);
    if (!ride) {
        return res.status(404).json({ result: 'Error', message: 'Ride not found' });
    }

    const newMsg = {
        sender: sender || 'rider',
        text,
        timestamp: new Date()
    };

    ride.chatMessages.push(newMsg);
    await ride.save();

    return res.json({ result: 'Success', chatMessages: ride.chatMessages });
});

// @desc Update ride status and payment
// @route PUT /api/rides/update/:id
const updateRideStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, paymentMethod, paymentStatus } = req.body;

    const ride = await Ride.findById(id);
    if (!ride) {
        return res.status(404).json({
            result: 'Error',
            message: 'Ride not found'
        });
    }

    if (status) ride.status = status;
    if (paymentMethod) ride.paymentMethod = paymentMethod;
    if (paymentStatus) ride.paymentStatus = paymentStatus;

    await ride.save();
    const updated = await Ride.findById(id).populate('captain', 'name phone vehicleDetails rating status');

    return res.json({
        result: 'Success',
        message: 'Ride updated successfully',
        ride: updated
    });
});

// @desc Get ride details by ID
// @route GET /api/rides/:id
const getRideDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ride = await Ride.findById(id)
        .populate('user', 'name email phone')
        .populate('captain', 'name phone vehicleDetails rating status');

    if (!ride) {
        return res.status(404).json({
            result: 'Error',
            message: 'Ride not found'
        });
    }

    return res.json({
        result: 'Success',
        ride
    });
});

// @desc Cancel ride
// @route DELETE /api/rides/cancel/:id
const cancelRide = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ride = await Ride.findById(id);
    if (!ride) {
        return res.status(404).json({
            result: 'Error',
            message: 'Ride not found'
        });
    }

    ride.status = 'cancelled';
    await ride.save();

    return res.json({
        result: 'Success',
        message: 'Ride cancelled successfully',
        ride
    });
});

// @desc Get all rides (for admin or listing)
// @route GET /api/rides
const getAllRides = asyncHandler(async (req, res) => {
    const rides = await Ride.find({})
        .populate('user', 'name email phone')
        .populate('captain', 'name phone vehicleDetails rating status')
        .sort({ createdAt: -1 });

    return res.json({
        result: 'Success',
        count: rides.length,
        rides
    });
});

// @desc Find rides by Captain
// @route GET /api/rides/find/:captainId
const findRides = asyncHandler(async (req, res) => {
    const { captainId } = req.params;
    const rides = await Ride.find({ captain: captainId }).sort({ createdAt: -1 });

    return res.json({
        result: 'Success',
        count: rides.length,
        rides
    });
});

module.exports = {
    bookRide,
    verifyOtp,
    triggerSos,
    submitFeedback,
    addChatMessage,
    updateRideStatus,
    getRideDetails,
    cancelRide,
    getAllRides,
    findRides
};

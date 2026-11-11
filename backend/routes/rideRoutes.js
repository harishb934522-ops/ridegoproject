const express = require('express');
const router = express.Router();
const {
    bookRide,
    verifyOtp,
    triggerSos,
    submitFeedback,
    addChatMessage,
    updateRideStatus,
    getRideDetails,
    cancelRide,
    getAllRides,
    findRides,
} = require('../controllers/rideController');

// Routes for rides
router.post('/book', bookRide);
router.get('/', getAllRides);
router.get('/find/:captainId', findRides);
router.put('/update/:id', updateRideStatus);
router.post('/:id/verify-otp', verifyOtp);
router.post('/:id/sos', triggerSos);
router.post('/:id/feedback', submitFeedback);
router.post('/:id/chat', addChatMessage);
router.get('/:id', getRideDetails);
router.delete('/cancel/:id', cancelRide);

module.exports = router;

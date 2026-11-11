const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    loginAdmin,
    getCounts,
    getAllDrivers,
    updateDriverStatus,
    addDriver,
    getAllBookings,
    getIncomeDetails,
    resolveSos,
    getFeedbackFeed,
} = require('../controllers/adminController');

// Routes for admin
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/counts', getCounts);
router.get('/drivers', getAllDrivers);
router.put('/drivers/:id/status', updateDriverStatus);
router.post('/drivers', addDriver);
router.get('/bookings', getAllBookings);
router.put('/rides/:id/resolve-sos', resolveSos);
router.get('/feedback', getFeedbackFeed);
router.get('/income', getIncomeDetails);

module.exports = router;

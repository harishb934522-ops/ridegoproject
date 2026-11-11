const express = require('express');
const router = express.Router();
const {
    getCoupons,
    validateCoupon,
    createCoupon,
    toggleCoupon,
    deleteCoupon,
} = require('../controllers/couponController');

router.get('/', getCoupons);
router.post('/validate', validateCoupon);
router.post('/admin', createCoupon);
router.put('/admin/:id/toggle', toggleCoupon);
router.delete('/admin/:id', deleteCoupon);

module.exports = router;


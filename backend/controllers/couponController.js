const Coupon = require('../models/couponModel');
const asyncHandler = require('express-async-handler');

// Ensure default coupons exist
const seedDefaultCoupons = async () => {
    const count = await Coupon.countDocuments();
    if (count === 0) {
        await Coupon.create([
            {
                code: 'RIDEGO50',
                discountPercent: 50,
                maxDiscount: 75,
                minFare: 50,
                description: '50% OFF up to ₹75 on any ride',
                isActive: true
            },
            {
                code: 'FIRSTFREE',
                flatDiscount: 50,
                maxDiscount: 50,
                minFare: 50,
                description: 'Flat ₹50 OFF on your ride',
                isActive: true
            },
            {
                code: 'WEEKEND20',
                discountPercent: 20,
                maxDiscount: 40,
                minFare: 50,
                description: '20% OFF weekend special',
                isActive: true
            },
            {
                code: 'RAPID10',
                discountPercent: 10,
                maxDiscount: 20,
                minFare: 40,
                description: '10% instant discount',
                isActive: true
            }
        ]);
    }
};

// @desc Get all coupons
// @route GET /api/coupons
const getCoupons = asyncHandler(async (req, res) => {
    await seedDefaultCoupons();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ result: 'Success', coupons });
});

// @desc Validate coupon
// @route POST /api/coupons/validate
const validateCoupon = asyncHandler(async (req, res) => {
    await seedDefaultCoupons();
    const { code, fare } = req.body;

    if (!code) {
        return res.status(400).json({ result: 'Error', message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) {
        return res.status(404).json({ result: 'Error', message: 'Invalid or expired coupon code' });
    }

    const currentFare = Number(fare) || 0;
    if (currentFare < coupon.minFare) {
        return res.status(400).json({
            result: 'Error',
            message: `Minimum ride fare must be ₹${coupon.minFare} to use this coupon`
        });
    }

    let discount = 0;
    if (coupon.flatDiscount > 0) {
        discount = coupon.flatDiscount;
    } else if (coupon.discountPercent > 0) {
        discount = Math.round((currentFare * coupon.discountPercent) / 100);
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
    }

    discount = Math.min(discount, currentFare);
    const finalFare = Math.max(currentFare - discount, 0);

    res.json({
        result: 'Success',
        message: `Coupon ${coupon.code} applied successfully!`,
        coupon: {
            code: coupon.code,
            discount,
            finalFare,
            description: coupon.description
        }
    });
});

// @desc Admin create coupon
// @route POST /api/coupons/admin
const createCoupon = asyncHandler(async (req, res) => {
    const { code, discountPercent, flatDiscount, maxDiscount, minFare, description } = req.body;

    if (!code) {
        return res.status(400).json({ result: 'Error', message: 'Coupon code is required' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
        return res.status(400).json({ result: 'Error', message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
        code: code.toUpperCase().trim(),
        discountPercent: Number(discountPercent) || 0,
        flatDiscount: Number(flatDiscount) || 0,
        maxDiscount: Number(maxDiscount) || 100,
        minFare: Number(minFare) || 40,
        description: description || 'Promotional coupon',
        isActive: true
    });

    res.status(201).json({ result: 'Success', message: 'Coupon created successfully', coupon });
});

// @desc Admin toggle coupon status
// @route PUT /api/coupons/admin/:id/toggle
const toggleCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        return res.status(404).json({ result: 'Error', message: 'Coupon not found' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({ result: 'Success', message: `Coupon is now ${coupon.isActive ? 'Active' : 'Inactive'}`, coupon });
});

// @desc Admin delete coupon
// @route DELETE /api/coupons/admin/:id
const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
        return res.status(404).json({ result: 'Error', message: 'Coupon not found' });
    }
    res.json({ result: 'Success', message: 'Coupon deleted successfully' });
});

module.exports = {
    getCoupons,
    validateCoupon,
    createCoupon,
    toggleCoupon,
    deleteCoupon,
    seedDefaultCoupons
};


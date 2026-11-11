const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    discountPercent: {
        type: Number,
        default: 0,
    },
    flatDiscount: {
        type: Number,
        default: 0,
    },
    maxDiscount: {
        type: Number,
        default: 100,
    },
    minFare: {
        type: Number,
        default: 40,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usageCount: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        default: 'Ride discount coupon',
    }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);


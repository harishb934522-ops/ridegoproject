const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const captainSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        wallet: {
            type: Number,
            default: 0,
        },
        approvedRides: {
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            default: 4.9,
        },
        status: {
            type: String,
            enum: ['Active', 'Busy', 'Offline'],
            default: 'Active',
        },
        vehicleDetails: {
            type: {
                type: String,
                required: true,
            },
            vehicleNumber: {
                type: String,
                required: true,
            },
            vehicleModel: {
                type: String,
                default: 'Standard',
            },
        },
    },
    { timestamps: true }
);

captainSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

captainSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('Captain', captainSchema);

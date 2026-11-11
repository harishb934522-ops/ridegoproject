const mongoose = require('mongoose');

const chatMessageSchema = mongoose.Schema({
    sender: { type: String, enum: ['rider', 'driver', 'system'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const rideSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    captain: { type: mongoose.Schema.Types.ObjectId, ref: 'Captain' },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    pickup: { type: String },
    drop: { type: String },
    vehicleType: { type: String, default: 'Bike Taxi' },
    distance: { type: String, default: '5.2 km' },
    duration: { type: String, default: '14 mins' },
    price: { type: Number, required: true },
    fare: { type: Number },
    discount: { type: Number, default: 0 },
    appliedCoupon: { type: String, default: '' },
    date: { type: String },
    time: { type: String },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'on the way', 'started', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: { type: String, default: 'pending' }, // 'upi', 'card', 'cash', 'wallet'
    paymentStatus: { type: String, default: 'pending' }, // 'pending', 'completed'
    otp: { type: String, default: '4829' },
    isOtpVerified: { type: Boolean, default: false },
    sosTriggered: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    compliments: [{ type: String }],
    tip: { type: Number, default: 0 },
    parcelDetails: {
        category: { type: String, default: 'Documents' },
        weight: { type: Number, default: 1 },
        recipientPhone: { type: String, default: '' },
    },
    chatMessages: [chatMessageSchema],
}, { timestamps: true });

// Pre-save hook to ensure aliases and defaults are kept in sync
rideSchema.pre('save', function (next) {
    if (!this.pickup) this.pickup = this.startLocation;
    if (!this.drop) this.drop = this.endLocation;
    if (!this.startLocation) this.startLocation = this.pickup;
    if (!this.endLocation) this.endLocation = this.drop;
    if (!this.fare) this.fare = this.price;
    if (!this.price && this.fare) this.price = this.fare;
    if (!this.otp) {
        this.otp = Math.floor(1000 + Math.random() * 9000).toString();
    }
    next();
});

module.exports = mongoose.model('Ride', rideSchema);

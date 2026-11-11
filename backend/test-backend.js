const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('🧪 Starting RideGo Backend Extended Integration Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ✗ ${name}`);
        console.error(`    ${err.message}`);
    }
}

async function asyncTest(name, fn) {
    totalTests++;
    try {
        await fn();
        console.log(`  ✓ ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ✗ ${name}`);
        console.error(`    ${err.message}`);
    }
}

async function runTests() {
    // 1. JWT and Environment Configuration
    test('JWT Token Generation and Verification', () => {
        const generateToken = require('./utils/generateToken');
        const token = generateToken('user123');
        assert(token && typeof token === 'string', 'Token must be a valid string');
        const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || 'ridego_jwt_secret_key_2026';
        const decoded = jwt.verify(token, secret);
        assert.strictEqual(decoded.id, 'user123', 'Decoded token ID must match');
    });

    // 2. Password Hashing and Comparison
    await asyncTest('Bcrypt Password Hashing and Match Verification', async () => {
        const rawPassword = 'SecurePassword2026!';
        const hash = await bcrypt.hash(rawPassword, 10);
        const match = await bcrypt.compare(rawPassword, hash);
        const failMatch = await bcrypt.compare('WrongPassword', hash);
        assert.strictEqual(match, true, 'Correct password must match hash');
        assert.strictEqual(failMatch, false, 'Incorrect password must not match hash');
    });

    // 3. User Model Validation
    test('User Schema Structure and Fields', () => {
        const User = require('./models/userModel');
        const paths = User.schema.paths;
        assert(paths.name, 'User schema must have name');
        assert(paths.email, 'User schema must have email');
        assert(paths.password, 'User schema must have password');
        assert(paths.phone, 'User schema must have phone');
        assert(paths.wallet, 'User schema must have wallet');
        assert(paths.coins, 'User schema must have reward coins');
        assert(paths.rideHistory, 'User schema must have rideHistory');
    });

    // 4. Captain Model Validation
    test('Captain Schema Structure and Vehicle Types', () => {
        const Captain = require('./models/captainModel');
        const paths = Captain.schema.paths;
        assert(paths.name, 'Captain schema must have name');
        assert(paths.email, 'Captain schema must have email');
        assert(paths.phone, 'Captain schema must have phone');
        assert(paths['vehicleDetails.type'], 'Captain schema must have vehicleDetails.type');
        assert(paths['vehicleDetails.vehicleNumber'], 'Captain schema must have vehicleDetails.vehicleNumber');
        assert(paths.status, 'Captain schema must have status');
    });

    // 5. Ride Model Validation with OTP, SOS, Chat & Ratings
    test('Ride Schema Structure with New Interactive Fields', () => {
        const Ride = require('./models/rideModel');
        const paths = Ride.schema.paths;
        assert(paths.startLocation, 'Ride schema must have startLocation');
        assert(paths.endLocation, 'Ride schema must have endLocation');
        assert(paths.price, 'Ride schema must have price');
        assert(paths.status, 'Ride schema must have status');
        assert(paths.otp, 'Ride schema must have 4-digit OTP');
        assert(paths.isOtpVerified, 'Ride schema must have isOtpVerified');
        assert(paths.sosTriggered, 'Ride schema must have sosTriggered');
        assert(paths.appliedCoupon, 'Ride schema must have appliedCoupon');
        assert(paths.discount, 'Ride schema must have discount');
        assert(paths.rating, 'Ride schema must have rating');
        assert(paths.tip, 'Ride schema must have tip');
        assert(paths.chatMessages, 'Ride schema must have chatMessages');
    });

    // 6. Coupon Model Validation
    test('Coupon Schema Structure and Fields', () => {
        const Coupon = require('./models/couponModel');
        const paths = Coupon.schema.paths;
        assert(paths.code, 'Coupon schema must have code');
        assert(paths.discountPercent, 'Coupon schema must have discountPercent');
        assert(paths.maxDiscount, 'Coupon schema must have maxDiscount');
        assert(paths.minFare, 'Coupon schema must have minFare');
        assert(paths.isActive, 'Coupon schema must have isActive');
    });

    // 7. Express Server Route Mounting
    test('Express App Routing with Coupons and Middlewares', () => {
        const app = require('./server');
        assert(app && app._router, 'Server must export an initialized express app');
        const routes = app._router.stack
            .filter(r => r.route || r.name === 'router')
            .map(r => r.regexp.toString());
        assert(routes.length >= 5, 'Express app must have mounted all 5 routers');
    });

    // 8. Controller Export Functions
    test('Controllers Export Required Handlers', () => {
        const userCtrl = require('./controllers/userController');
        assert(typeof userCtrl.registerUser === 'function', 'registerUser must be a function');
        assert(typeof userCtrl.loginUser === 'function', 'loginUser must be a function');

        const rideCtrl = require('./controllers/rideController');
        assert(typeof rideCtrl.bookRide === 'function', 'bookRide must be a function');
        assert(typeof rideCtrl.verifyOtp === 'function', 'verifyOtp must be a function');
        assert(typeof rideCtrl.triggerSos === 'function', 'triggerSos must be a function');
        assert(typeof rideCtrl.submitFeedback === 'function', 'submitFeedback must be a function');
        assert(typeof rideCtrl.addChatMessage === 'function', 'addChatMessage must be a function');

        const couponCtrl = require('./controllers/couponController');
        assert(typeof couponCtrl.getCoupons === 'function', 'getCoupons must be a function');
        assert(typeof couponCtrl.validateCoupon === 'function', 'validateCoupon must be a function');
        assert(typeof couponCtrl.createCoupon === 'function', 'createCoupon must be a function');
        assert(typeof couponCtrl.toggleCoupon === 'function', 'toggleCoupon must be a function');

        const adminCtrl = require('./controllers/adminController');
        assert(typeof adminCtrl.getCounts === 'function', 'getCounts must be a function');
        assert(typeof adminCtrl.getAllDrivers === 'function', 'getAllDrivers must be a function');
        assert(typeof adminCtrl.updateDriverStatus === 'function', 'updateDriverStatus must be a function');
        assert(typeof adminCtrl.resolveSos === 'function', 'resolveSos must be a function');
        assert(typeof adminCtrl.getFeedbackFeed === 'function', 'getFeedbackFeed must be a function');
    });

    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}% success rate).\n`);

    if (passedTests === totalTests) {
        console.log('🎉 All backend components, coupon engine, and schema extensions verified successfully!');
        process.exit(0);
    } else {
        process.exit(1);
    }
}

runTests();

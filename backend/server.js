const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const captainRoutes = require('./routes/captainRoutes');
const adminRoutes = require('./routes/adminRoutes');
const rideRoutes = require('./routes/rideRoutes');
const couponRoutes = require('./routes/couponRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'RideGo Backend API is healthy and operational 🚀',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'RideGo Backend API is running 🚀'
    });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/captains', captainRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/coupons', couponRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    connectDB()
        .then(() => app.listen(PORT, () => console.log(`🚀 RideGo Server running on port ${PORT}`)))
        .catch((error) => {
            console.error(`❌ MongoDB Connection Error: ${error.message}`);
            process.exitCode = 1;
        });
}

module.exports = app;

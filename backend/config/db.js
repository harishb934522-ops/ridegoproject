const mongoose = require('mongoose');

let connectionPromise;

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri && process.env.NODE_ENV === 'production') {
        throw new Error('MONGO_URI must be configured in production');
    }

    if (mongoose.connection.readyState === 1) return mongoose.connection;

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(uri || 'mongodb://127.0.0.1:27017/ridego')
            .then((conn) => {
                console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
                return conn.connection;
            })
            .finally(() => {
                connectionPromise = undefined;
            });
    }

    return connectionPromise;
};

module.exports = connectDB;

const app = require('./server');
const connectDB = require('./config/db');
const getJwtSecret = require('./config/jwt');

module.exports = async (req, res) => {
    getJwtSecret();
    await connectDB();
    return app(req, res);
};

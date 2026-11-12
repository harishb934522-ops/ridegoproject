const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;

    if (process.env.NODE_ENV === 'production') {
        if (!secret || secret.length < 32) {
            throw new Error('JWT_SECRET must be configured with at least 32 characters in production');
        }
    }

    return secret || 'ridego_jwt_secret_key_2026';
};

module.exports = getJwtSecret;

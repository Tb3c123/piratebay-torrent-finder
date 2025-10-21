const { verifyToken } = require('../services/auth');

/**
 * Middleware to authenticate requests using JWT token
 * Adds user info to req.user if authenticated
 */
function authenticateToken(req, res, next) {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        // Verify token
        const decoded = verifyToken(token);

        // Add user info to request
        req.user = {
            userId: decoded.userId,
            username: decoded.username
        };

        next();
    } catch (error) {
        return res.status(403).json({ error: error.message || 'Invalid or expired token' });
    }
}

/**
 * Optional authentication - doesn't fail if no token
 * Used for endpoints that work with or without auth
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = verifyToken(token);
            req.user = {
                userId: decoded.userId,
                username: decoded.username
            };
        } catch (error) {
            // Token invalid, but don't fail - just continue without user
            console.log('Optional auth failed:', error.message);
        }
    }

    next();
}

module.exports = {
    authenticateToken,
    optionalAuth
};

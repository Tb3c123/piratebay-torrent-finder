const { getUserById } = require('../services/auth');

/**
 * Middleware to check if user is admin
 * Must be used after authenticateToken middleware
 */
function requireAdmin(req, res, next) {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user details to check admin status
    const user = getUserById(req.user.userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (!user.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    // Add admin flag to request
    req.user.isAdmin = true;
    next();
}

module.exports = {
    requireAdmin
};

const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

/**
 * Register new user
 * POST /api/auth/register
 * Body: { username, password }
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await authService.registerUser(username, password);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `New user registered: ${username}`, { userId: user.id });
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user
        });
    } catch (error) {
        console.error('Registration error:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'User registration failed', {
                error: error.message,
                username: req.body.username
            });
        }

        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Login user
 * POST /api/auth/login
 * Body: { username, password }
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const result = await authService.loginUser(username, password);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `User logged in: ${username}`, { userId: result.user.id });
        }

        res.json({
            success: true,
            message: 'Login successful',
            token: result.token,
            user: result.user
        });
    } catch (error) {
        console.error('Login error:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Login failed', {
                error: error.message,
                username: req.body.username
            });
        }

        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Logout user
 * POST /api/auth/logout
 * Headers: Authorization: Bearer <token>
 */
router.post('/logout', authenticateToken, (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        authService.logoutUser(token);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `User logged out: ${req.user.username}`, { userId: req.user.userId });
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get current user info
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 */
router.get('/me', authenticateToken, (req, res) => {
    try {
        const user = authService.getUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Change password
 * POST /api/auth/change-password
 * Headers: Authorization: Bearer <token>
 * Body: { oldPassword, newPassword }
 */
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Old and new passwords are required' });
        }

        await authService.changePassword(req.user.userId, oldPassword, newPassword);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Password changed: ${req.user.username}`, { userId: req.user.userId });
        }

        res.json({
            success: true,
            message: 'Password changed successfully. Please login again.'
        });
    } catch (error) {
        console.error('Change password error:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Password change failed', {
                error: error.message,
                userId: req.user.userId
            });
        }

        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get user credentials (API keys, etc.)
 * GET /api/auth/credentials
 * Headers: Authorization: Bearer <token>
 */
router.get('/credentials', authenticateToken, (req, res) => {
    try {
        const credentials = authService.getUserCredentials(req.user.userId);

        res.json({
            success: true,
            credentials: credentials || {}
        });
    } catch (error) {
        console.error('Get credentials error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Update user credentials (API keys, etc.)
 * PUT /api/auth/credentials
 * Headers: Authorization: Bearer <token>
 * Body: { omdb_api_key, qbt_host, qbt_username, qbt_password, jellyfin_host, jellyfin_api_key }
 */
router.put('/credentials', authenticateToken, (req, res) => {
    try {
        authService.updateUserCredentials(req.user.userId, req.body);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Credentials updated: ${req.user.username}`, { userId: req.user.userId });
        }

        res.json({
            success: true,
            message: 'Credentials updated successfully'
        });
    } catch (error) {
        console.error('Update credentials error:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Credentials update failed', {
                error: error.message,
                userId: req.user.userId
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * ADMIN: Get all users
 * GET /api/auth/admin/users
 * Headers: Authorization: Bearer <token>
 */
router.get('/admin/users', authenticateToken, requireAdmin, (req, res) => {
    try {
        const users = authService.getAllUsers();

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Admin viewed all users: ${req.user.username}`, {
                userId: req.user.userId,
                totalUsers: users.length
            });
        }

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * ADMIN: Delete user
 * DELETE /api/auth/admin/users/:userId
 * Headers: Authorization: Bearer <token>
 */
router.delete('/admin/users/:userId', authenticateToken, requireAdmin, (req, res) => {
    try {
        const targetUserId = parseInt(req.params.userId);

        if (isNaN(targetUserId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        authService.deleteUser(targetUserId);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Admin deleted user: ${req.user.username}`, {
                adminId: req.user.userId,
                deletedUserId: targetUserId
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'User deletion failed', {
                error: error.message,
                adminId: req.user.userId
            });
        }

        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

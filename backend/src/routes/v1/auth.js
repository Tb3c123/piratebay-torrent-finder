const express = require('express');
const router = express.Router();
const { AuthService } = require('../../services/auth');
const { authenticateToken } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse } = require('../../utils/response');
const { validateBody } = require('../../middleware/validator');
const { auth: authValidators } = require('../../validators');

/**
 * Check if any users exist in the system (public endpoint)
 * GET /api/auth/check-users
 */
router.get('/check-users',
    asyncHandler(async (req, res) => {
        const users = AuthService.getAllUsers();
        const hasUsers = users.length > 0;
        successResponse(res, { hasUsers });
    })
);

/**
 * Register new user
 * POST /api/auth/register
 * Body: { username, password }
 */
router.post('/register',
    validateBody(authValidators.validateRegistration),
    asyncHandler(async (req, res) => {
        const { username, password } = req.validated;

        const user = await AuthService.register(username, password);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `New user registered: ${username}`, { userId: user.id });
        }

        createdResponse(res, user, 'User registered successfully');
    })
);

/**
 * Login user
 * POST /api/auth/login
 * Body: { username, password }
 */
router.post('/login',
    validateBody(authValidators.validateLogin),
    asyncHandler(async (req, res) => {
        const { username, password } = req.validated;

        const result = await AuthService.login(username, password);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `User logged in: ${username}`, { userId: result.user.id });
        }

        successResponse(res, {
            token: result.token,
            user: result.user
        }, 'Login successful');
    })
);

/**
 * Logout user
 * POST /api/auth/logout
 * Headers: Authorization: Bearer <token>
 */
router.post('/logout',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const token = req.headers['authorization'].split(' ')[1];
        AuthService.logout(token);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `User logged out: ${req.user.username}`, { userId: req.user.userId });
        }

        successResponse(res, null, 'Logout successful');
    })
);

/**
 * Get current user info
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 */
router.get('/me',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const user = AuthService.getUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        successResponse(res, user);
    })
);

/**
 * Change password
 * POST /api/auth/change-password
 * Headers: Authorization: Bearer <token>
 * Body: { oldPassword, newPassword }
 */
router.post('/change-password',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Old and new passwords are required' });
        }

        await AuthService.changePassword(req.user.userId, oldPassword, newPassword);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Password changed: ${req.user.username}`, { userId: req.user.userId });
        }

        successResponse(res, null, 'Password changed successfully. Please login again.');
    })
);

/**
 * Get user credentials (API keys, etc.)
 * GET /api/auth/credentials
 * Headers: Authorization: Bearer <token>
 */
router.get('/credentials',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const credentials = AuthService.getUserCredentials(req.user.userId);
        successResponse(res, credentials || {});
    })
);

/**
 * Update user credentials (API keys, etc.)
 * PUT /api/auth/credentials
 * Headers: Authorization: Bearer <token>
 * Body: { omdb_api_key, qbt_host, qbt_username, qbt_password, jellyfin_host, jellyfin_api_key }
 */
router.put('/credentials',
    authenticateToken,
    asyncHandler(async (req, res) => {
        AuthService.updateUserCredentials(req.user.userId, req.body);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Credentials updated: ${req.user.username}`, { userId: req.user.userId });
        }

        successResponse(res, null, 'Credentials updated successfully');
    })
);

/**
 * ADMIN: Get all users
 * GET /api/auth/admin/users
 * Headers: Authorization: Bearer <token>
 */
router.get('/admin/users',
    authenticateToken,
    requireAdmin,
    asyncHandler(async (req, res) => {
        const users = AuthService.getAllUsers();

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Admin viewed all users: ${req.user.username}`, {
                userId: req.user.userId,
                totalUsers: users.length
            });
        }

        successResponse(res, users);
    })
);

/**
 * ADMIN: Delete user
 * DELETE /api/auth/admin/users/:userId
 * Headers: Authorization: Bearer <token>
 */
router.delete('/admin/users/:userId',
    authenticateToken,
    requireAdmin,
    asyncHandler(async (req, res) => {
        const targetUserId = parseInt(req.params.userId);

        if (isNaN(targetUserId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        AuthService.deleteUser(targetUserId);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Admin deleted user: ${req.user.username}`, {
                adminId: req.user.userId,
                deletedUserId: targetUserId
            });
        }

        successResponse(res, null, 'User deleted successfully');
    })
);

module.exports = router;

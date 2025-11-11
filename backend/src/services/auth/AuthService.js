/**
 * Auth Service
 * Main authentication service that orchestrates user management, password handling, and tokens
 */

const db = require('../../database/init');
const PasswordService = require('./PasswordService');
const TokenService = require('./TokenService');

class AuthService {
    /**
     * Validate username
     * @param {string} username - Username to validate
     * @throws {Error} If username is invalid
     */
    static validateUsername(username) {
        if (!username || typeof username !== 'string') {
            throw new Error('Username is required');
        }
        if (username.length < 3) {
            throw new Error('Username must be at least 3 characters long');
        }
        if (username.length > 50) {
            throw new Error('Username must be less than 50 characters');
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            throw new Error('Username can only contain letters, numbers, hyphens, and underscores');
        }
    }

    /**
     * Check if username already exists
     * @param {string} username - Username to check
     * @returns {boolean} True if username exists
     */
    static usernameExists(username) {
        const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
        return !!user;
    }

    /**
     * Get user count
     * @returns {number} Number of users
     */
    static getUserCount() {
        const result = db.prepare('SELECT COUNT(*) as count FROM users').get();
        return result.count;
    }

    /**
     * Register a new user
     * @param {string} username - Username
     * @param {string} password - Plain text password
     * @returns {Promise<Object>} User object (without password)
     */
    static async register(username, password) {
        // Validate input
        this.validateUsername(username);
        PasswordService.validatePassword(password);

        // Check if username already exists
        if (this.usernameExists(username)) {
            throw new Error('Username already exists');
        }

        // Check if this is the first user (will be admin)
        const isFirstUser = this.getUserCount() === 0;

        // Hash password
        const passwordHash = await PasswordService.hash(password);

        // Insert user (first user is automatically admin)
        const result = db.prepare(`
            INSERT INTO users (username, password_hash, is_admin)
            VALUES (?, ?, ?)
        `).run(username, passwordHash, isFirstUser ? 1 : 0);

        const userId = result.lastInsertRowid;

        // Create empty credentials entry for user
        db.prepare(`
            INSERT INTO user_credentials (user_id)
            VALUES (?)
        `).run(userId);

        // Get created user
        const user = this.getUserById(userId);

        if (isFirstUser) {
            console.log(`✓ Admin user registered: ${username} (ID: ${userId})`);
        } else {
            console.log(`✓ User registered: ${username} (ID: ${userId})`);
        }

        return user;
    }

    /**
     * Login user and generate JWT token
     * @param {string} username - Username
     * @param {string} password - Plain text password
     * @returns {Promise<Object>} { token, user }
     */
    static async login(username, password) {
        // Get user with password hash
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

        if (!user) {
            throw new Error('Invalid username or password');
        }

        // Verify password
        await PasswordService.verify(password, user.password_hash, 'Invalid username or password');

        // Generate JWT token
        const token = TokenService.generateToken(user);

        // Store session
        TokenService.createSession(user.id, token);

        console.log(`✓ User logged in: ${username}`);

        // Return token and user info (without password)
        return {
            token,
            user: this.sanitizeUser(user)
        };
    }

    /**
     * Verify JWT token and return user
     * @param {string} token - JWT token
     * @returns {Object} User object
     */
    static verifyToken(token) {
        return TokenService.verifyTokenWithSession(token);
    }

    /**
     * Logout user (invalidate token)
     * @param {string} token - JWT token
     * @returns {boolean} True if logout successful
     */
    static logout(token) {
        const deleted = TokenService.deleteSession(token);
        if (deleted) {
            console.log('✓ User logged out');
        }
        return deleted;
    }

    /**
     * Get user by ID
     * @param {number} userId - User ID
     * @returns {Object|null} User object (without password)
     */
    static getUserById(userId) {
        const user = db.prepare('SELECT id, username, is_admin, created_at FROM users WHERE id = ?').get(userId);
        return user ? this.sanitizeUser(user) : null;
    }

    /**
     * Get user by username
     * @param {string} username - Username
     * @returns {Object|null} User object (without password)
     */
    static getUserByUsername(username) {
        const user = db.prepare('SELECT id, username, is_admin, created_at FROM users WHERE username = ?').get(username);
        return user ? this.sanitizeUser(user) : null;
    }

    /**
     * Get all users (admin only)
     * @returns {Array} List of users (without passwords)
     */
    static getAllUsers() {
        const users = db.prepare('SELECT id, username, is_admin, created_at FROM users ORDER BY id ASC').all();
        return users.map(user => this.sanitizeUser(user));
    }

    /**
     * Delete user (admin only)
     * @param {number} userId - User ID
     * @throws {Error} If user is admin or not found
     */
    static deleteUser(userId) {
        // Don't allow deleting admin user (ID 1)
        if (userId === 1) {
            throw new Error('Cannot delete the admin user');
        }

        const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);

        if (result.changes === 0) {
            throw new Error('User not found');
        }

        // Also delete all sessions for this user
        TokenService.deleteUserSessions(userId);

        console.log(`✓ User deleted: ID ${userId}`);
        return true;
    }

    /**
     * Change user password
     * @param {number} userId - User ID
     * @param {string} oldPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<boolean>} True if password changed
     */
    static async changePassword(userId, oldPassword, newPassword) {
        // Get user with password hash
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Verify old password
        await PasswordService.verify(oldPassword, user.password_hash, 'Current password is incorrect');

        // Validate new password
        PasswordService.validatePassword(newPassword);

        // Hash new password
        const newPasswordHash = await PasswordService.hash(newPassword);

        // Update password
        db.prepare(`
            UPDATE users
            SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(newPasswordHash, userId);

        // Invalidate all existing sessions for this user (force re-login)
        TokenService.deleteUserSessions(userId);

        console.log(`✓ Password changed for user ID: ${userId}`);
        return true;
    }

    /**
     * Get user credentials
     * @param {number} userId - User ID
     * @returns {Object|null} User credentials
     */
    static getUserCredentials(userId) {
        const credentials = db.prepare(`
            SELECT * FROM user_credentials WHERE user_id = ?
        `).get(userId);
        return credentials || null;
    }

    /**
     * Update user credentials
     * @param {number} userId - User ID
     * @param {Object} credentials - Credentials object
     * @returns {boolean} True if updated
     */
    static updateUserCredentials(userId, credentials) {
        const {
            omdb_api_key,
            qbt_host,
            qbt_username,
            qbt_password,
            jellyfin_host,
            jellyfin_api_key
        } = credentials;

        // Check if credentials exist
        const existing = db.prepare('SELECT id FROM user_credentials WHERE user_id = ?').get(userId);

        if (existing) {
            // Update existing
            db.prepare(`
                UPDATE user_credentials
                SET omdb_api_key = ?,
                    qbt_host = ?,
                    qbt_username = ?,
                    qbt_password = ?,
                    jellyfin_host = ?,
                    jellyfin_api_key = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `).run(
                omdb_api_key || null,
                qbt_host || null,
                qbt_username || null,
                qbt_password || null,
                jellyfin_host || null,
                jellyfin_api_key || null,
                userId
            );
        } else {
            // Insert new
            db.prepare(`
                INSERT INTO user_credentials
                (user_id, omdb_api_key, qbt_host, qbt_username, qbt_password, jellyfin_host, jellyfin_api_key)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                userId,
                omdb_api_key || null,
                qbt_host || null,
                qbt_username || null,
                qbt_password || null,
                jellyfin_host || null,
                jellyfin_api_key || null
            );
        }

        console.log(`✓ Credentials updated for user ID: ${userId}`);
        return true;
    }

    /**
     * Sanitize user object (remove password, convert is_admin to boolean)
     * @param {Object} user - Raw user object from database
     * @returns {Object} Sanitized user object
     */
    static sanitizeUser(user) {
        if (!user) return null;

        const sanitized = { ...user };
        
        // Remove password_hash if present
        delete sanitized.password_hash;
        
        // Convert is_admin to boolean
        if ('is_admin' in sanitized) {
            sanitized.is_admin = sanitized.is_admin === 1;
        }

        return sanitized;
    }
}

module.exports = AuthService;

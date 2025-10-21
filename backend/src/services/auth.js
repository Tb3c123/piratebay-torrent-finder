const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days
const SALT_ROUNDS = 10;

/**
 * Register a new user
 * @param {string} username
 * @param {string} password
 * @returns {Object} User object (without password)
 */
async function registerUser(username, password) {
    // Validate input
    if (!username || username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
    }
    if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
    }

    // Check if username already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
        throw new Error('Username already exists');
    }

    // Check if this is the first user (will be admin)
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const isFirstUser = userCount.count === 0;

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

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
    const user = db.prepare('SELECT id, username, is_admin, created_at FROM users WHERE id = ?').get(userId);

    if (isFirstUser) {
        console.log(`✓ Admin user registered: ${username} (ID: ${userId})`);
    } else {
        console.log(`✓ User registered: ${username} (ID: ${userId})`);
    }

    return user;
}

/**
 * Login user and generate JWT token
 * @param {string} username
 * @param {string} password
 * @returns {Object} { token, user }
 */
async function loginUser(username, password) {
    // Get user with password hash
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
        throw new Error('Invalid username or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
        throw new Error('Invalid username or password');
    }

    // Generate JWT token
    const token = jwt.sign(
        {
            userId: user.id,
            username: user.username
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    // Store session (optional - for tracking active sessions)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    db.prepare(`
        INSERT INTO sessions (user_id, token, expires_at)
        VALUES (?, ?, ?)
    `).run(user.id, token, expiresAt.toISOString());

    console.log(`✓ User logged in: ${username}`);

    // Return token and user info (without password)
    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            is_admin: user.is_admin === 1,
            created_at: user.created_at
        }
    };
}

/**
 * Verify JWT token
 * @param {string} token
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if session exists and is not expired
        const session = db.prepare(`
            SELECT * FROM sessions
            WHERE token = ? AND expires_at > datetime('now')
        `).get(token);

        if (!session) {
            throw new Error('Session expired or invalid');
        }

        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Logout user (invalidate token)
 * @param {string} token
 */
function logoutUser(token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    console.log('✓ User logged out');
}

/**
 * Get user by ID
 * @param {number} userId
 * @returns {Object} User object
 */
function getUserById(userId) {
    const user = db.prepare('SELECT id, username, is_admin, created_at FROM users WHERE id = ?').get(userId);
    if (user) {
        user.is_admin = user.is_admin === 1;
    }
    return user;
}

/**
 * Get all users (admin only)
 * @returns {Array} List of users
 */
function getAllUsers() {
    const users = db.prepare('SELECT id, username, is_admin, created_at FROM users ORDER BY id ASC').all();
    return users.map(user => ({
        ...user,
        is_admin: user.is_admin === 1
    }));
}

/**
 * Delete user (admin only)
 * @param {number} userId
 */
function deleteUser(userId) {
    // Don't allow deleting admin user (ID 1)
    if (userId === 1) {
        throw new Error('Cannot delete the admin user');
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    if (result.changes === 0) {
        throw new Error('User not found');
    }

    console.log(`✓ User deleted: ID ${userId}`);
}/**
 * Change user password
 * @param {number} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 */
async function changePassword(userId, oldPassword, newPassword) {
    // Get user with password hash
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isValid) {
        throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    db.prepare(`
        UPDATE users
        SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(newPasswordHash, userId);

    // Invalidate all existing sessions for this user (force re-login)
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);

    console.log(`✓ Password changed for user ID: ${userId}`);
}

/**
 * Get user credentials
 * @param {number} userId
 * @returns {Object} User credentials
 */
function getUserCredentials(userId) {
    const credentials = db.prepare(`
        SELECT * FROM user_credentials WHERE user_id = ?
    `).get(userId);
    return credentials || null;
}

/**
 * Update user credentials
 * @param {number} userId
 * @param {Object} credentials
 */
function updateUserCredentials(userId, credentials) {
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
}

module.exports = {
    registerUser,
    loginUser,
    verifyToken,
    logoutUser,
    getUserById,
    getAllUsers,
    deleteUser,
    changePassword,
    getUserCredentials,
    updateUserCredentials
};

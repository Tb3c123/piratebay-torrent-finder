/**
 * Token Service
 * Handles JWT token generation, verification, and session management
 */

const jwt = require('jsonwebtoken');
const db = require('../../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // Token valid for 7 days

class TokenService {
    /**
     * Generate JWT token for user
     * @param {Object} user - User object with id and username
     * @returns {string} JWT token
     */
    static generateToken(user) {
        if (!user || !user.id || !user.username) {
            throw new Error('Invalid user object for token generation');
        }

        return jwt.sign(
            {
                userId: user.id,
                username: user.username,
                iat: Math.floor(Date.now() / 1000) // Ensure unique tokens
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    /**
     * Verify and decode JWT token
     * @param {string} token - JWT token
     * @returns {Object} Decoded token payload
     * @throws {Error} If token is invalid or expired
     */
    static verifyToken(token) {
        if (!token) {
            throw new Error('Token is required');
        }

        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            throw new Error('Token verification failed');
        }
    }

    /**
     * Create session in database
     * @param {number} userId - User ID
     * @param {string} token - JWT token
     * @returns {Object} Session info
     */
    static createSession(userId, token) {
        const expiresAt = new Date(Date.now() + this.getExpirationMs());

        const stmt = db.prepare(`
            INSERT INTO sessions (user_id, token, expires_at)
            VALUES (?, ?, ?)
        `);

        stmt.run(userId, token, expiresAt.toISOString());

        return {
            userId,
            token,
            expiresAt
        };
    }

    /**
     * Verify token and check session validity
     * @param {string} token - JWT token
     * @returns {Object} Decoded token payload
     * @throws {Error} If token or session is invalid
     */
    static verifyTokenWithSession(token) {
        // First verify JWT signature and expiration
        const decoded = this.verifyToken(token);

        // Then check if session exists in database and is not expired
        const session = db.prepare(`
            SELECT * FROM sessions
            WHERE token = ? AND expires_at > datetime('now')
        `).get(token);

        if (!session) {
            throw new Error('Session expired or invalid');
        }

        return decoded;
    }

    /**
     * Delete session (logout)
     * @param {string} token - JWT token
     * @returns {boolean} True if session was deleted
     */
    static deleteSession(token) {
        const result = db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
        return result.changes > 0;
    }

    /**
     * Delete all sessions for a user
     * @param {number} userId - User ID
     * @returns {number} Number of sessions deleted
     */
    static deleteUserSessions(userId) {
        const result = db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
        return result.changes;
    }

    /**
     * Get all active sessions for a user
     * @param {number} userId - User ID
     * @returns {Array} List of active sessions
     */
    static getUserSessions(userId) {
        return db.prepare(`
            SELECT * FROM sessions
            WHERE user_id = ? AND expires_at > datetime('now')
            ORDER BY created_at DESC
        `).all(userId);
    }

    /**
     * Clean up expired sessions
     * @returns {number} Number of sessions deleted
     */
    static cleanupExpiredSessions() {
        const result = db.prepare(`
            DELETE FROM sessions
            WHERE expires_at <= datetime('now')
        `).run();

        return result.changes;
    }

    /**
     * Get expiration time in milliseconds
     * @returns {number} Expiration time in ms
     */
    static getExpirationMs() {
        const match = JWT_EXPIRES_IN.match(/^(\d+)([smhd])$/);
        if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return 7 * 24 * 60 * 60 * 1000;
        }
    }
}

module.exports = TokenService;

/**
 * Password Service
 * Handles password hashing, validation, and comparison
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

class PasswordService {
    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @throws {Error} If password is invalid
     */
    static validatePassword(password) {
        if (!password || typeof password !== 'string') {
            throw new Error('Password is required');
        }
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        // Add more validation rules here if needed
        // e.g., must contain uppercase, lowercase, numbers, etc.
    }

    /**
     * Hash a password
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Hashed password
     */
    static async hash(password) {
        this.validatePassword(password);
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    /**
     * Compare password with hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {Promise<boolean>} True if password matches
     */
    static async compare(password, hash) {
        if (!password || !hash) {
            return false;
        }
        return bcrypt.compare(password, hash);
    }

    /**
     * Verify password matches hash and throw error if not
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @param {string} errorMessage - Custom error message
     * @throws {Error} If password doesn't match
     */
    static async verify(password, hash, errorMessage = 'Invalid password') {
        const isValid = await this.compare(password, hash);
        if (!isValid) {
            throw new Error(errorMessage);
        }
        return true;
    }
}

module.exports = PasswordService;

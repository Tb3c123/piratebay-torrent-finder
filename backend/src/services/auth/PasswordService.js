/**
 * Password Service
 * Handles password hashing, validation, and comparison with LRU cache
 */

const bcrypt = require('bcryptjs');
const { LRUCache } = require('lru-cache');

const SALT_ROUNDS = 10;

// LRU Cache for password comparison results
// Cache successful comparisons to reduce bcrypt overhead
const comparisonCache = new LRUCache({
    max: 500, // Maximum 500 entries
    ttl: 1000 * 60 * 5, // 5 minutes TTL
    updateAgeOnGet: true,
});

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
     * Uses LRU cache to reduce bcrypt overhead for repeated comparisons
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {Promise<boolean>} True if password matches
     */
    static async compare(password, hash) {
        if (!password || !hash) {
            return false;
        }

        // Create cache key from password + hash
        const cacheKey = `${password}:${hash}`;

        // Check cache first
        const cached = comparisonCache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }

        // Perform bcrypt comparison
        const result = await bcrypt.compare(password, hash);

        // Cache only successful comparisons
        if (result) {
            comparisonCache.set(cacheKey, result);
        }

        return result;
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

    /**
     * Clear the password comparison cache
     * Useful for security or testing purposes
     */
    static clearCache() {
        comparisonCache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    static getCacheStats() {
        return {
            size: comparisonCache.size,
            max: comparisonCache.max,
        };
    }
}

module.exports = PasswordService;

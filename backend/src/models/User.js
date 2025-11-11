/**
 * User Model
 * Represents a user in the system
 */

class User {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.password = data.password; // hashed
        this.createdAt = data.created_at || data.createdAt;
        this.updatedAt = data.updated_at || data.updatedAt;
    }

    /**
     * Convert to plain object (for API responses)
     * Excludes sensitive data like password
     */
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Convert to database format
     */
    toDatabase() {
        return {
            id: this.id,
            username: this.username,
            password: this.password,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }

    /**
     * Create User instance from database row
     */
    static fromDatabase(row) {
        if (!row) return null;
        return new User({
            id: row.id,
            username: row.username,
            password: row.password,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }

    /**
     * Validate user data
     */
    static validate(data) {
        const errors = {};

        if (!data.username || data.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        if (!data.password || data.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

module.exports = User;

/**
 * Log Model
 * Represents a system log entry
 */

class Log {
    constructor(data) {
        this.id = data.id;
        this.userId = data.user_id || data.userId;
        this.action = data.action;
        this.details = data.details;
        this.timestamp = data.timestamp || new Date().toISOString();
        this.level = data.level || 'info'; // info, warning, error
    }

    /**
     * Convert to plain object (for API responses)
     */
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            action: this.action,
            details: this.details,
            timestamp: this.timestamp,
            level: this.level
        };
    }

    /**
     * Convert to database format
     */
    toDatabase() {
        // Convert details object to JSON string for database storage
        const detailsStr = typeof this.details === 'object'
            ? JSON.stringify(this.details)
            : this.details;

        return {
            id: this.id,
            user_id: this.userId,
            action: this.action,
            details: detailsStr,
            timestamp: this.timestamp,
            level: this.level
        };
    }

    /**
     * Create Log instance from database row
     */
    static fromDatabase(row) {
        if (!row) return null;
        return new Log({
            id: row.id,
            user_id: row.user_id,
            action: row.action,
            details: row.details,
            timestamp: row.timestamp,
            level: row.level
        });
    }

    /**
     * Create log entry
     */
    static create(userId, action, details = '', level = 'info') {
        return new Log({
            userId,
            action,
            details,
            level,
            timestamp: Date.now() // Use integer timestamp for database
        });
    }

    /**
     * Create info log
     */
    static info(userId, action, details = '') {
        return Log.create(userId, action, details, 'info');
    }

    /**
     * Create warning log
     */
    static warning(userId, action, details = '') {
        return Log.create(userId, action, details, 'warning');
    }

    /**
     * Create error log
     */
    static error(userId, action, details = '') {
        return Log.create(userId, action, details, 'error');
    }
}

module.exports = Log;

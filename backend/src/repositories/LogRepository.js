/**
 * Log Repository
 * Handles all database operations for system logs
 * Uses better-sqlite3 (synchronous API)
 */

const { Log } = require('../models');

class LogRepository {
    constructor(db) {
        this.db = db;
    }

    /**
     * Find logs by user ID
     */
    findByUserId(userId, limit = 100) {
        const rows = this.db.prepare(
            'SELECT * FROM logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?'
        ).all(userId, limit);

        return rows.map(row => Log.fromDatabase(row));
    }

    /**
     * Find all logs (admin)
     */
    findAll(limit = 200) {
        const rows = this.db.prepare(
            'SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?'
        ).all(limit);

        return rows.map(row => Log.fromDatabase(row));
    }

    /**
     * Find logs by level
     */
    findByLevel(level, limit = 100) {
        const rows = this.db.prepare(
            'SELECT * FROM logs WHERE level = ? ORDER BY timestamp DESC LIMIT ?'
        ).all(level, limit);

        return rows.map(row => Log.fromDatabase(row));
    }

    /**
     * Create log entry
     * Supports both object parameter and individual parameters for backward compatibility
     */
    create(userIdOrData, action, details = '', level = 'info') {
        let log;

        if (typeof userIdOrData === 'object' && userIdOrData !== null) {
            // New style: create({ userId, action, details, level })
            const data = userIdOrData;
            log = Log.create(
                data.userId || null,
                data.action,
                data.details || '',
                data.level || 'info'
            );
        } else {
            // Old style: create(userId, action, details, level)
            log = Log.create(userIdOrData, action, details, level);
        }

        const data = log.toDatabase();

        const stmt = this.db.prepare(
            'INSERT INTO logs (user_id, action, details, timestamp, level) VALUES (?, ?, ?, ?, ?)'
        );
        const info = stmt.run(data.user_id, data.action, data.details, data.timestamp, data.level);

        const row = this.db.prepare('SELECT * FROM logs WHERE id = ?').get(info.lastInsertRowid);
        return Log.fromDatabase(row);
    }

    /**
     * Create info log
     */
    info(userId, action, details = '') {
        return this.create(userId, action, details, 'info');
    }

    /**
     * Create warning log
     */
    warning(userId, action, details = '') {
        return this.create(userId, action, details, 'warning');
    }

    /**
     * Create error log
     */
    error(userId, action, details = '') {
        return this.create(userId, action, details, 'error');
    }

    /**
     * Delete log entry
     */
    delete(id) {
        const stmt = this.db.prepare('DELETE FROM logs WHERE id = ?');
        stmt.run(id);
        return true;
    }

    /**
     * Clear logs for user
     */
    clearByUserId(userId) {
        const stmt = this.db.prepare('DELETE FROM logs WHERE user_id = ?');
        stmt.run(userId);
        return true;
    }

    /**
     * Clear all logs (admin)
     */
    clearAll() {
        const stmt = this.db.prepare('DELETE FROM logs');
        stmt.run();
        return true;
    }

    /**
     * Clear old logs (older than X days)
     */
    clearOldLogs(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffTimestamp = cutoffDate.toISOString();

        const stmt = this.db.prepare('DELETE FROM logs WHERE timestamp < ?');
        const info = stmt.run(cutoffTimestamp);

        return info.changes; // Return number of deleted rows
    }

    /**
     * Count logs by user
     */
    countByUserId(userId) {
        const row = this.db.prepare(
            'SELECT COUNT(*) as count FROM logs WHERE user_id = ?'
        ).get(userId);

        return row.count;
    }

    /**
     * Count logs by level
     */
    countByLevel(level) {
        const row = this.db.prepare(
            'SELECT COUNT(*) as count FROM logs WHERE level = ?'
        ).get(level);

        return row.count;
    }

    /**
     * Get log statistics
     */
    getStatistics() {
        const rows = this.db.prepare(
            `SELECT level, COUNT(*) as count
             FROM logs
             GROUP BY level`
        ).all();

        const stats = {
            total: 0,
            byLevel: {},
            info: 0,
            warning: 0,
            error: 0,
            success: 0,
            debug: 0
        };

        rows.forEach(row => {
            stats.byLevel[row.level] = row.count;
            stats[row.level] = row.count;
            stats.total += row.count;
        });

        return stats;
    }
}

module.exports = LogRepository;

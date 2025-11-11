/**
 * Search History Repository
 * Handles all database operations for search history
 * Uses better-sqlite3 (synchronous API)
 */

const { SearchHistory } = require('../models');

class SearchHistoryRepository {
    constructor(db) {
        this.db = db;
    }

    /**
     * Find history by user ID
     */
    findByUserId(userId, limit = 50) {
        const rows = this.db.prepare(
            'SELECT * FROM search_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?'
        ).all(userId, limit);

        return rows.map(row => SearchHistory.fromDatabase(row));
    }

    /**
     * Find all history (admin)
     */
    findAll(limit = 100) {
        const rows = this.db.prepare(
            'SELECT * FROM search_history ORDER BY timestamp DESC LIMIT ?'
        ).all(limit);

        return rows.map(row => SearchHistory.fromDatabase(row));
    }

    /**
     * Add search to history
     */
    create(data) {
        const history = typeof data === 'object' && data.userId
            ? SearchHistory.create(data.userId, data.query, data.category || 'all')
            : SearchHistory.create(data, arguments[1], arguments[2] || 'all'); // Backward compatibility

        const dbData = history.toDatabase();

        const stmt = this.db.prepare(
            'INSERT INTO search_history (user_id, query, category, timestamp) VALUES (?, ?, ?, ?)'
        );
        const info = stmt.run(dbData.user_id, dbData.query, dbData.category, dbData.timestamp);

        const row = this.db.prepare('SELECT * FROM search_history WHERE id = ?').get(info.lastInsertRowid);
        return SearchHistory.fromDatabase(row);
    }

    /**
     * Delete duplicate entry (same user, query, category)
     */
    deleteDuplicate(userId, query, category) {
        const stmt = this.db.prepare(
            'DELETE FROM search_history WHERE user_id = ? AND LOWER(query) = LOWER(?) AND category = ?'
        );
        const info = stmt.run(userId, query, category);
        return info.changes;
    }

    /**
     * Delete by ID
     */
    deleteById(id) {
        const stmt = this.db.prepare('DELETE FROM search_history WHERE id = ?');
        stmt.run(id);
        return true;
    }

    /**
     * Delete entries older than cutoff date
     */
    deleteOlderThan(cutoffTimestamp) {
        const stmt = this.db.prepare('DELETE FROM search_history WHERE timestamp < ?');
        const info = stmt.run(cutoffTimestamp);
        return info.changes;
    }

    /**
     * Delete entries by user ID
     */
    deleteByUserId(userId) {
        const stmt = this.db.prepare('DELETE FROM search_history WHERE user_id = ?');
        const info = stmt.run(userId);
        return info.changes;
    }

    /**
     * Get statistics
     */
    getStatistics(userId = null) {
        const retentionDays = 30;
        const cutoffDate = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);

        let totalQuery, oldEntriesQuery, oldestQuery, newestQuery;

        if (userId) {
            totalQuery = this.db.prepare('SELECT COUNT(*) as count FROM search_history WHERE user_id = ?');
            oldEntriesQuery = this.db.prepare('SELECT COUNT(*) as count FROM search_history WHERE user_id = ? AND timestamp <= ?');
            oldestQuery = this.db.prepare('SELECT MIN(timestamp) as timestamp FROM search_history WHERE user_id = ?');
            newestQuery = this.db.prepare('SELECT MAX(timestamp) as timestamp FROM search_history WHERE user_id = ?');
        } else {
            totalQuery = this.db.prepare('SELECT COUNT(*) as count FROM search_history');
            oldEntriesQuery = this.db.prepare('SELECT COUNT(*) as count FROM search_history WHERE timestamp <= ?');
            oldestQuery = this.db.prepare('SELECT MIN(timestamp) as timestamp FROM search_history');
            newestQuery = this.db.prepare('SELECT MAX(timestamp) as timestamp FROM search_history');
        }

        const total = userId ? totalQuery.get(userId).count : totalQuery.get().count;
        const oldEntriesCount = userId ? oldEntriesQuery.get(userId, cutoffDate).count : oldEntriesQuery.get(cutoffDate).count;
        const oldestEntry = userId ? oldestQuery.get(userId).timestamp : oldestQuery.get().timestamp;
        const newestEntry = userId ? newestQuery.get(userId).timestamp : newestQuery.get().timestamp;

        return {
            total,
            oldEntriesCount,
            oldestEntry: oldestEntry ? new Date(oldestEntry) : null,
            newestEntry: newestEntry ? new Date(newestEntry) : null
        };
    }

    /**
     * Clear all history (admin)
     */
    clearAll() {
        const stmt = this.db.prepare('DELETE FROM search_history');
        stmt.run();
        return true;
    }

    /**
     * Get recent searches (unique queries)
     */
    getRecentUnique(userId, limit = 10) {
        const rows = this.db.prepare(
            `SELECT DISTINCT query, category, MAX(timestamp) as timestamp
             FROM search_history
             WHERE user_id = ?
             GROUP BY query, category
             ORDER BY timestamp DESC
             LIMIT ?`
        ).all(userId, limit);

        return rows.map(row => SearchHistory.fromDatabase(row));
    }

    /**
     * Count history entries for user
     */
    countByUserId(userId) {
        const row = this.db.prepare(
            'SELECT COUNT(*) as count FROM search_history WHERE user_id = ?'
        ).get(userId);

        return row.count;
    }

    /**
     * Get popular searches (across all users)
     */
    getPopular(limit = 10) {
        const rows = this.db.prepare(
            `SELECT query, category, COUNT(*) as count, MAX(timestamp) as timestamp
             FROM search_history
             GROUP BY query, category
             ORDER BY count DESC, timestamp DESC
             LIMIT ?`
        ).all(limit);

        return rows;
    }
}

module.exports = SearchHistoryRepository;

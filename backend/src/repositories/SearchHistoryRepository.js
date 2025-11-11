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
    create(userId, query, category = 'all') {
        const history = SearchHistory.create(userId, query, category);
        const data = history.toDatabase();

        const stmt = this.db.prepare(
            'INSERT INTO search_history (user_id, query, category, timestamp) VALUES (?, ?, ?, ?)'
        );
        const info = stmt.run(data.user_id, data.query, data.category, data.timestamp);

        const row = this.db.prepare('SELECT * FROM search_history WHERE id = ?').get(info.lastInsertRowid);
        return SearchHistory.fromDatabase(row);
    }

    /**
     * Delete history entry
     */
    delete(id, userId) {
        const stmt = this.db.prepare(
            'DELETE FROM search_history WHERE id = ? AND user_id = ?'
        );
        stmt.run(id, userId);
        return true;
    }

    /**
     * Clear all history for user
     */
    clearByUserId(userId) {
        const stmt = this.db.prepare('DELETE FROM search_history WHERE user_id = ?');
        stmt.run(userId);
        return true;
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

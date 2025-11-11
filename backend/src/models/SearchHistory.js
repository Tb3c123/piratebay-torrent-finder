/**
 * SearchHistory Model
 * Represents a search history entry
 */

class SearchHistory {
    constructor(data) {
        this.id = data.id;
        this.userId = data.user_id || data.userId;
        this.query = data.query;
        this.category = data.category;
        this.timestamp = data.timestamp || new Date().toISOString();
    }

    /**
     * Convert to plain object (for API responses)
     */
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            query: this.query,
            category: this.category,
            timestamp: this.timestamp
        };
    }

    /**
     * Convert to database format
     */
    toDatabase() {
        return {
            id: this.id,
            user_id: this.userId,
            query: this.query,
            category: this.category,
            timestamp: this.timestamp
        };
    }

    /**
     * Create SearchHistory instance from database row
     */
    static fromDatabase(row) {
        if (!row) return null;
        return new SearchHistory({
            id: row.id,
            user_id: row.user_id,
            query: row.query,
            category: row.category,
            timestamp: row.timestamp
        });
    }

    /**
     * Create new search history entry
     */
    static create(userId, query, category = 'all') {
        return new SearchHistory({
            userId,
            query,
            category,
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = SearchHistory;

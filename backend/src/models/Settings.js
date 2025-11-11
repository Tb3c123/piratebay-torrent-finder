/**
 * Settings Model
 * Represents user settings (qBittorrent, Jellyfin, etc.)
 */

class Settings {
    constructor(data) {
        this.id = data.id;
        this.userId = data.user_id || data.userId;
        this.qbittorrent = data.qbittorrent ? JSON.parse(data.qbittorrent) : null;
        this.jellyfin = data.jellyfin ? JSON.parse(data.jellyfin) : null;
        this.createdAt = data.created_at || data.createdAt;
        this.updatedAt = data.updated_at || data.updatedAt;
    }

    /**
     * Convert to plain object (for API responses)
     */
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            qbittorrent: this.qbittorrent,
            jellyfin: this.jellyfin,
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
            user_id: this.userId,
            qbittorrent: this.qbittorrent ? JSON.stringify(this.qbittorrent) : null,
            jellyfin: this.jellyfin ? JSON.stringify(this.jellyfin) : null,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }

    /**
     * Create Settings instance from database row
     */
    static fromDatabase(row) {
        if (!row) return null;
        return new Settings({
            id: row.id,
            user_id: row.user_id,
            qbittorrent: row.qbittorrent,
            jellyfin: row.jellyfin,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }

    /**
     * Get default settings structure
     */
    static getDefaults(userId) {
        return new Settings({
            userId,
            qbittorrent: null,
            jellyfin: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    /**
     * Check if qBittorrent is configured
     */
    hasQBittorrent() {
        return this.qbittorrent && 
               this.qbittorrent.url && 
               this.qbittorrent.username && 
               this.qbittorrent.password;
    }

    /**
     * Check if Jellyfin is configured
     */
    hasJellyfin() {
        return this.jellyfin && 
               this.jellyfin.url && 
               this.jellyfin.apiKey;
    }
}

module.exports = Settings;

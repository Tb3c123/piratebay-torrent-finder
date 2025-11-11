/**
 * Settings Repository
 * Handles all database operations for user settings
 * Uses better-sqlite3 (synchronous API)
 */

const { Settings } = require('../models');
const { NotFoundError } = require('../utils/errors');

class SettingsRepository {
    constructor(db) {
        this.db = db;
    }

    /**
     * Find settings by user ID
     */
    findByUserId(userId) {
        const row = this.db.prepare('SELECT * FROM settings WHERE user_id = ?').get(userId);
        return Settings.fromDatabase(row);
    }

    /**
     * Get or create settings for user
     */
    getOrCreate(userId) {
        let settings = this.findByUserId(userId);

        if (!settings) {
            settings = this.create(userId);
        }

        return settings;
    }

    /**
     * Create settings for user
     */
    create(userId, data = {}) {
        const now = new Date().toISOString();
        const qbittorrent = data.qbittorrent ? JSON.stringify(data.qbittorrent) : null;
        const jellyfin = data.jellyfin ? JSON.stringify(data.jellyfin) : null;

        const stmt = this.db.prepare(
            'INSERT INTO settings (user_id, qbittorrent, jellyfin, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
        );
        const info = stmt.run(userId, qbittorrent, jellyfin, now, now);

        return this.findByUserId(userId);
    }

    /**
     * Update settings
     */
    update(userId, data) {
        let settings = this.findByUserId(userId);

        if (!settings) {
            // Create if doesn't exist
            return this.create(userId, data);
        }

        const updates = [];
        const values = [];

        if (data.qbittorrent !== undefined) {
            updates.push('qbittorrent = ?');
            values.push(data.qbittorrent ? JSON.stringify(data.qbittorrent) : null);
        }

        if (data.jellyfin !== undefined) {
            updates.push('jellyfin = ?');
            values.push(data.jellyfin ? JSON.stringify(data.jellyfin) : null);
        }

        updates.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(userId);

        const stmt = this.db.prepare(
            `UPDATE settings SET ${updates.join(', ')} WHERE user_id = ?`
        );
        stmt.run(...values);

        return this.findByUserId(userId);
    }

    /**
     * Delete settings
     */
    delete(userId) {
        const stmt = this.db.prepare('DELETE FROM settings WHERE user_id = ?');
        stmt.run(userId);
        return true;
    }

    /**
     * Update qBittorrent settings only
     */
    updateQBittorrent(userId, qbittorrent) {
        const settings = this.getOrCreate(userId);
        return this.update(userId, { qbittorrent });
    }

    /**
     * Update Jellyfin settings only
     */
    updateJellyfin(userId, jellyfin) {
        const settings = this.getOrCreate(userId);
        return this.update(userId, { jellyfin });
    }

    /**
     * Get qBittorrent settings
     */
    getQBittorrent(userId) {
        const settings = this.findByUserId(userId);
        return settings?.qbittorrent || null;
    }

    /**
     * Get Jellyfin settings
     */
    getJellyfin(userId) {
        const settings = this.findByUserId(userId);
        return settings?.jellyfin || null;
    }
}

module.exports = SettingsRepository;

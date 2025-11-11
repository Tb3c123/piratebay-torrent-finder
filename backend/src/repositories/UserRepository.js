/**
 * User Repository
 * Handles all database operations for users
 * Uses better-sqlite3 (synchronous API)
 */

const { User } = require('../models');
const { NotFoundError } = require('../utils/errors');

class UserRepository {
    constructor(db) {
        this.db = db;
    }

    /**
     * Find user by ID
     */
    findById(id) {
        const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        return User.fromDatabase(row);
    }

    /**
     * Find user by username
     */
    findByUsername(username) {
        const row = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        return User.fromDatabase(row);
    }

    /**
     * Get all users
     */
    findAll() {
        const rows = this.db.prepare('SELECT * FROM users').all();
        return rows.map(row => User.fromDatabase(row));
    }

    /**
     * Create new user
     */
    create(username, hashedPassword) {
        const now = new Date().toISOString();

        const stmt = this.db.prepare(
            'INSERT INTO users (username, password, created_at, updated_at) VALUES (?, ?, ?, ?)'
        );
        const info = stmt.run(username, hashedPassword, now, now);

        return this.findById(info.lastInsertRowid);
    }

    /**
     * Update user
     */
    update(id, data) {
        const user = this.findById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const updates = [];
        const values = [];

        if (data.username) {
            updates.push('username = ?');
            values.push(data.username);
        }

        if (data.password) {
            updates.push('password = ?');
            values.push(data.password);
        }

        updates.push('updated_at = ?');
        values.push(new Date().toISOString());
        values.push(id);

        const stmt = this.db.prepare(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
        );
        stmt.run(...values);

        return this.findById(id);
    }

    /**
     * Delete user
     */
    delete(id) {
        const user = this.findById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id);
        return true;
    }

    /**
     * Check if username exists
     */
    usernameExists(username) {
        const user = this.findByUsername(username);
        return !!user;
    }

    /**
     * Count total users
     */
    count() {
        const row = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
        return row.count;
    }
}

module.exports = UserRepository;

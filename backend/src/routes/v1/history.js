const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../utils/helpers');
const { successResponse, createdResponse } = require('../../utils/response');

const MAX_HISTORY = 100;
const RETENTION_DAYS = 30;

/**
 * Get search history (per user)
 */
router.get('/',
    asyncHandler(async (req, res) => {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const userIdNum = parseInt(userId, 10);

        // Auto-cleanup old entries for all users
        const cutoffDate = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
        const removed = req.repos.searchHistory.deleteOlderThan(cutoffDate);

        if (removed > 0 && global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Auto-cleanup: Removed ${removed} old search history entries`);
        }

        // Get user's history
        const history = req.repos.searchHistory.findByUserId(userIdNum);

        successResponse(res, history);
    })
);

/**
 * Get history statistics and cleanup info
 */
router.get('/stats',
    asyncHandler(async (req, res) => {
        const { userId } = req.query;

        const stats = req.repos.searchHistory.getStatistics(userId ? parseInt(userId) : null);

        successResponse(res, {
            total: stats.total,
            max_capacity: MAX_HISTORY,
            retention_days: RETENTION_DAYS,
            old_entries_count: stats.oldEntriesCount,
            oldest_entry: stats.oldestEntry,
            newest_entry: stats.newestEntry,
            cleanup_interval: '30 days',
            next_cleanup: 'Auto-cleanup runs on every request'
        });
    })
);

/**
 * Add search to history (per user)
 */
router.post('/',
    asyncHandler(async (req, res) => {
        const { query, category, userId } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const userIdNum = parseInt(userId, 10);

        // Remove duplicate if exists
        req.repos.searchHistory.deleteDuplicate(userIdNum, query, category || '0');

        // Add new entry
        const newEntry = req.repos.searchHistory.create({
            userId: userIdNum,
            query,
            category: category || '0'
        });

        // Enforce MAX_HISTORY limit per user
        const userHistory = req.repos.searchHistory.findByUserId(userIdNum);
        if (userHistory.length > MAX_HISTORY) {
            const excess = userHistory.length - MAX_HISTORY;
            const oldestEntries = userHistory.slice(-excess);
            oldestEntries.forEach(entry => {
                req.repos.searchHistory.deleteById(entry.id);
            });
        }

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Search added to history: ${query} (User: ${userId})`);
        }

        // Return updated history
        const updatedHistory = req.repos.searchHistory.findByUserId(userIdNum);
        createdResponse(res, { history: updatedHistory });
    })
);

/**
 * Clear search history
 */
router.delete('/',
    asyncHandler(async (req, res) => {
        const { userId } = req.query;

        if (userId) {
            const userIdNum = parseInt(userId, 10);
            req.repos.searchHistory.deleteByUserId(userIdNum);

            if (global.addLog) {
                global.addLog(global.LOG_LEVELS.INFO, `Search history cleared for user ${userId}`);
            }

            successResponse(res, null, `Search history cleared for user ${userId}`);
        } else {
            req.repos.searchHistory.clearAll();

            if (global.addLog) {
                global.addLog(global.LOG_LEVELS.INFO, 'All search history cleared');
            }

            successResponse(res, null, 'All search history cleared');
        }
    })
);

/**
 * Manual cleanup endpoint - trigger cleanup immediately
 */
router.post('/cleanup',
    asyncHandler(async (req, res) => {
        const cutoffDate = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
        const removed = req.repos.searchHistory.deleteOlderThan(cutoffDate);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Manual cleanup: Removed ${removed} old entries`);
        }

        const stats = req.repos.searchHistory.getStatistics();

        successResponse(res, {
            removed,
            remaining: stats.total
        }, 'Cleanup completed');
    })
);

module.exports = router;

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const HISTORY_FILE = path.join(__dirname, '../../data/search-history.json');
const MAX_HISTORY = 100;
const RETENTION_DAYS = 30;

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Load search history from file
 */
function loadHistory() {
    try {
        if (fs.existsSync(HISTORY_FILE)) {
            const data = fs.readFileSync(HISTORY_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading search history:', error);
    }
    return [];
}

/**
 * Save search history to file
 */
function saveHistory(history) {
    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Error saving search history:', error);
    }
}

/**
 * Clean old entries (older than RETENTION_DAYS)
 */
function cleanOldEntries(history) {
    const cutoffDate = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    return history.filter(item => item.timestamp > cutoffDate);
}

/**
 * Get search history
 */
router.get('/', (req, res) => {
    try {
        let history = loadHistory();
        history = cleanOldEntries(history);
        saveHistory(history);

        res.json(history);
    } catch (error) {
        console.error('Error getting search history:', error);
        res.status(500).json({ error: 'Failed to get search history' });
    }
});

/**
 * Get history statistics and cleanup info
 */
router.get('/stats', (req, res) => {
    try {
        const history = loadHistory();
        const cutoffDate = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
        const oldEntries = history.filter(item => item.timestamp <= cutoffDate);

        res.json({
            total: history.length,
            max_capacity: MAX_HISTORY,
            retention_days: RETENTION_DAYS,
            old_entries_count: oldEntries.length,
            oldest_entry: history.length > 0 ? new Date(Math.min(...history.map(h => h.timestamp))) : null,
            newest_entry: history.length > 0 ? new Date(Math.max(...history.map(h => h.timestamp))) : null,
            cleanup_interval: '30 days',
            next_cleanup: 'Auto-cleanup runs every 30 days'
        });
    } catch (error) {
        console.error('Error getting history stats:', error);
        res.status(500).json({ error: 'Failed to get history stats' });
    }
});/**
 * Add search to history
 */
router.post('/', (req, res) => {
    try {
        const { query, category } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        let history = loadHistory();

        // Remove duplicate if exists
        history = history.filter(item =>
            !(item.query.toLowerCase() === query.toLowerCase() && item.category === category)
        );

        // Add new entry at the beginning
        history.unshift({
            id: Date.now() + Math.random(),
            query,
            category: category || '0',
            timestamp: Date.now()
        });

        // Keep only MAX_HISTORY entries
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }

        saveHistory(history);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Search added to history: ${query}`);
        }

        res.json({ success: true, history });
    } catch (error) {
        console.error('Error adding to search history:', error);
        res.status(500).json({ error: 'Failed to add to search history' });
    }
});

/**
 * Clear search history
 */
router.delete('/', (req, res) => {
    try {
        saveHistory([]);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, 'Search history cleared');
        }

        res.json({ success: true, message: 'Search history cleared' });
    } catch (error) {
        console.error('Error clearing search history:', error);
        res.status(500).json({ error: 'Failed to clear search history' });
    }
});

/**
 * Scheduled cleanup job - runs every 30 days to remove old entries
 * Automatically removes entries older than 30 days
 */
function scheduledCleanup() {
    try {
        let history = loadHistory();
        const beforeCount = history.length;

        history = cleanOldEntries(history);
        const afterCount = history.length;

        if (beforeCount !== afterCount) {
            saveHistory(history);
            const removed = beforeCount - afterCount;
            console.log(`[CLEANUP] Removed ${removed} old search history entries (older than ${RETENTION_DAYS} days)`);

            if (global.addLog) {
                global.addLog(global.LOG_LEVELS.INFO, `Auto-cleanup: Removed ${removed} old entries`, {
                    before: beforeCount,
                    after: afterCount,
                    retention_days: RETENTION_DAYS
                });
            }
        } else {
            console.log(`[CLEANUP] No old entries to remove (all entries are within ${RETENTION_DAYS} days)`);
        }
    } catch (error) {
        console.error('Error in scheduled cleanup:', error);
    }
}

/**
 * Manual cleanup endpoint - trigger cleanup immediately
 */
router.post('/cleanup', (req, res) => {
    try {
        let history = loadHistory();
        const beforeCount = history.length;

        history = cleanOldEntries(history);
        const afterCount = history.length;

        saveHistory(history);
        const removed = beforeCount - afterCount;

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Manual cleanup: Removed ${removed} old entries`);
        }

        res.json({
            success: true,
            message: `Cleanup completed`,
            removed: removed,
            remaining: afterCount
        });
    } catch (error) {
        console.error('Error in manual cleanup:', error);
        res.status(500).json({ error: 'Failed to run cleanup' });
    }
});

// Run cleanup every 30 days (2592000000 ms)
const CLEANUP_INTERVAL = 30 * 24 * 60 * 60 * 1000; // 30 days

// Only enable auto-cleanup in production to save resources during development
if (process.env.NODE_ENV === 'production') {
    // Initialize cleanup interval
    setInterval(scheduledCleanup, CLEANUP_INTERVAL);
    console.log(`[HISTORY] Auto-cleanup enabled: Running every 30 days to remove entries older than ${RETENTION_DAYS} days`);

    // Run cleanup on startup
    scheduledCleanup();
} else {
    console.log(`[HISTORY] Auto-cleanup DISABLED in development mode (would run every 30 days in production)`);
}

console.log(`[HISTORY] Manual cleanup available at: POST /api/history/cleanup`);

module.exports = router;

const express = require('express');
const router = express.Router();

// In-memory logs storage (in production, use a proper logging service)
const logs = [];
const MAX_LOGS = 1000;

// Log levels
const LOG_LEVELS = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    DEBUG: 'debug'
};

/**
 * Add a log entry
 */
function addLog(level, message, data = null) {
    const logEntry = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        level,
        message,
        data
    };

    logs.unshift(logEntry); // Add to beginning

    // Keep only MAX_LOGS entries
    if (logs.length > MAX_LOGS) {
        logs.pop();
    }

    // Also log to console
    console.log(`[${level.toUpperCase()}] ${message}`, data || '');

    return logEntry;
}

/**
 * Get all logs
 * GET /api/logs
 */
router.get('/', (req, res) => {
    try {
        const { level, limit = 100 } = req.query;

        let filteredLogs = logs;

        if (level) {
            filteredLogs = logs.filter(log => log.level === level);
        }

        const result = filteredLogs.slice(0, parseInt(limit));

        // Log the access (but don't spam if it's frequent)
        if (Math.random() < 0.1) { // Only log 10% of requests to avoid spam
            addLog(LOG_LEVELS.DEBUG, 'Logs accessed', {
                level: level || 'all',
                limit,
                returned: result.length,
                total: logs.length
            });
        }

        res.json({
            success: true,
            logs: result,
            total: filteredLogs.length,
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        addLog(LOG_LEVELS.ERROR, 'Failed to fetch logs', {
            error: error.message
        });

        res.status(500).json({
            success: false,
            error: 'Failed to fetch logs',
            message: error.message
        });
    }
});

/**
 * Clear all logs
 * DELETE /api/logs
 */
router.delete('/', (req, res) => {
    try {
        const clearedCount = logs.length;

        // Clear logs first
        logs.length = 0;

        // Then add log about clearing (so it doesn't get cleared)
        addLog(LOG_LEVELS.WARNING, 'All logs cleared', {
            count: clearedCount,
            requestedBy: req.ip || 'unknown',
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Logs cleared successfully',
            clearedCount
        });
    } catch (error) {
        console.error('Error clearing logs:', error);
        addLog(LOG_LEVELS.ERROR, 'Failed to clear logs', {
            error: error.message
        });

        res.status(500).json({
            success: false,
            error: 'Failed to clear logs',
            message: error.message
        });
    }
});

/**
 * Get system status
 * GET /api/logs/status
 */
router.get('/status', (req, res) => {
    try {
        const statusData = {
            status: 'running',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            logs_count: logs.length,
            timestamp: new Date().toISOString()
        };

        addLog(LOG_LEVELS.INFO, 'System status checked', {
            uptime: `${Math.floor(statusData.uptime / 60)} minutes`,
            logsCount: statusData.logs_count,
            memoryUsedMB: Math.round(statusData.memory.heapUsed / 1024 / 1024)
        });

        res.json({
            success: true,
            ...statusData
        });
    } catch (error) {
        console.error('Error getting status:', error);
        addLog(LOG_LEVELS.ERROR, 'Failed to get system status', {
            error: error.message
        });

        res.status(500).json({
            success: false,
            error: 'Failed to get system status',
            message: error.message
        });
    }
});

module.exports = { router, addLog, LOG_LEVELS };

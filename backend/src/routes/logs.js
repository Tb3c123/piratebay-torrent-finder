const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/helpers');
const { successResponse } = require('../utils/response');

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
function addLog(level, message, data = null, userId = null) {
    try {
        const logEntry = {
            userId,
            level,
            action: message,
            details: data || {}
        };

        // Save to database if repository is available
        if (global.repos && global.repos.logs) {
            global.repos.logs.create(logEntry);
        }

        // Also log to console
        console.log(`[${level.toUpperCase()}] ${message}`, data || '');

        return logEntry;
    } catch (error) {
        console.error('[LOGS] Failed to add log:', error);
    }
}

// Expose addLog and LOG_LEVELS globally
global.addLog = addLog;
global.LOG_LEVELS = LOG_LEVELS;

/**
 * Get all logs
 * GET /api/logs
 */
router.get('/',
    asyncHandler(async (req, res) => {
        const { level, limit = 100, userId } = req.query;

        const limitNum = Math.min(parseInt(limit), MAX_LOGS);
        let logs;

        if (level) {
            logs = req.repos.logs.findByLevel(level, limitNum);
        } else if (userId) {
            logs = req.repos.logs.findByUserId(parseInt(userId), limitNum);
        } else {
            logs = req.repos.logs.findAll(limitNum);
        }

        // Log the access occasionally to avoid spam
        if (Math.random() < 0.1) {
            addLog(LOG_LEVELS.DEBUG, 'Logs accessed', {
                level: level || 'all',
                limit: limitNum,
                returned: logs.length
            });
        }

        successResponse(res, {
            logs,
            total: logs.length,
            limit: limitNum
        });
    })
);

/**
 * Clear all logs
 * DELETE /api/logs
 */
router.delete('/',
    asyncHandler(async (req, res) => {
        const { userId } = req.query;

        let clearedCount;

        if (userId) {
            clearedCount = req.repos.logs.clearByUserId(parseInt(userId));
            addLog(LOG_LEVELS.WARNING, `Logs cleared for user ${userId}`, {
                count: clearedCount,
                requestedBy: req.ip || 'unknown'
            });
            successResponse(res, { clearedCount }, `Logs cleared for user ${userId}`);
        } else {
            clearedCount = req.repos.logs.clearAll();
            addLog(LOG_LEVELS.WARNING, 'All logs cleared', {
                count: clearedCount,
                requestedBy: req.ip || 'unknown'
            });
            successResponse(res, { clearedCount }, 'All logs cleared successfully');
        }
    })
);

/**
 * Get system status
 * GET /api/logs/status
 */
router.get('/status',
    asyncHandler(async (req, res) => {
        const stats = req.repos.logs.getStatistics();
        const uptime = process.uptime();
        const memory = process.memoryUsage();

        const statusData = {
            status: 'running',
            uptime,
            uptimeMinutes: Math.floor(uptime / 60),
            memory: {
                heapUsed: memory.heapUsed,
                heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
                heapTotal: memory.heapTotal,
                heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024)
            },
            logs: {
                total: stats.total,
                byLevel: stats.byLevel
            },
            timestamp: new Date().toISOString()
        };

        addLog(LOG_LEVELS.INFO, 'System status checked', {
            uptime: `${statusData.uptimeMinutes} minutes`,
            logsCount: stats.total,
            memoryUsedMB: statusData.memory.heapUsedMB
        });

        successResponse(res, statusData);
    })
);

module.exports = { router, addLog, LOG_LEVELS };

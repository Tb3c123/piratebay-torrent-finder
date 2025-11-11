/**
 * Logging Utility
 * Provides consistent logging across the application
 */

const fs = require('fs');
const path = require('path');

// Log levels
const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
};

// ANSI color codes for console output
const COLORS = {
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
    info: '\x1b[36m',    // Cyan
    debug: '\x1b[35m',   // Magenta
    reset: '\x1b[0m'     // Reset
};

/**
 * Format log entry
 */
const formatLogEntry = (level, message, details = null) => {
    const timestamp = new Date().toISOString();
    const entry = {
        timestamp,
        level,
        message
    };

    if (details) {
        entry.details = details;
    }

    return entry;
};

/**
 * Write to logs.json file (backward compatible)
 */
const writeToLogFile = (logEntry) => {
    try {
        const logFilePath = path.join(__dirname, '../../data/logs.json');

        let logs = [];
        if (fs.existsSync(logFilePath)) {
            const fileContent = fs.readFileSync(logFilePath, 'utf-8');
            logs = JSON.parse(fileContent || '[]');
        }

        logs.push(logEntry);

        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs = logs.slice(-1000);
        }

        fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
};

/**
 * Log to console with colors
 */
const logToConsole = (level, message, details = null) => {
    const color = COLORS[level] || COLORS.reset;
    const timestamp = new Date().toISOString();

    let logMessage = `${color}[${timestamp}] [${level.toUpperCase()}]${COLORS.reset} ${message}`;

    if (details) {
        logMessage += `\n${JSON.stringify(details, null, 2)}`;
    }

    console.log(logMessage);
};

/**
 * Main logging function
 */
const log = (level, message, details = null) => {
    const logEntry = formatLogEntry(level, message, details);

    // Always log to console
    logToConsole(level, message, details);

    // Write to file for error and warn levels
    if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN) {
        writeToLogFile(logEntry);
    }
};

/**
 * Convenience methods
 */
const logger = {
    error: (message, details = null) => log(LOG_LEVELS.ERROR, message, details),
    warn: (message, details = null) => log(LOG_LEVELS.WARN, message, details),
    info: (message, details = null) => log(LOG_LEVELS.INFO, message, details),
    debug: (message, details = null) => log(LOG_LEVELS.DEBUG, message, details)
};

module.exports = logger;

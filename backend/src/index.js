const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Initialize database before anything else
const db = require('./database/init');

// Import repositories
const { createRepositories } = require('./repositories');

// Import new error handlers
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import v1 routes
const v1Routes = require('./routes/v1');

// Import individual routes for backward compatibility
const searchRoutes = require('./routes/v1/search');
const qbittorrentRoutes = require('./routes/v1/qbittorrent');
const { router: logsRouter, addLog, LOG_LEVELS } = require('./routes/v1/logs');
const systemRoutes = require('./routes/v1/system');
const historyRoutes = require('./routes/v1/history');
const moviesRoutes = require('./routes/v1/movies');
const torrentRoutes = require('./routes/v1/torrent');
const settingsRoutes = require('./routes/v1/settings');
const authRoutes = require('./routes/v1/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize repositories
const repos = createRepositories(db);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Make repositories and addLog available globally
global.repos = repos;
global.addLog = addLog;
global.LOG_LEVELS = LOG_LEVELS;

// Add repositories to all requests
app.use((req, res, next) => {
    req.repos = repos;
    next();
});

// API Version 1 Routes (Recommended)
app.use('/api/v1', v1Routes);

// Legacy Routes (Deprecated - for backward compatibility)
// TODO: Remove these in v2.0.0
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/qbittorrent', qbittorrentRoutes);
app.use('/api/logs', logsRouter);
app.use('/api/system', systemRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/torrent', torrentRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        version: 'v1',
        deprecation: {
            notice: 'Legacy /api/* endpoints are deprecated. Use /api/v1/* instead.',
            endpoints: '/api/v1'
        }
    });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    logger.info(`Backend server started on port ${PORT}`);
    addLog(LOG_LEVELS.INFO, `Backend server started on port ${PORT}`);
});

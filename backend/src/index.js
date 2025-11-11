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

const searchRoutes = require('./routes/search');
const qbittorrentRoutes = require('./routes/qbittorrent');
const { router: logsRouter, addLog, LOG_LEVELS } = require('./routes/logs');
const systemRoutes = require('./routes/system');
const historyRoutes = require('./routes/history');
const moviesRoutes = require('./routes/movies');
const torrentRoutes = require('./routes/torrent');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');

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

// Routes
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
    res.json({ status: 'ok', message: 'Server is running' });
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

/**
 * Repositories Index
 * Central export and factory for all repositories
 */

const UserRepository = require('./UserRepository');
const SettingsRepository = require('./SettingsRepository');
const SearchHistoryRepository = require('./SearchHistoryRepository');
const LogRepository = require('./LogRepository');

/**
 * Create repository instances with shared database connection
 */
function createRepositories(db) {
    return {
        users: new UserRepository(db),
        settings: new SettingsRepository(db),
        searchHistory: new SearchHistoryRepository(db),
        logs: new LogRepository(db)
    };
}

module.exports = {
    UserRepository,
    SettingsRepository,
    SearchHistoryRepository,
    LogRepository,
    createRepositories
};

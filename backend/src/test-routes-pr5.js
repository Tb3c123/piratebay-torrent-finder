/**
 * Test file for PR #5: Refactored Settings, History & Logs Routes
 *
 * This test validates:
 * 1. Settings routes using SettingsRepository
 * 2. History routes using SearchHistoryRepository
 * 3. Logs routes using LogRepository
 * 4. Backward compatibility with existing API contracts
 */

const db = require('./database/init');
const { createRepositories } = require('./repositories');

// Initialize repositories
const repos = createRepositories(db);
global.repos = repos;

// Create test users for foreign key constraints
const testUserIds = [999, 998, 997, 996, 995, 994, 993, 992, 991, 990, 989];
testUserIds.forEach(userId => {
    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!existing) {
        db.prepare('INSERT INTO users (id, username, password_hash, is_admin) VALUES (?, ?, ?, ?)')
            .run(userId, `testuser${userId}`, 'hashedpass', 0);
    }
});

// Import route modules
const settingsRouter = require('./routes/settings');
const historyRouter = require('./routes/history');
const { router: logsRouter, addLog, LOG_LEVELS } = require('./routes/logs');

console.log('\n=== PR #5: Routes Integration Test ===\n');

// Test counter
let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        failed++;
    }
}

// Test 1: Settings routes exist
test('Settings router is exported', () => {
    if (!settingsRouter || typeof settingsRouter !== 'function') {
        throw new Error('Settings router not properly exported');
    }
});

// Test 2: History routes exist
test('History router is exported', () => {
    if (!historyRouter || typeof historyRouter !== 'function') {
        throw new Error('History router not properly exported');
    }
});

// Test 3: Logs routes exist
test('Logs router is exported', () => {
    if (!logsRouter || typeof logsRouter !== 'function') {
        throw new Error('Logs router not properly exported');
    }
    if (typeof addLog !== 'function') {
        throw new Error('addLog function not properly exported');
    }
    if (typeof LOG_LEVELS !== 'object') {
        throw new Error('LOG_LEVELS not properly exported');
    }
});

// Test 4: Global addLog function
test('Global addLog function is available', () => {
    if (typeof global.addLog !== 'function') {
        throw new Error('global.addLog not available');
    }
    if (typeof global.LOG_LEVELS !== 'object') {
        throw new Error('global.LOG_LEVELS not available');
    }
});

// Test 5: Settings repository integration
test('Settings repository can create/update qBittorrent settings', () => {
    const testUserId = 999;

    // Clean up first
    const existing = repos.settings.findByUserId(testUserId);
    if (existing) {
        db.prepare('DELETE FROM settings WHERE user_id = ?').run(testUserId);
    }

    // Create settings
    const settings = repos.settings.getOrCreate(testUserId);
    if (!settings) {
        throw new Error('Failed to create settings');
    }

    // Update qBittorrent settings
    repos.settings.updateQBittorrent(testUserId, {
        url: 'http://test:8080',
        username: 'test',
        password: 'test123'
    });

    // Verify
    const updated = repos.settings.findByUserId(testUserId);
    if (!updated.hasQBittorrent()) {
        throw new Error('qBittorrent settings not saved');
    }
    if (updated.qbittorrent.url !== 'http://test:8080') {
        throw new Error('qBittorrent URL mismatch');
    }

    // Clean up
    db.prepare('DELETE FROM settings WHERE user_id = ?').run(testUserId);
});

// Test 6: Settings repository Jellyfin integration
test('Settings repository can create/update Jellyfin settings', () => {
    const testUserId = 998;

    // Clean up first
    const existing = repos.settings.findByUserId(testUserId);
    if (existing) {
        db.prepare('DELETE FROM settings WHERE user_id = ?').run(testUserId);
    }

    // Update Jellyfin settings
    repos.settings.updateJellyfin(testUserId, {
        url: 'http://jellyfin:8096',
        apiKey: 'test-api-key',
        libraries: ['Movies', 'TV Shows']
    });

    // Verify
    const updated = repos.settings.findByUserId(testUserId);
    if (!updated.hasJellyfin()) {
        throw new Error('Jellyfin settings not saved');
    }
    if (updated.jellyfin.libraries.length !== 2) {
        throw new Error('Jellyfin libraries not saved');
    }

    // Clean up
    db.prepare('DELETE FROM settings WHERE user_id = ?').run(testUserId);
});

// Test 7: Search history repository integration
test('SearchHistory repository can create and retrieve history', () => {
    const testUserId = 997;

    // Clean up first
    repos.searchHistory.deleteByUserId(testUserId);

    // Create history entries
    repos.searchHistory.create({
        userId: testUserId,
        query: 'Test Movie',
        category: 'movies'
    });

    repos.searchHistory.create({
        userId: testUserId,
        query: 'Test Series',
        category: 'tv'
    });

    // Retrieve history
    const history = repos.searchHistory.findByUserId(testUserId);
    if (history.length !== 2) {
        throw new Error(`Expected 2 entries, got ${history.length}`);
    }

    // Test duplicate deletion
    repos.searchHistory.deleteDuplicate(testUserId, 'Test Movie', 'movies');
    const afterDelete = repos.searchHistory.findByUserId(testUserId);
    if (afterDelete.length !== 1) {
        throw new Error('Duplicate not deleted');
    }

    // Clean up
    repos.searchHistory.deleteByUserId(testUserId);
});

// Test 8: Search history statistics
test('SearchHistory repository provides statistics', () => {
    const testUserId = 996;

    // Clean up first
    repos.searchHistory.deleteByUserId(testUserId);

    // Create test data
    repos.searchHistory.create({
        userId: testUserId,
        query: 'Stats Test',
        category: 'all'
    });

    // Get statistics
    const stats = repos.searchHistory.getStatistics(testUserId);
    if (typeof stats.total !== 'number') {
        throw new Error('Statistics missing total');
    }
    if (typeof stats.oldEntriesCount !== 'number') {
        throw new Error('Statistics missing oldEntriesCount');
    }

    // Clean up
    repos.searchHistory.deleteByUserId(testUserId);
});

// Test 9: Logs repository integration
test('Logs repository can create and retrieve logs', () => {
    const testUserId = 995;

    // Clean up first
    repos.logs.clearByUserId(testUserId);

    // Create log entries
    repos.logs.create({
        userId: testUserId,
        level: 'info',
        action: 'Test action',
        details: { test: true }
    });

    repos.logs.create({
        userId: testUserId,
        level: 'warning',
        action: 'Test warning',
        details: { warn: true }
    });

    // Retrieve logs
    const userLogs = repos.logs.findByUserId(testUserId);
    if (userLogs.length !== 2) {
        throw new Error(`Expected 2 log entries, got ${userLogs.length}`);
    }

    // Retrieve by level
    const warningLogs = repos.logs.findByLevel('warning', 100);
    const userWarnings = warningLogs.filter(log => log.userId === testUserId);
    if (userWarnings.length !== 1) {
        throw new Error('Level filtering not working');
    }

    // Clean up
    repos.logs.clearByUserId(testUserId);
});

// Test 10: Logs statistics
test('Logs repository provides statistics', () => {
    // Create test log
    repos.logs.create({
        userId: null,
        level: 'info',
        action: 'Stats test',
        details: {}
    });

    const stats = repos.logs.getStatistics();
    if (typeof stats.total !== 'number') {
        throw new Error('Statistics missing total');
    }
    if (typeof stats.byLevel !== 'object') {
        throw new Error('Statistics missing byLevel');
    }

    // Clean up test logs (keep real logs)
    const testLogs = repos.logs.findAll(1000).filter(log => log.action === 'Stats test');
    testLogs.forEach(log => {
        db.prepare('DELETE FROM logs WHERE id = ?').run(log.id);
    });
});

// Test 11: Global addLog function creates database entries
test('Global addLog function creates database entries', () => {
    const testUserId = 994;

    // Clean up first
    repos.logs.clearByUserId(testUserId);

    // Use global addLog
    global.addLog(global.LOG_LEVELS.INFO, 'Global test log', { global: true }, testUserId);

    // Verify in database
    const logs = repos.logs.findByUserId(testUserId);
    if (logs.length === 0) {
        throw new Error('Global addLog did not create database entry');
    }

    const lastLog = logs[0];
    if (lastLog.action !== 'Global test log') {
        throw new Error('Log action mismatch');
    }

    // Clean up
    repos.logs.clearByUserId(testUserId);
});

// Test 12: Search history cleanup
test('SearchHistory repository can cleanup old entries', () => {
    const testUserId = 993;

    // Clean up first
    repos.searchHistory.deleteByUserId(testUserId);

    // Create old entry (simulate old timestamp)
    const oldEntry = repos.searchHistory.create({
        userId: testUserId,
        query: 'Old search',
        category: 'all'
    });

    // Manually update timestamp to be old
    const thirtyOneDaysAgo = Date.now() - (31 * 24 * 60 * 60 * 1000);
    db.prepare('UPDATE search_history SET timestamp = ? WHERE id = ?').run(thirtyOneDaysAgo, oldEntry.id);

    // Create recent entry
    repos.searchHistory.create({
        userId: testUserId,
        query: 'Recent search',
        category: 'all'
    });

    // Cleanup old entries (30 days)
    const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const removed = repos.searchHistory.deleteOlderThan(cutoffDate);

    if (removed < 1) {
        throw new Error('Old entry not removed');
    }

    // Verify only recent entry remains
    const remaining = repos.searchHistory.findByUserId(testUserId);
    if (remaining.length !== 1 || remaining[0].query !== 'Recent search') {
        throw new Error('Cleanup did not work correctly');
    }

    // Clean up
    repos.searchHistory.deleteByUserId(testUserId);
});

// Test 13: Settings per-user isolation
test('Settings are isolated per user', () => {
    const user1 = 991;
    const user2 = 992;

    // Clean up
    db.prepare('DELETE FROM settings WHERE user_id IN (?, ?)').run(user1, user2);

    // Create settings for user 1
    repos.settings.updateQBittorrent(user1, {
        url: 'http://user1:8080',
        username: 'user1',
        password: 'pass1'
    });

    // Create settings for user 2
    repos.settings.updateQBittorrent(user2, {
        url: 'http://user2:8080',
        username: 'user2',
        password: 'pass2'
    });

    // Verify isolation
    const settings1 = repos.settings.findByUserId(user1);
    const settings2 = repos.settings.findByUserId(user2);

    if (settings1.qbittorrent.username === settings2.qbittorrent.username) {
        throw new Error('Settings not isolated between users');
    }

    // Clean up
    db.prepare('DELETE FROM settings WHERE user_id IN (?, ?)').run(user1, user2);
});

// Test 14: History per-user isolation
test('History is isolated per user', () => {
    const user1 = 989;
    const user2 = 990;

    // Clean up
    repos.searchHistory.deleteByUserId(user1);
    repos.searchHistory.deleteByUserId(user2);

    // Create history for both users
    repos.searchHistory.create({ userId: user1, query: 'User1 search', category: 'all' });
    repos.searchHistory.create({ userId: user2, query: 'User2 search', category: 'all' });

    // Verify isolation
    const history1 = repos.searchHistory.findByUserId(user1);
    const history2 = repos.searchHistory.findByUserId(user2);

    if (history1.length !== 1 || history2.length !== 1) {
        throw new Error('History not properly isolated');
    }

    if (history1[0].query === history2[0].query) {
        throw new Error('History leaked between users');
    }

    // Clean up
    repos.searchHistory.deleteByUserId(user1);
    repos.searchHistory.deleteByUserId(user2);
});

// Print summary
console.log('\n=== Test Summary ===');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);

if (failed > 0) {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
} else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
}

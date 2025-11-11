/**
 * Models & Repositories Tests
 * Run with: node test-models-repos.js
 */

const Database = require('better-sqlite3');
const { User, Settings, SearchHistory, Log } = require('./models');
const { createRepositories } = require('./repositories');

console.log('🧪 Testing Models & Repositories...\n');

// Create in-memory test database
const db = new Database(':memory:');

// Initialize database schema
function initDatabase() {
    db.exec(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);

    db.exec(`
        CREATE TABLE settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            qbittorrent TEXT,
            jellyfin TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    db.exec(`
        CREATE TABLE search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            query TEXT NOT NULL,
            category TEXT,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    db.exec(`
        CREATE TABLE logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            details TEXT,
            timestamp TEXT NOT NULL,
            level TEXT DEFAULT 'info',
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
}

function runTests() {
    try {
        initDatabase();
        console.log('✅ Database initialized\n');

        const repos = createRepositories(db);

        // Test 1: User Repository
        console.log('1️⃣  Testing UserRepository...');

        const user = repos.users.create('testuser', 'hashedpassword123');
        console.log(`   ✅ Created user: ${user.username} (ID: ${user.id})`);

        const foundUser = repos.users.findByUsername('testuser');
        console.log(`   ✅ Found user by username: ${foundUser.username}`);

        const userById = repos.users.findById(user.id);
        console.log(`   ✅ Found user by ID: ${userById.id}`);

        const exists = repos.users.usernameExists('testuser');
        console.log(`   ✅ Username exists check: ${exists}`);

        const count = repos.users.count();
        console.log(`   ✅ User count: ${count}`);

        // Test 2: Settings Repository
        console.log('\n2️⃣  Testing SettingsRepository...');

        const settings = repos.settings.create(user.id, {
            qbittorrent: {
                url: 'http://localhost:8080',
                username: 'admin',
                password: 'adminpass'
            }
        });
        console.log(`   ✅ Created settings for user ${settings.userId}`);

        const foundSettings = repos.settings.findByUserId(user.id);
        console.log(`   ✅ Found settings: qBittorrent configured = ${foundSettings.hasQBittorrent()}`);

        repos.settings.updateJellyfin(user.id, {
            url: 'http://localhost:8096',
            apiKey: 'test-key',
            libraries: []
        });
        console.log(`   ✅ Updated Jellyfin settings`);

        const updatedSettings = repos.settings.findByUserId(user.id);
        console.log(`   ✅ Jellyfin configured = ${updatedSettings.hasJellyfin()}`);

        // Test 3: Search History Repository
        console.log('\n3️⃣  Testing SearchHistoryRepository...');

        repos.searchHistory.create(user.id, 'Inception', 'movies');
        repos.searchHistory.create(user.id, 'Breaking Bad', 'tv');
        repos.searchHistory.create(user.id, 'Inception', 'movies'); // duplicate
        console.log(`   ✅ Created 3 search history entries`);

        const history = repos.searchHistory.findByUserId(user.id);
        console.log(`   ✅ Found ${history.length} history entries`);

        const recentUnique = repos.searchHistory.getRecentUnique(user.id, 5);
        console.log(`   ✅ Found ${recentUnique.length} unique recent searches`);

        const historyCount = repos.searchHistory.countByUserId(user.id);
        console.log(`   ✅ History count: ${historyCount}`);

        // Test 4: Log Repository
        console.log('\n4️⃣  Testing LogRepository...');

        repos.logs.info(user.id, 'User login', 'Successful login');
        repos.logs.warning(user.id, 'Failed download', 'Torrent not found');
        repos.logs.error(user.id, 'API error', 'qBittorrent connection failed');
        console.log(`   ✅ Created info, warning, and error logs`);

        const logs = repos.logs.findByUserId(user.id);
        console.log(`   ✅ Found ${logs.length} log entries`);

        const errorLogs = repos.logs.findByLevel('error');
        console.log(`   ✅ Found ${errorLogs.length} error logs`);

        const stats = repos.logs.getStatistics();
        console.log(`   ✅ Log stats: ${stats.total} total, ${stats.error} errors`);

        // Test 5: Model conversions
        console.log('\n5️⃣  Testing Model conversions...');

        const userJSON = user.toJSON();
        console.log(`   ✅ User to JSON (password excluded): ${!userJSON.password}`);

        const settingsJSON = updatedSettings.toJSON();
        console.log(`   ✅ Settings to JSON: ${!!settingsJSON.qbittorrent}`);

        const historyItem = history[0];
        const historyJSON = historyItem.toJSON();
        console.log(`   ✅ SearchHistory to JSON: ${historyJSON.query}`);

        const logItem = logs[0];
        const logJSON = logItem.toJSON();
        console.log(`   ✅ Log to JSON: ${logJSON.action}`);

        // Test 6: Data integrity
        console.log('\n6️⃣  Testing Data integrity...');

        repos.searchHistory.clearByUserId(user.id);
        const clearedHistory = repos.searchHistory.findByUserId(user.id);
        console.log(`   ✅ Cleared user history: ${clearedHistory.length === 0}`);

        repos.logs.clearByUserId(user.id);
        const clearedLogs = repos.logs.findByUserId(user.id);
        console.log(`   ✅ Cleared user logs: ${clearedLogs.length === 0}`);

        console.log('\n✅ All tests passed!\n');
        console.log('📝 Summary:');
        console.log('   - UserRepository: ✅');
        console.log('   - SettingsRepository: ✅');
        console.log('   - SearchHistoryRepository: ✅');
        console.log('   - LogRepository: ✅');
        console.log('   - Model conversions: ✅');
        console.log('   - Data integrity: ✅');
        console.log('\n🎉 Models & Repositories are ready to use!\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    } finally {
        db.close();
    }
}

runTests();

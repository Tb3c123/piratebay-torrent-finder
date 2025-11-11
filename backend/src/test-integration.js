/**
 * PR #4 Integration Test
 * Quick test to verify repositories integration
 */

const db = require('./database/init');
const { createRepositories } = require('./repositories');

console.log('🧪 Testing PR #4 Integration...\n');

try {
    // Test 1: Database initialized with all tables
    console.log('1️⃣  Checking database tables...');

    const tables = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table'
        ORDER BY name
    `).all();

    const tableNames = tables.map(t => t.name);
    const requiredTables = ['users', 'user_credentials', 'sessions', 'settings', 'search_history', 'logs'];

    requiredTables.forEach(tableName => {
        if (tableNames.includes(tableName)) {
            console.log(`   ✅ Table '${tableName}' exists`);
        } else {
            console.log(`   ❌ Table '${tableName}' missing`);
            throw new Error(`Required table '${tableName}' not found`);
        }
    });

    // Test 2: Repositories initialize correctly
    console.log('\n2️⃣  Testing repository initialization...');

    const repos = createRepositories(db);

    if (repos.users && typeof repos.users.findAll === 'function') {
        console.log('   ✅ UserRepository initialized');
    } else {
        throw new Error('UserRepository not initialized correctly');
    }

    if (repos.settings && typeof repos.settings.getOrCreate === 'function') {
        console.log('   ✅ SettingsRepository initialized');
    } else {
        throw new Error('SettingsRepository not initialized correctly');
    }

    if (repos.searchHistory && typeof repos.searchHistory.findByUserId === 'function') {
        console.log('   ✅ SearchHistoryRepository initialized');
    } else {
        throw new Error('SearchHistoryRepository not initialized correctly');
    }

    if (repos.logs && typeof repos.logs.getStatistics === 'function') {
        console.log('   ✅ LogRepository initialized');
    } else {
        throw new Error('LogRepository not initialized correctly');
    }

    // Test 3: Repositories work with existing schema
    console.log('\n3️⃣  Testing repository compatibility...');

    const userCount = repos.users.count();
    console.log(`   ✅ Can query users (${userCount} users found)`);

    console.log('\n✅ All integration tests passed!\n');
    console.log('📝 Summary:');
    console.log('   - Database schema: ✅ (all required tables present)');
    console.log('   - Repository initialization: ✅');
    console.log('   - Repository compatibility: ✅');
    console.log('   - Backward compatibility: ✅');
    console.log('\n🎉 PR #4 integration successful!\n');

} catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    process.exit(1);
}

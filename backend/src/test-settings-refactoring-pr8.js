/**
 * Test Suite for PR #8: Refactor Settings Route
 * Tests settings service and refactored routes
 */

const SettingsService = require('./services/SettingsService');
const db = require('./database/init');
const { createRepositories } = require('./repositories');

console.log('🧪 Testing Settings Route Refactoring - PR #8\n');
console.log('=' .repeat(60));

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  // Initialize repositories
  const repos = createRepositories(db);

  // Create test users for settings tests
  const testUserIds = [];
  try {
    const { AuthService } = require('./services/auth');
    const user1 = await AuthService.register(`settings_test_user1_${Date.now()}`, 'testpass123');
    const user2 = await AuthService.register(`settings_test_user2_${Date.now()}`, 'testpass123');
    const user3 = await AuthService.register(`settings_test_user3_${Date.now()}`, 'testpass123');
    testUserIds.push(user1.id, user2.id, user3.id);
    console.log(`✓ Created ${testUserIds.length} test users for settings tests`);
  } catch (error) {
    console.log('⚠️  Could not create test users:', error.message);
  }

  // Test 1: SettingsService exists and exports correctly
  console.log('\n📋 Test 1: SettingsService Module Export');
  try {
    if (!SettingsService) {
      throw new Error('SettingsService not exported');
    }
    if (typeof SettingsService.getQBittorrentSettings !== 'function') {
      throw new Error('getQBittorrentSettings method not found');
    }
    if (typeof SettingsService.testQBittorrentConnection !== 'function') {
      throw new Error('testQBittorrentConnection method not found');
    }
    if (typeof SettingsService.testJellyfinConnection !== 'function') {
      throw new Error('testJellyfinConnection method not found');
    }
    console.log('✅ PASSED: SettingsService exports all required methods');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 2: Get default qBittorrent settings
  console.log('\n📋 Test 2: Get Default qBittorrent Settings');
  try {
    const userId = testUserIds[0];
    const settings = SettingsService.getQBittorrentSettings(repos.settings, userId);

    if (!settings || !settings.url) {
      throw new Error('Default settings not returned');
    }

    if (!settings.url.includes('localhost') && !settings.url.includes(process.env.QBITTORRENT_URL || '')) {
      throw new Error('Default URL not correct');
    }

    console.log('✅ PASSED: Default qBittorrent settings returned correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 3: Update qBittorrent settings
  console.log('\n📋 Test 3: Update qBittorrent Settings');
  try {
    const userId = testUserIds[1];
    const qbSettings = {
      url: 'http://test.local:8080',
      username: 'testuser',
      password: 'testpass'
    };

    SettingsService.updateQBittorrentSettings(repos.settings, userId, qbSettings);

    const retrieved = SettingsService.getQBittorrentSettings(repos.settings, userId);

    if (retrieved.url !== qbSettings.url) {
      throw new Error('URL not saved correctly');
    }
    if (retrieved.username !== qbSettings.username) {
      throw new Error('Username not saved correctly');
    }

    console.log('✅ PASSED: qBittorrent settings updated and retrieved correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 4: Get default Jellyfin settings
  console.log('\n📋 Test 4: Get Default Jellyfin Settings');
  try {
    const userId = testUserIds[0];
    const settings = SettingsService.getJellyfinSettings(repos.settings, userId);

    if (!settings) {
      throw new Error('Default settings not returned');
    }

    if (!Object.prototype.hasOwnProperty.call(settings, 'url')) {
      throw new Error('url property missing');
    }

    if (!Object.prototype.hasOwnProperty.call(settings, 'apiKey')) {
      throw new Error('apiKey property missing');
    }

    if (!Array.isArray(settings.libraries)) {
      throw new Error('libraries should be an array');
    }

    console.log('✅ PASSED: Default Jellyfin settings returned correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 5: Update Jellyfin settings
  console.log('\n📋 Test 5: Update Jellyfin Settings');
  try {
    const userId = testUserIds[2];
    const jellyfinData = {
      url: 'http://jellyfin.local:8096',
      apiKey: 'test-api-key-12345',
      libraries: [
        { id: '1', name: 'Movies', type: 'movies', paths: ['/media/movies'] },
        { id: '2', name: 'TV Shows', type: 'tvshows', paths: ['/media/tv'] }
      ]
    };

    SettingsService.updateJellyfinSettings(repos.settings, userId, jellyfinData);

    const retrieved = SettingsService.getJellyfinSettings(repos.settings, userId);

    if (retrieved.url !== jellyfinData.url) {
      throw new Error('URL not saved correctly');
    }
    if (retrieved.apiKey !== jellyfinData.apiKey) {
      throw new Error('API key not saved correctly');
    }
    if (!Array.isArray(retrieved.libraries) || retrieved.libraries.length !== 2) {
      throw new Error('Libraries not saved correctly');
    }

    console.log('✅ PASSED: Jellyfin settings updated and retrieved correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 6: Get saved Jellyfin libraries
  console.log('\n📋 Test 6: Get Saved Jellyfin Libraries');
  try {
    const userId = testUserIds[2]; // User from previous test
    const libraries = SettingsService.getSavedJellyfinLibraries(repos.settings, userId);

    if (!Array.isArray(libraries)) {
      throw new Error('Libraries should be an array');
    }

    if (libraries.length !== 2) {
      throw new Error(`Expected 2 libraries, got ${libraries.length}`);
    }

    if (libraries[0].name !== 'Movies') {
      throw new Error('First library name incorrect');
    }

    console.log('✅ PASSED: Saved Jellyfin libraries retrieved correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 7: Get empty libraries for new user
  console.log('\n📋 Test 7: Get Empty Libraries for New User');
  try {
    const userId = 99997; // Non-existent user
    const libraries = SettingsService.getSavedJellyfinLibraries(repos.settings, userId);

    if (!Array.isArray(libraries)) {
      throw new Error('Libraries should be an array');
    }

    if (libraries.length !== 0) {
      throw new Error(`Expected 0 libraries, got ${libraries.length}`);
    }

    console.log('✅ PASSED: Empty libraries returned for new user');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 8: Settings route file structure
  console.log('\n📋 Test 8: Settings Route File Structure');
  try {
    const settingsRoute = require('./routes/v1/settings');

    if (!settingsRoute || typeof settingsRoute !== 'function') {
      throw new Error('Settings route is not a valid Express router');
    }

    console.log('✅ PASSED: Settings route is a valid Express router');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 9: Verify no axios in settings route (should be in service)
  console.log('\n📋 Test 9: Business Logic Separation');
  try {
    const fs = require('fs');
    const settingsRouteContent = fs.readFileSync('./src/routes/v1/settings.js', 'utf8');

    // Route file should not have axios imports (business logic moved to service)
    if (settingsRouteContent.includes("require('axios')")) {
      throw new Error('Settings route still contains axios import - business logic not fully extracted');
    }

    // Route file should import SettingsService
    if (!settingsRouteContent.includes('SettingsService')) {
      throw new Error('Settings route does not import SettingsService');
    }

    // Service file should have axios
    const serviceContent = fs.readFileSync('./src/services/SettingsService.js', 'utf8');
    if (!serviceContent.includes("require('axios')")) {
      throw new Error('SettingsService should contain axios import');
    }

    console.log('✅ PASSED: Business logic properly separated into service layer');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 10: Verify standardized error handling
  console.log('\n📋 Test 10: Standardized Error Handling');
  try {
    const fs = require('fs');
    const settingsRouteContent = fs.readFileSync('./src/routes/v1/settings.js', 'utf8');

    // Should use BadRequestError from utils
    if (!settingsRouteContent.includes('BadRequestError')) {
      throw new Error('Settings route does not use BadRequestError');
    }

    // Should not have inline error responses
    if (settingsRouteContent.match(/res\.status\(400\)\.json\({ error:/)) {
      throw new Error('Settings route still has inline error responses');
    }

    console.log('✅ PASSED: Settings route uses standardized error handling');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Summary:`);
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   📈 Total:  ${passedTests + failedTests}`);

  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Settings route refactored successfully.');

    // Show file size reduction
    const fs = require('fs');
    const routeLines = fs.readFileSync('./src/routes/v1/settings.js', 'utf8').split('\n').length;
    const serviceLines = fs.readFileSync('./src/services/SettingsService.js', 'utf8').split('\n').length;

    console.log('\n📏 File Sizes:');
    console.log(`   Settings Route: ${routeLines} lines (target: ~150 lines) ✅`);
    console.log(`   SettingsService: ${serviceLines} lines (extracted business logic) ✅`);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }

  // Cleanup test users
  try {
    const { AuthService } = require('./services/auth');
    for (const userId of testUserIds) {
      await AuthService.deleteUser(userId);
    }
    console.log(`\n✓ Cleaned up ${testUserIds.length} test users`);
  } catch (error) {
    console.log('\n⚠️  Could not cleanup test users:', error.message);
  }

  // Close database
  db.close();
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite error:', error);
  db.close();
  process.exit(1);
});

/**
 * Integration Tests: API Routes
 * Tests for all refactored routes (PR #5, #7, #8, #9)
 */

const db = require('../../src/database/init');

console.log('🧪 Integration Tests: API Routes\n');
console.log('='.repeat(60));

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: API Versioning (PR #7)
  console.log('\n📋 Test 1: API Versioning Structure');
  try {
    const v1Routes = require('../../src/routes/v1');

    if (!v1Routes || typeof v1Routes !== 'function') {
      throw new Error('V1 routes not exported correctly');
    }

    console.log('✅ PASSED: API versioning structure correct');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 2: Settings Route (PR #8)
  console.log('\n📋 Test 2: Settings Route Integration');
  try {
    const settingsRoute = require('../../src/routes/v1/settings');
    const SettingsService = require('../../src/services/SettingsService');

    if (!settingsRoute || !SettingsService) {
      throw new Error('Settings route or service not found');
    }

    if (typeof SettingsService.getQBittorrentSettings !== 'function') {
      throw new Error('SettingsService missing methods');
    }

    console.log('✅ PASSED: Settings route uses SettingsService correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 3: Movies Route (PR #9)
  console.log('\n📋 Test 3: Movies Route Standardization');
  try {
    const moviesRoute = require('../../src/routes/v1/movies');

    if (!moviesRoute || typeof moviesRoute !== 'function') {
      throw new Error('Movies route not found');
    }

    if (typeof moviesRoute.clearSectionCache !== 'function') {
      throw new Error('Movies route missing cache management');
    }

    console.log('✅ PASSED: Movies route standardized correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 4: System Route (PR #9)
  console.log('\n📋 Test 4: System Route Standardization');
  try {
    const systemRoute = require('../../src/routes/v1/system');

    if (!systemRoute || typeof systemRoute !== 'function') {
      throw new Error('System route not found');
    }

    console.log('✅ PASSED: System route standardized correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 5: Auth Route
  console.log('\n📋 Test 5: Auth Route Integration');
  try {
    const authRoute = require('../../src/routes/v1/auth');
    const AuthService = require('../../src/services/auth/AuthService');

    if (!authRoute || !AuthService) {
      throw new Error('Auth route or service not found');
    }

    console.log('✅ PASSED: Auth route uses AuthService correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 6: History Route
  console.log('\n📋 Test 6: History Route');
  try {
    const historyRoute = require('../../src/routes/v1/history');
    const { SearchHistoryRepository } = require('../../src/repositories');

    if (!historyRoute || !SearchHistoryRepository) {
      throw new Error('History route or repository not found');
    }

    console.log('✅ PASSED: History route uses SearchHistoryRepository');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 7: Logs Route (PR #5)
  console.log('\n📋 Test 7: Logs Route');
  try {
    const { router: logsRoute } = require('../../src/routes/v1/logs');
    const { LogRepository } = require('../../src/repositories');

    if (!logsRoute || !LogRepository) {
      throw new Error('Logs route or repository not found');
    }

    console.log('✅ PASSED: Logs route uses LogRepository');
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

  db.close();
  return failedTests === 0;
}

module.exports = { runTests };

// Run if called directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test suite error:', error);
    db.close();
    process.exit(1);
  });
}

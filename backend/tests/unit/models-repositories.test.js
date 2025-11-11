/**
 * Unit Tests: Models & Repositories
 * Tests for database models and repository pattern implementation
 */

const db = require('../../src/database/init');
const { User, SearchHistory, Log, Settings } = require('../../src/models');
const { UserRepository, SearchHistoryRepository, LogRepository, SettingsRepository } = require('../../src/repositories');

console.log('🧪 Unit Tests: Models & Repositories\n');
console.log('='.repeat(60));

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Models exports
  console.log('\n📋 Test 1: Models Module Exports');
  try {
    if (!User || !SearchHistory || !Log || !Settings) {
      throw new Error('Models not exported correctly');
    }

    console.log('✅ PASSED: All models exported correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 2: Repositories exports
  console.log('\n📋 Test 2: Repositories Module Exports');
  try {
    if (!UserRepository || !SearchHistoryRepository || !LogRepository || !SettingsRepository) {
      throw new Error('Repositories not exported correctly');
    }

    console.log('✅ PASSED: All repositories exported correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 3: Model methods exist
  console.log('\n📋 Test 3: Model Methods');
  try {
    if (typeof User.fromDatabase !== 'function') {
      throw new Error('User model missing methods');
    }
    if (typeof SearchHistory.fromDatabase !== 'function') {
      throw new Error('SearchHistory model missing methods');
    }
    if (typeof Log.fromDatabase !== 'function') {
      throw new Error('Log model missing methods');
    }
    if (typeof Settings.fromDatabase !== 'function') {
      throw new Error('Settings model missing methods');
    }

    console.log('✅ PASSED: All model methods exist');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 4: Repository methods exist
  console.log('\n📋 Test 4: Repository Methods');
  try {
    // Repositories are classes, need to check prototype
    if (typeof UserRepository.prototype.findByUsername !== 'function') {
      throw new Error('UserRepository missing methods');
    }
    if (typeof SearchHistoryRepository.prototype.create !== 'function') {
      throw new Error('SearchHistoryRepository missing methods');
    }
    if (typeof LogRepository.prototype.findAll !== 'function') {
      throw new Error('LogRepository missing methods');
    }
    if (typeof SettingsRepository.prototype.findByUserId !== 'function') {
      throw new Error('SettingsRepository missing methods');
    }

    console.log('✅ PASSED: All repository methods exist');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }  // Summary
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

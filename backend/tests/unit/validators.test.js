/**
 * Unit Tests: Validators
 * Tests for all validator modules
 */

const authValidator = require('../../src/validators/authValidator');
const settingsValidator = require('../../src/validators/settingsValidator');
const torrentValidator = require('../../src/validators/torrentValidator');

console.log('🧪 Unit Tests: Validators\n');
console.log('='.repeat(60));

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Auth validator exports
  console.log('\n📋 Test 1: Auth Validator Exports');
  try {
    if (!authValidator || typeof authValidator !== 'object') {
      throw new Error('Auth validator not found');
    }

    if (typeof authValidator.validateRegistration !== 'function') {
      throw new Error('Auth validator missing validateRegistration');
    }

    console.log('✅ PASSED: Auth validator exports validation functions');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }  // Test 2: Settings validator exports
  console.log('\n📋 Test 2: Settings Validator Exports');
  try {
    if (!settingsValidator.validateQBittorrentSettings || !settingsValidator.validateJellyfinSettings) {
      throw new Error('Settings validator missing required functions');
    }

    console.log('✅ PASSED: Settings validator exports all required functions');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 3: Torrent validator exports
  console.log('\n📋 Test 3: Torrent Validator Exports');
  try {
    if (!torrentValidator || typeof torrentValidator !== 'object') {
      throw new Error('Torrent validator not found');
    }

    if (typeof torrentValidator.validateSearchQuery !== 'function') {
      throw new Error('Torrent validator missing validateSearchQuery');
    }

    console.log('✅ PASSED: Torrent validator exports validation functions');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }  // Test 4: All validators are callable
  console.log('\n📋 Test 4: Validator Functions Callable');
  try {
    // Test that validators can be called (won't run them with data, just check if callable)
    if (typeof authValidator.validateRegistration !== 'function') {
      throw new Error('Auth validator functions not callable');
    }

    if (typeof settingsValidator.validateQBittorrentSettings !== 'function') {
      throw new Error('Settings validator functions not callable');
    }

    console.log('✅ PASSED: All validator functions are callable');
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

  return failedTests === 0;
}

module.exports = { runTests };

// Run if called directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test suite error:', error);
    process.exit(1);
  });
}

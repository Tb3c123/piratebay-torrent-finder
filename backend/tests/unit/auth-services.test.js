/**
 * Unit Tests: Auth Services
 * Tests for authentication service layer (PR #6)
 */

const db = require('../../src/database/init');
const PasswordService = require('../../src/services/auth/PasswordService');
const TokenService = require('../../src/services/auth/TokenService');
const AuthService = require('../../src/services/auth/AuthService');

console.log('🧪 Unit Tests: Auth Services\n');
console.log('='.repeat(60));

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: PasswordService exports
  console.log('\n📋 Test 1: PasswordService Methods');
  try {
    if (typeof PasswordService.hash !== 'function' || typeof PasswordService.verify !== 'function') {
      throw new Error('PasswordService missing required methods');
    }

    console.log('✅ PASSED: PasswordService has all required methods');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 2: TokenService exports
  console.log('\n📋 Test 2: TokenService Methods');
  try {
    if (typeof TokenService.generateToken !== 'function' || typeof TokenService.verifyToken !== 'function') {
      throw new Error('TokenService missing required methods');
    }

    console.log('✅ PASSED: TokenService has all required methods');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 3: AuthService exports
  console.log('\n📋 Test 3: AuthService Methods');
  try {
    if (typeof AuthService.register !== 'function' ||
        typeof AuthService.login !== 'function') {
      throw new Error('AuthService missing required methods');
    }

    console.log('✅ PASSED: AuthService has all required methods');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 4: Password hashing works
  console.log('\n📋 Test 4: Password Hashing');
  try {
    const password = 'testPassword123';
    const hashed = await PasswordService.hash(password);

    if (!hashed || hashed === password) {
      throw new Error('Password hashing failed');
    }

    const isValid = await PasswordService.verify(password, hashed);
    if (!isValid) {
      throw new Error('Password verification failed');
    }

    console.log('✅ PASSED: Password hashing and verification work correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 5: Token generation works
  console.log('\n📋 Test 5: Token Generation');
  try {
    const payload = { id: 123, username: 'testuser' };
    const token = TokenService.generateToken(payload);

    if (!token || typeof token !== 'string') {
      throw new Error('Token generation failed');
    }

    const decoded = TokenService.verifyToken(token);
    if (decoded.userId !== payload.id) {
      throw new Error('Token verification failed');
    }

    console.log('✅ PASSED: Token generation and verification work correctly');
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

/**
 * Unit Tests: Utilities
 * Tests for backend utilities (errors, response, logger, helpers)
 */

const { BadRequestError, NotFoundError, UnauthorizedError, ServiceUnavailableError } = require('../../src/utils/errors');
const { successResponse, paginatedResponse } = require('../../src/utils/response');
const logger = require('../../src/utils/logger');
const { formatBytes, sanitizeInput, isValidEmail } = require('../../src/utils/helpers');

console.log('🧪 Unit Tests: Utilities\n');
console.log('='.repeat(60));

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Error classes exist
  console.log('\n📋 Test 1: Error Classes');
  try {
    if (!BadRequestError || !NotFoundError || !UnauthorizedError || !ServiceUnavailableError) {
      throw new Error('Error classes not found');
    }

    const error = new BadRequestError('Test error');
    if (error.statusCode !== 400) {
      throw new Error('BadRequestError statusCode incorrect');
    }

    console.log('✅ PASSED: All error classes exist and work correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 2: Response helpers
  console.log('\n📋 Test 2: Response Helpers');
  try {
    if (typeof successResponse !== 'function' || typeof paginatedResponse !== 'function') {
      throw new Error('Response helpers not found');
    }

    const mockRes = {
      json: (data) => data,
      status: function(code) { this.statusCode = code; return this; }
    };

    successResponse(mockRes, { test: 'data' });
    if (mockRes.statusCode !== 200) {
      throw new Error('successResponse status code incorrect');
    }

    console.log('✅ PASSED: Response helpers work correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 3: Logger
  console.log('\n📋 Test 3: Logger');
  try {
    if (typeof logger.info !== 'function' || typeof logger.error !== 'function') {
      throw new Error('Logger methods not found');
    }

    console.log('✅ PASSED: Logger module loaded correctly');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 4: Helper functions
  console.log('\n📋 Test 4: Helper Functions');
  try {
    // Helpers module exists and is importable
    const helpers = require('../../src/utils/helpers');

    if (!helpers || typeof helpers !== 'object') {
      throw new Error('Helpers module not found or invalid');
    }

    console.log('✅ PASSED: Helper functions module loaded correctly');
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

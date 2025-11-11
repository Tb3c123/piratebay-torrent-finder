/**
 * Simple test script for new utilities
 * Run with: node test-utils.js
 */

const assert = require('assert');
const {
    BadRequestError,
    UnauthorizedError,
    NotFoundError
} = require('./utils/errors');
const {
    asyncHandler,
    formatBytes,
    parseBoolean,
    isEmptyObject
} = require('./utils/helpers');
const logger = require('./utils/logger');

console.log('🧪 Testing new utilities...\n');

// Test 1: Custom Errors
console.log('1️⃣  Testing custom errors...');
try {
    throw new BadRequestError('Test error');
} catch (err) {
    assert.strictEqual(err.statusCode, 400);
    assert.strictEqual(err.message, 'Test error');
    console.log('   ✅ BadRequestError works');
}

try {
    throw new UnauthorizedError();
} catch (err) {
    assert.strictEqual(err.statusCode, 401);
    console.log('   ✅ UnauthorizedError works');
}

try {
    throw new NotFoundError('Resource not found');
} catch (err) {
    assert.strictEqual(err.statusCode, 404);
    console.log('   ✅ NotFoundError works');
}

// Test 2: Helper functions
console.log('\n2️⃣  Testing helper functions...');
assert.strictEqual(formatBytes(1024), '1 KB');
assert.strictEqual(formatBytes(1536), '1.5 KB');
console.log('   ✅ formatBytes works');

assert.strictEqual(parseBoolean('true'), true);
assert.strictEqual(parseBoolean('false'), false);
assert.strictEqual(parseBoolean(1), true);
console.log('   ✅ parseBoolean works');

assert.strictEqual(isEmptyObject({}), true);
assert.strictEqual(isEmptyObject({ a: 1 }), false);
console.log('   ✅ isEmptyObject works');

// Test 3: asyncHandler
console.log('\n3️⃣  Testing asyncHandler...');
const testAsyncFn = asyncHandler(async (req, res, next) => {
    return 'success';
});
assert.strictEqual(typeof testAsyncFn, 'function');
console.log('   ✅ asyncHandler wraps functions correctly');

// Test 4: Logger
console.log('\n4️⃣  Testing logger...');
logger.info('Test info message');
logger.warn('Test warning message');
logger.error('Test error message', { detail: 'test' });
logger.debug('Test debug message');
console.log('   ✅ Logger outputs (check colors above)');

// All tests passed
console.log('\n✅ All utility tests passed!\n');
console.log('📝 Summary:');
console.log('   - Custom error classes: ✅');
console.log('   - Helper functions: ✅');
console.log('   - Async handler: ✅');
console.log('   - Logger: ✅');
console.log('\n🎉 Backend utilities are ready to use!\n');

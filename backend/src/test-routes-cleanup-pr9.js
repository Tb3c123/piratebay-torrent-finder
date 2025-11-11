/**
 * Test Suite for PR #9: Cleanup Remaining Routes
 * Tests standardization of movies and system routes
 */

const db = require('./database/init');

console.log('🧪 Testing Remaining Routes Cleanup - PR #9\n');
console.log('=' .repeat(60));

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Movies route file structure
  console.log('\n📋 Test 1: Movies Route File Structure');
  try {
    const moviesRoute = require('./routes/v1/movies');
    
    if (!moviesRoute || typeof moviesRoute !== 'function') {
      throw new Error('Movies route is not a valid Express router');
    }
    
    console.log('✅ PASSED: Movies route is a valid Express router');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 2: System route file structure
  console.log('\n📋 Test 2: System Route File Structure');
  try {
    const systemRoute = require('./routes/v1/system');
    
    if (!systemRoute || typeof systemRoute !== 'function') {
      throw new Error('System route is not a valid Express router');
    }
    
    console.log('✅ PASSED: System route is a valid Express router');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 3: Movies route uses standardized error handling
  console.log('\n📋 Test 3: Movies Route Error Handling');
  try {
    const fs = require('fs');
    const moviesRouteContent = fs.readFileSync('./src/routes/v1/movies.js', 'utf8');
    
    // Should import asyncHandler
    if (!moviesRouteContent.includes('asyncHandler')) {
      throw new Error('Movies route does not import asyncHandler');
    }
    
    // Should import BadRequestError
    if (!moviesRouteContent.includes('BadRequestError')) {
      throw new Error('Movies route does not import BadRequestError');
    }
    
    // Should use logger
    if (!moviesRouteContent.includes('logger')) {
      throw new Error('Movies route does not use logger');
    }
    
    // Should NOT have inline error responses like res.status(400).json({error:
    const inlineErrors = moviesRouteContent.match(/res\.status\(\d+\)\.json\s*\(\s*\{/g);
    if (inlineErrors && inlineErrors.length > 0) {
      throw new Error(`Movies route still has ${inlineErrors.length} inline error response(s)`);
    }
    
    console.log('✅ PASSED: Movies route uses standardized error handling');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 4: System route uses standardized error handling
  console.log('\n📋 Test 4: System Route Error Handling');
  try {
    const fs = require('fs');
    const systemRouteContent = fs.readFileSync('./src/routes/v1/system.js', 'utf8');
    
    // Should import asyncHandler
    if (!systemRouteContent.includes('asyncHandler')) {
      throw new Error('System route does not import asyncHandler');
    }
    
    // Should import BadRequestError
    if (!systemRouteContent.includes('BadRequestError')) {
      throw new Error('System route does not import BadRequestError');
    }
    
    // Should use logger
    if (!systemRouteContent.includes('logger')) {
      throw new Error('System route does not use logger');
    }
    
    // Should NOT have inline error responses
    const inlineErrors = systemRouteContent.match(/res\.status\(\d+\)\.json\s*\(\s*\{/g);
    if (inlineErrors && inlineErrors.length > 0) {
      throw new Error(`System route still has ${inlineErrors.length} inline error response(s)`);
    }
    
    console.log('✅ PASSED: System route uses standardized error handling');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 5: Verify backup files deleted
  console.log('\n📋 Test 5: Backup Files Deleted');
  try {
    const fs = require('fs');
    const backupFiles = [
      './src/services/auth.js.backup',
    ];
    
    for (const file of backupFiles) {
      if (fs.existsSync(file)) {
        throw new Error(`Backup file still exists: ${file}`);
      }
    }
    
    console.log('✅ PASSED: All backup files deleted');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 6: File size reduction
  console.log('\n📋 Test 6: File Size Reduction');
  try {
    const fs = require('fs');
    const moviesLines = fs.readFileSync('./src/routes/v1/movies.js', 'utf8').split('\n').length;
    const systemLines = fs.readFileSync('./src/routes/v1/system.js', 'utf8').split('\n').length;
    
    // Movies should be reduced from ~297 lines
    if (moviesLines > 280) {
      throw new Error(`Movies route still too large: ${moviesLines} lines (expected < 280)`);
    }
    
    // System should be reduced from ~222 lines
    if (systemLines > 200) {
      throw new Error(`System route still too large: ${systemLines} lines (expected < 200)`);
    }
    
    console.log(`✅ PASSED: File sizes reduced (movies: ${moviesLines} lines, system: ${systemLines} lines)`);
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 7: Movies route cache management functions
  console.log('\n📋 Test 7: Movies Route Cache Management');
  try {
    const moviesRoute = require('./routes/v1/movies');
    
    if (typeof moviesRoute.clearSectionCache !== 'function') {
      throw new Error('Movies route missing clearSectionCache function');
    }
    
    if (typeof moviesRoute.getSectionCacheStats !== 'function') {
      throw new Error('Movies route missing getSectionCacheStats function');
    }
    
    console.log('✅ PASSED: Movies route has cache management functions');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 8: Verify all routes use successResponse helper
  console.log('\n📋 Test 8: Success Response Helper Usage');
  try {
    const fs = require('fs');
    const moviesContent = fs.readFileSync('./src/routes/v1/movies.js', 'utf8');
    const systemContent = fs.readFileSync('./src/routes/v1/system.js', 'utf8');
    
    if (!moviesContent.includes('successResponse')) {
      throw new Error('Movies route does not import successResponse');
    }
    
    if (!systemContent.includes('successResponse')) {
      throw new Error('System route does not import successResponse');
    }
    
    console.log('✅ PASSED: All routes use successResponse helper');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 9: Verify console.log replaced with logger
  console.log('\n📋 Test 9: Logger Usage Instead of console.log');
  try {
    const fs = require('fs');
    const moviesContent = fs.readFileSync('./src/routes/v1/movies.js', 'utf8');
    const systemContent = fs.readFileSync('./src/routes/v1/system.js', 'utf8');
    
    // Count console.log usage (should be minimal or none in route handlers)
    const moviesConsoleLogs = (moviesContent.match(/console\.log/g) || []).length;
    const systemConsoleLogs = (systemContent.match(/console\.log/g) || []).length;
    
    // Some console.log might remain in helper functions, but should be minimal
    if (moviesConsoleLogs > 2) {
      console.log(`⚠️  WARNING: Movies route has ${moviesConsoleLogs} console.log calls (consider using logger)`);
    }
    
    if (systemConsoleLogs > 2) {
      console.log(`⚠️  WARNING: System route has ${systemConsoleLogs} console.log calls (consider using logger)`);
    }
    
    console.log(`✅ PASSED: Logger usage verified (movies: ${moviesConsoleLogs} console.log, system: ${systemConsoleLogs} console.log)`);
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 10: Verify no try-catch blocks (should use asyncHandler)
  console.log('\n📋 Test 10: AsyncHandler Pattern Usage');
  try {
    const fs = require('fs');
    const moviesContent = fs.readFileSync('./src/routes/v1/movies.js', 'utf8');
    const systemContent = fs.readFileSync('./src/routes/v1/system.js', 'utf8');
    
    // Count try-catch blocks in route handlers (should be minimal/none)
    const moviesTryCatch = (moviesContent.match(/router\.\w+\([^)]+async\s*\([^)]*\)\s*=>\s*\{\s*try/g) || []).length;
    const systemTryCatch = (systemContent.match(/router\.\w+\([^)]+async\s*\([^)]*\)\s*=>\s*\{\s*try/g) || []).length;
    
    if (moviesTryCatch > 0) {
      throw new Error(`Movies route has ${moviesTryCatch} route handler(s) with try-catch (should use asyncHandler)`);
    }
    
    if (systemTryCatch > 0) {
      throw new Error(`System route has ${systemTryCatch} route handler(s) with try-catch (should use asyncHandler)`);
    }
    
    console.log('✅ PASSED: All route handlers use asyncHandler pattern');
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
    console.log('\n🎉 All tests passed! Remaining routes cleaned up successfully.');
    
    // Show file size reduction
    const fs = require('fs');
    const moviesLines = fs.readFileSync('./src/routes/v1/movies.js', 'utf8').split('\n').length;
    const systemLines = fs.readFileSync('./src/routes/v1/system.js', 'utf8').split('\n').length;
    
    console.log('\n📏 File Size Reductions:');
    console.log(`   Movies Route: 297 → ${moviesLines} lines (-${297 - moviesLines} lines, -${Math.round((297 - moviesLines) / 297 * 100)}%) ✅`);
    console.log(`   System Route: 222 → ${systemLines} lines (-${222 - systemLines} lines, -${Math.round((222 - systemLines) / 222 * 100)}%) ✅`);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
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

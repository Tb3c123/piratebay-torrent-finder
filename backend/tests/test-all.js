#!/usr/bin/env node
/**
 * Master Test Script
 * Runs all tests in the correct order before allowing build
 * 
 * Test Order:
 * 1. Pre-build checks (environment & dependencies)
 * 2. Unit tests (utilities, validators, models, services)
 * 3. Integration tests (routes)
 * 4. Ready for build!
 */

console.log('\n' + '='.repeat(80));
console.log('🧪 MASTER TEST SUITE - Backend Validation');
console.log('='.repeat(80));

async function runMasterTests() {
  let allPassed = true;

  // Step 1: Pre-build checks
  console.log('\n\n📌 STEP 1: PRE-BUILD CHECKS');
  console.log('='.repeat(80));
  console.log('Checking environment and dependencies before running tests...\n');
  
  try {
    const { runPreBuildTests } = require('./pre-build/run-pre-build');
    const preBuildPassed = await runPreBuildTests();
    
    if (!preBuildPassed) {
      console.log('\n❌ Pre-build checks failed. Cannot proceed with tests.');
      return false;
    }
  } catch (error) {
    console.error('❌ Pre-build checks error:', error.message);
    return false;
  }

  // Step 2: Unit & Integration tests
  console.log('\n\n📌 STEP 2: UNIT & INTEGRATION TESTS');
  console.log('='.repeat(80));
  console.log('Running all unit and integration tests...\n');
  
  try {
    const { runAllTests } = require('./run-all');
    const testsPassed = await runAllTests();
    
    if (!testsPassed) {
      console.log('\n❌ Some tests failed. Cannot proceed to build.');
      return false;
    }
  } catch (error) {
    console.error('❌ Tests error:', error.message);
    return false;
  }

  // Step 3: Success!
  console.log('\n\n' + '='.repeat(80));
  console.log('🎉 ALL TESTS PASSED!');
  console.log('='.repeat(80));
  console.log('\n✅ Environment is ready');
  console.log('✅ All dependencies installed');
  console.log('✅ All unit tests passed');
  console.log('✅ All integration tests passed');
  console.log('\n🚀 Backend is ready for build!\n');
  console.log('You can now run:');
  console.log('  • npm run build     (build for production)');
  console.log('  • npm start         (start in development)');
  console.log('  • docker-compose up (start with Docker)\n');
  
  return true;
}

// Run master tests
if (require.main === module) {
  runMasterTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('\n❌ Master test suite error:', error);
    console.error(error.stack);
    process.exit(1);
  });
}

// Export for use in package.json scripts
module.exports = { runMasterTests };

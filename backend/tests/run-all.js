/**
 * All-in-One Test Runner
 * Runs all unit and integration tests
 */

console.log('\n🚀 Running All Backend Tests\n');
console.log('='.repeat(70));

async function runAllTests() {
  let totalPassed = 0;
  let totalFailed = 0;
  const testResults = [];

  // Unit Tests
  console.log('\n📦 UNIT TESTS');
  console.log('='.repeat(70));

  try {
    console.log('\n1️⃣  Running Utilities Tests...');
    const utilitiesTest = require('./unit/utilities.test');
    const utilitiesResult = await utilitiesTest.runTests();
    testResults.push({ name: 'Utilities', passed: utilitiesResult });
  } catch (error) {
    console.error('❌ Utilities test failed:', error.message);
    testResults.push({ name: 'Utilities', passed: false });
  }

  try {
    console.log('\n2️⃣  Running Validators Tests...');
    const validatorsTest = require('./unit/validators.test');
    const validatorsResult = await validatorsTest.runTests();
    testResults.push({ name: 'Validators', passed: validatorsResult });
  } catch (error) {
    console.error('❌ Validators test failed:', error.message);
    testResults.push({ name: 'Validators', passed: false });
  }

  try {
    console.log('\n3️⃣  Running Models & Repositories Tests...');
    const modelsTest = require('./unit/models-repositories.test');
    const modelsResult = await modelsTest.runTests();
    testResults.push({ name: 'Models & Repositories', passed: modelsResult });
  } catch (error) {
    console.error('❌ Models & Repositories test failed:', error.message);
    testResults.push({ name: 'Models & Repositories', passed: false });
  }

  try {
    console.log('\n4️⃣  Running Auth Services Tests...');
    const authServicesTest = require('./unit/auth-services.test');
    const authServicesResult = await authServicesTest.runTests();
    testResults.push({ name: 'Auth Services', passed: authServicesResult });
  } catch (error) {
    console.error('❌ Auth Services test failed:', error.message);
    testResults.push({ name: 'Auth Services', passed: false });
  }

  // Integration Tests
  console.log('\n\n🔗 INTEGRATION TESTS');
  console.log('='.repeat(70));

  try {
    console.log('\n5️⃣  Running Routes Integration Tests...');
    const routesTest = require('./integration/routes.test');
    const routesResult = await routesTest.runTests();
    testResults.push({ name: 'Routes Integration', passed: routesResult });
  } catch (error) {
    console.error('❌ Routes integration test failed:', error.message);
    testResults.push({ name: 'Routes Integration', passed: false });
  }

  // Final Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 FINAL TEST SUMMARY');
  console.log('='.repeat(70));
  
  testResults.forEach(result => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${result.name}`);
    if (result.passed) totalPassed++;
    else totalFailed++;
  });

  console.log('\n' + '='.repeat(70));
  console.log(`Total Tests: ${testResults.length}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log('='.repeat(70));

  if (totalFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Backend is ready for build.\n');
    return true;
  } else {
    console.log(`\n⚠️  ${totalFailed} test suite(s) failed. Please fix before building.\n`);
    return false;
  }
}

// Export for use in other scripts
module.exports = { runAllTests };

// Run if called directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('\n❌ Test runner error:', error);
    process.exit(1);
  });
}

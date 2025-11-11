/**
 * Pre-Build Test Runner
 * Runs all pre-build checks before allowing build
 */

console.log('\n🔧 Running Pre-Build Tests\n');
console.log('='.repeat(70));

async function runPreBuildTests() {
  let totalPassed = 0;
  let totalFailed = 0;
  const testResults = [];

  // Environment tests
  try {
    console.log('\n1️⃣  Checking Environment...');
    const envTest = require('./environment.test');
    const envResult = await envTest.runTests();
    testResults.push({ name: 'Environment', passed: envResult });
  } catch (error) {
    console.error('❌ Environment test failed:', error.message);
    testResults.push({ name: 'Environment', passed: false });
  }

  // Dependencies tests
  try {
    console.log('\n2️⃣  Checking Dependencies...');
    const depsTest = require('./dependencies.test');
    const depsResult = await depsTest.runTests();
    testResults.push({ name: 'Dependencies', passed: depsResult });
  } catch (error) {
    console.error('❌ Dependencies test failed:', error.message);
    testResults.push({ name: 'Dependencies', passed: false });
  }

  // Final Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 PRE-BUILD TEST SUMMARY');
  console.log('='.repeat(70));
  
  testResults.forEach(result => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${result.name}`);
    if (result.passed) totalPassed++;
    else totalFailed++;
  });

  console.log('\n' + '='.repeat(70));
  console.log(`Total Checks: ${testResults.length}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log('='.repeat(70));

  if (totalFailed === 0) {
    console.log('\n✅ Environment ready for build!\n');
    return true;
  } else {
    console.log(`\n❌ ${totalFailed} check(s) failed. Fix issues before building.\n`);
    return false;
  }
}

// Export for use in build script
module.exports = { runPreBuildTests };

// Run if called directly
if (require.main === module) {
  runPreBuildTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('\n❌ Pre-build test runner error:', error);
    process.exit(1);
  });
}

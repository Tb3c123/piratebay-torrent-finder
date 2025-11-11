/**
 * Pre-Build Tests: Dependencies Check
 * Verify all required dependencies are installed
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Pre-Build Dependencies Check\n');
console.log('='.repeat(60));

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: node_modules exists
  console.log('\n📋 Test 1: node_modules Directory');
  try {
    const nodeModulesPath = path.join(__dirname, '../../node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
      throw new Error('node_modules not found. Run: npm install');
    }
    
    console.log('✅ PASSED: node_modules directory exists');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 2: Core dependencies
  console.log('\n📋 Test 2: Core Dependencies');
  try {
    const coreDeps = [
      'express',
      'cors',
      'better-sqlite3',
      'bcrypt',
      'jsonwebtoken',
      'axios',
    ];
    
    for (const dep of coreDeps) {
      try {
        require.resolve(dep);
      } catch (e) {
        throw new Error(`Required dependency missing: ${dep}`);
      }
    }
    
    console.log('✅ PASSED: All core dependencies installed');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 3: Can import key modules
  console.log('\n📋 Test 3: Module Imports');
  try {
    require('express');
    require('cors');
    require('better-sqlite3');
    require('bcrypt');
    require('jsonwebtoken');
    require('axios');
    
    console.log('✅ PASSED: All key modules can be imported');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 4: Package lock exists
  console.log('\n📋 Test 4: Package Lock File');
  try {
    const lockPath = path.join(__dirname, '../../package-lock.json');
    
    if (!fs.existsSync(lockPath)) {
      console.log('⚠️  WARNING: package-lock.json not found');
    } else {
      console.log('✅ PASSED: package-lock.json exists');
    }
    
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

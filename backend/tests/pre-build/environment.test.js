/**
 * Pre-Build Tests: Environment Check
 * Verify environment is ready for build
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-Build Environment Check\n');
console.log('='.repeat(60));

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Node version
  console.log('\n📋 Test 1: Node.js Version');
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      throw new Error(`Node.js version ${nodeVersion} is too old. Required: >= 16`);
    }
    
    console.log(`✅ PASSED: Node.js ${nodeVersion} (>= 16 required)`);
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 2: Required directories exist
  console.log('\n📋 Test 2: Directory Structure');
  try {
    const requiredDirs = [
      path.join(__dirname, '../../src'),
      path.join(__dirname, '../../src/routes'),
      path.join(__dirname, '../../src/routes/v1'),
      path.join(__dirname, '../../src/services'),
      path.join(__dirname, '../../src/models'),
      path.join(__dirname, '../../src/repositories'),
      path.join(__dirname, '../../src/utils'),
      path.join(__dirname, '../../src/validators'),
      path.join(__dirname, '../../src/middleware'),
    ];
    
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        throw new Error(`Required directory missing: ${dir}`);
      }
    }
    
    console.log('✅ PASSED: All required directories exist');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 3: Required files exist
  console.log('\n📋 Test 3: Required Files');
  try {
    const requiredFiles = [
      path.join(__dirname, '../../src/index.js'),
      path.join(__dirname, '../../package.json'),
      path.join(__dirname, '../../src/database/init.js'),
      path.join(__dirname, '../../src/routes/v1/index.js'),
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
    
    console.log('✅ PASSED: All required files exist');
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 4: package.json valid
  console.log('\n📋 Test 4: package.json Validation');
  try {
    const packagePath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (!packageJson.name || !packageJson.version) {
      throw new Error('package.json missing name or version');
    }
    
    if (!packageJson.dependencies) {
      throw new Error('package.json missing dependencies');
    }
    
    console.log(`✅ PASSED: package.json valid (${packageJson.name}@${packageJson.version})`);
    passedTests++;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    failedTests++;
  }

  // Test 5: Environment variables
  console.log('\n📋 Test 5: Environment Variables');
  try {
    // Check if .env file exists (optional but recommended)
    const envPath = path.join(__dirname, '../../.env');
    const hasEnvFile = fs.existsSync(envPath);
    
    if (hasEnvFile) {
      console.log('✅ PASSED: .env file found');
    } else {
      console.log('⚠️  WARNING: .env file not found (using defaults)');
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

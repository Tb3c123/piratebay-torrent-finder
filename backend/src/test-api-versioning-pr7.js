/**
 * Test Suite for PR #7: API Versioning
 * Tests both v1 routes and backward compatibility
 */

const { AuthService } = require('./services/auth');
const db = require('./database/init');

// Test helper to create unique username
const createTestUsername = (prefix) => `${prefix}_${Date.now()}`;

console.log('🧪 Testing API Versioning - PR #7\n');
console.log('='.repeat(60));

async function runTests() {
    let passedTests = 0;
    let failedTests = 0;

    // Test 1: Check v1 routes are properly exported
    console.log('\n📋 Test 1: V1 Routes Module Export');
    try {
        const v1Routes = require('./routes/v1');
        if (!v1Routes) {
            throw new Error('v1 routes not exported');
        }
        console.log('✅ PASSED: V1 routes module exports correctly');
        passedTests++;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        failedTests++;
    }

    // Test 2: Check individual v1 route files exist
    console.log('\n📋 Test 2: Individual V1 Route Files');
    const routeFiles = ['auth', 'movies', 'search', 'torrent', 'qbittorrent', 'settings', 'history', 'logs', 'system'];
    try {
        for (const file of routeFiles) {
            const route = require(`./routes/v1/${file}`);
            if (!route) {
                throw new Error(`${file} route not found`);
            }
        }
        console.log(`✅ PASSED: All ${routeFiles.length} v1 route files exist and load correctly`);
        passedTests++;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        failedTests++;
    }

    // Test 3: Check auth route functionality (v1)
    console.log('\n📋 Test 3: Auth Route Functionality (V1)');
    try {
        const authRoute = require('./routes/v1/auth');
        if (!authRoute || typeof authRoute !== 'function') {
            throw new Error('Auth route is not a valid Express router');
        }
        console.log('✅ PASSED: Auth route (v1) is a valid Express router');
        passedTests++;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        failedTests++;
    }

    // Test 4: Verify AuthService still works (used by routes)
    console.log('\n📋 Test 4: AuthService Integration');
    try {
        const username = createTestUsername('versioning_test');
        const password = 'test123456';

        const user = await AuthService.register(username, password);
        if (!user || !user.id) {
            throw new Error('Failed to register user');
        }

        const loginResult = await AuthService.login(username, password);
        if (!loginResult || !loginResult.token) {
            throw new Error('Failed to login user');
        }

        // Cleanup
        await AuthService.deleteUser(user.id);

        console.log('✅ PASSED: AuthService integration works correctly');
        passedTests++;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        failedTests++;
    }

    // Test 5: Check settings route structure
    console.log('\n📋 Test 5: Settings Route Structure (V1)');
    try {
        const settingsRoute = require('./routes/v1/settings');
        if (!settingsRoute || typeof settingsRoute !== 'function') {
            throw new Error('Settings route is not a valid Express router');
        }
        console.log('✅ PASSED: Settings route (v1) is a valid Express router');
        passedTests++;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        failedTests++;
    }

    // Test 6: Check history route structure
    console.log('\n📋 Test 6: History Route Structure (V1)');
    try {
        const historyRoute = require('./routes/v1/history');
        if (!historyRoute || typeof historyRoute !== 'function') {
            throw new Error('History route is not a valid Express router');
        }
        console.log('✅ PASSED: History route (v1) is a valid Express router');
        passedTests++;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        failedTests++;
    }

    // Test 7: Check logs route structure
    console.log('\n📋 Test 7: Logs Route Structure (V1)');
    try {
        const logsModule = require('./routes/v1/logs');
        if (!logsModule || !logsModule.router) {
            throw new Error('Logs route does not export router');
        }
        console.log('✅ PASSED: Logs route (v1) exports router correctly');
        passedTests++;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        failedTests++;
    }

    // Test 8: Verify main index.js can load v1 routes
    console.log('\n📋 Test 8: Main Index V1 Integration');
    try {
        // Just verify the file can be parsed (don't run the server)
        const fs = require('fs');
        const indexContent = fs.readFileSync('./src/index.js', 'utf8');

        if (!indexContent.includes("require('./routes/v1')")) {
            throw new Error('Main index.js does not import v1 routes');
        }

        if (!indexContent.includes("/api/v1")) {
            throw new Error('Main index.js does not mount v1 routes at /api/v1');
        }

        console.log('✅ PASSED: Main index.js integrates v1 routes correctly');
        passedTests++;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        failedTests++;
    }

    // Test 9: Verify backward compatibility routes exist
    console.log('\n📋 Test 9: Backward Compatibility Routes');
    try {
        const fs = require('fs');
        const indexContent = fs.readFileSync('./src/index.js', 'utf8');

        const legacyRoutes = ['/api/auth', '/api/settings', '/api/history', '/api/logs'];
        for (const route of legacyRoutes) {
            if (!indexContent.includes(route)) {
                throw new Error(`Legacy route ${route} not found`);
            }
        }

        console.log('✅ PASSED: Backward compatibility routes maintained');
        passedTests++;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        failedTests++;
    }

    // Test 10: Verify deprecation warnings
    console.log('\n📋 Test 10: Deprecation Warnings');
    try {
        const fs = require('fs');
        const indexContent = fs.readFileSync('./src/index.js', 'utf8');

        if (!indexContent.includes('deprecated') && !indexContent.includes('Deprecated')) {
            throw new Error('No deprecation warnings found in code');
        }

        console.log('✅ PASSED: Deprecation warnings present for legacy routes');
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
        console.log('\n🎉 All tests passed! API versioning implemented successfully.');
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

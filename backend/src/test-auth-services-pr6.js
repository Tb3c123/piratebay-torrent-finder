/**
 * Test file for PR #6: Organized Auth Services
 */

const db = require('./database/init');
const { AuthService, TokenService, PasswordService } = require('./services/auth');

let passed = 0;
let failed = 0;

async function test(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        failed++;
    }
}

async function runAllTests() {
    console.log('\n=== PR #6: Auth Services Test ===\n');

    // Password Service Tests
    console.log('--- PasswordService ---\n');

    await test('Password validation works', async () => {
        PasswordService.validatePassword('validpass123');
        try {
            PasswordService.validatePassword('12345');
            throw new Error('Should fail for short password');
        } catch (e) {
            if (!e.message.includes('at least 6')) throw e;
        }
    });

    await test('Password hashing works', async () => {
        const hash = await PasswordService.hash('testpass');
        if (!hash.startsWith('$2b$')) throw new Error('Invalid hash format');
    });

    await test('Password comparison works', async () => {
        const hash = await PasswordService.hash('mypass');
        const valid = await PasswordService.compare('mypass', hash);
        const invalid = await PasswordService.compare('wrong', hash);
        if (!valid || invalid) throw new Error('Comparison failed');
    });

    // Token Service Tests
    console.log('\n--- TokenService ---\n');

    await test('Token generation works', async () => {
        const token = TokenService.generateToken({ id: 1, username: 'test' });
        if (token.split('.').length !== 3) throw new Error('Invalid JWT format');
    });

    await test('Token verification works', async () => {
        const token = TokenService.generateToken({ id: 2, username: 'verify' });
        const decoded = TokenService.verifyToken(token);
        if (decoded.userId !== 2) throw new Error('Decoded ID mismatch');
    });

    await test('Session management works', async () => {
        const userId = 9999;
        db.prepare('DELETE FROM users WHERE id = ?').run(userId);
        db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)')
            .run(userId, 'sessiontest', 'hash');

        const token = TokenService.generateToken({ id: userId, username: 'sessiontest' });
        TokenService.createSession(userId, token);

        const deleted = TokenService.deleteSession(token);
        if (!deleted) throw new Error('Delete failed');

        db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    });

    // Auth Service Tests
    console.log('\n--- AuthService ---\n');

    await test('Username validation works', async () => {
        AuthService.validateUsername('validuser123');
        try {
            AuthService.validateUsername('ab');
            throw new Error('Should fail for short username');
        } catch (e) {
            if (!e.message.includes('at least 3')) throw e;
        }
    });

    await test('User registration works', async () => {
        const username = `testuser_${Date.now()}`;
        const user = await AuthService.register(username, 'password123');
        if (!user.id || user.password_hash) throw new Error('Registration failed');
        db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
    });

    await test('Duplicate username prevention works', async () => {
        const username = `dup_${Date.now()}`;
        await AuthService.register(username, 'pass123');
        try {
            await AuthService.register(username, 'pass456');
            throw new Error('Should fail for duplicate');
        } catch (e) {
            if (!e.message.includes('already exists')) throw e;
        }
        const user = AuthService.getUserByUsername(username);
        if (user) db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
    });

    await test('User login works', async () => {
        const username = `login_${Date.now()}`;
        const user = await AuthService.register(username, 'loginpass');
        const result = await AuthService.login(username, 'loginpass');
        if (!result.token || !result.user) throw new Error('Login failed');
        TokenService.deleteSession(result.token);
        db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
    });

    await test('Invalid login rejected', async () => {
        const username = `badlogin_${Date.now()}`;
        await AuthService.register(username, 'correctpass');
        try {
            await AuthService.login(username, 'wrongpass');
            throw new Error('Should fail for wrong password');
        } catch (e) {
            if (!e.message.includes('Invalid username or password')) throw e;
        }
        const user = AuthService.getUserByUsername(username);
        if (user) db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
    });

    await test('Password change works', async () => {
        const username = `changepass_${Date.now()}`;
        const user = await AuthService.register(username, 'oldpass');
        await AuthService.changePassword(user.id, 'oldpass', 'newpass');
        const result = await AuthService.login(username, 'newpass');
        if (!result.token) throw new Error('New password login failed');
        TokenService.deleteSession(result.token);
        db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
    });

    await test('User sanitization works', async () => {
        const raw = { id: 1, username: 'test', password_hash: 'hash', is_admin: 1 };
        const clean = AuthService.sanitizeUser(raw);
        if (clean.password_hash || typeof clean.is_admin !== 'boolean') {
            throw new Error('Sanitization failed');
        }
    });

    // Integration Tests
    console.log('\n--- Integration Tests ---\n');

    await test('Full auth flow works', async () => {
        const username = `flow_${Date.now()}`;

        // Register -> Login -> Verify -> Logout
        const user = await AuthService.register(username, 'flowpass');
        const loginResult = await AuthService.login(username, 'flowpass');
        const verified = AuthService.verifyToken(loginResult.token);
        if (verified.userId !== user.id) throw new Error('Verification failed');

        AuthService.logout(loginResult.token);
        try {
            AuthService.verifyToken(loginResult.token);
            throw new Error('Should fail after logout');
        } catch (e) {
            if (!e.message.includes('Session expired')) throw e;
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
    });

    await test('Password change invalidates sessions', async () => {
        const username = `inv_${Date.now()}`;
        const user = await AuthService.register(username, 'oldpass');
        const session1 = await AuthService.login(username, 'oldpass');

        // Wait a bit to ensure different token
        await new Promise(resolve => setTimeout(resolve, 10));
        const session2 = await AuthService.login(username, 'oldpass');

        await AuthService.changePassword(user.id, 'oldpass', 'newpass');

        try {
            AuthService.verifyToken(session1.token);
            throw new Error('Session 1 should be invalid');
        } catch (e) {
            if (!e.message.includes('Session expired')) throw e;
        }

        try {
            AuthService.verifyToken(session2.token);
            throw new Error('Session 2 should be invalid');
        } catch (e) {
            if (!e.message.includes('Session expired')) throw e;
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
    });

    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);

    if (failed > 0) {
        console.log('\n❌ Some tests failed!');
        process.exit(1);
    } else {
        console.log('\n✅ All tests passed!');
        process.exit(0);
    }
}

runAllTests();

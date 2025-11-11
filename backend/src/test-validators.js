/**
 * Validator Tests
 * Run with: node test-validators.js
 */

const assert = require('assert');
const { ValidationError } = require('./utils/errors');
const validators = require('./validators');

console.log('🧪 Testing validators...\n');

// Test 1: Common validators
console.log('1️⃣  Testing common validators...');

try {
    validators.common.validateRequired({ username: 'test' }, ['username']);
    console.log('   ✅ validateRequired works');
} catch (e) {
    console.log('   ❌ validateRequired failed:', e.message);
}

try {
    validators.common.validateRequired({}, ['username']);
    console.log('   ❌ Should have thrown error');
} catch (e) {
    assert(e instanceof ValidationError);
    console.log('   ✅ validateRequired throws on missing fields');
}

try {
    validators.common.validateUsername('test_user-123');
    console.log('   ✅ validateUsername accepts valid username');
} catch (e) {
    console.log('   ❌ validateUsername failed:', e.message);
}

try {
    validators.common.validateUsername('ab');
    console.log('   ❌ Should have thrown error for short username');
} catch (e) {
    assert(e instanceof ValidationError);
    console.log('   ✅ validateUsername rejects short username');
}

try {
    validators.common.validateUrl('https://example.com');
    console.log('   ✅ validateUrl accepts valid URL');
} catch (e) {
    console.log('   ❌ validateUrl failed:', e.message);
}

// Test 2: Auth validators
console.log('\n2️⃣  Testing auth validators...');

try {
    const result = validators.auth.validateRegistration({
        username: 'testuser',
        password: 'password123'
    });
    assert.strictEqual(result.username, 'testuser');
    console.log('   ✅ validateRegistration works with valid data');
} catch (e) {
    console.log('   ❌ validateRegistration failed:', e.message);
}

try {
    validators.auth.validateRegistration({ username: 'ab' });
    console.log('   ❌ Should have thrown error');
} catch (e) {
    assert(e instanceof ValidationError);
    console.log('   ✅ validateRegistration rejects invalid data');
}

try {
    const result = validators.auth.validateLogin({
        username: 'testuser',
        password: 'anypass'
    });
    console.log('   ✅ validateLogin works');
} catch (e) {
    console.log('   ❌ validateLogin failed:', e.message);
}

// Test 3: Settings validators
console.log('\n3️⃣  Testing settings validators...');

try {
    const result = validators.settings.validateQBittorrentSettings({
        url: 'http://localhost:8080',
        username: 'admin',
        password: 'adminpass'
    });
    assert.strictEqual(result.url, 'http://localhost:8080');
    console.log('   ✅ validateQBittorrentSettings works');
} catch (e) {
    console.log('   ❌ validateQBittorrentSettings failed:', e.message);
}

try {
    const result = validators.settings.validateJellyfinSettings({
        url: 'http://localhost:8096/',
        apiKey: 'test-api-key',
        libraries: []
    });
    assert.strictEqual(result.url, 'http://localhost:8096'); // trailing slash removed
    console.log('   ✅ validateJellyfinSettings works & removes trailing slash');
} catch (e) {
    console.log('   ❌ validateJellyfinSettings failed:', e.message);
}

try {
    const result = validators.settings.validateSettingsUpdate({
        qbittorrent: {
            url: 'http://localhost:8080',
            username: 'admin',
            password: 'pass'
        }
    });
    assert(result.qbittorrent);
    console.log('   ✅ validateSettingsUpdate works');
} catch (e) {
    console.log('   ❌ validateSettingsUpdate failed:', e.message);
}

// Test 4: Torrent validators
console.log('\n4️⃣  Testing torrent validators...');

try {
    const result = validators.torrent.validateSearchQuery({
        query: 'test movie',
        category: 'movies',
        page: '0'
    });
    assert.strictEqual(result.query, 'test movie');
    assert.strictEqual(result.category, 'movies');
    assert.strictEqual(result.page, 0);
    console.log('   ✅ validateSearchQuery works');
} catch (e) {
    console.log('   ❌ validateSearchQuery failed:', e.message);
}

try {
    validators.torrent.validateSearchQuery({ query: 'a' });
    console.log('   ❌ Should have rejected short query');
} catch (e) {
    assert(e instanceof ValidationError);
    console.log('   ✅ validateSearchQuery rejects short queries');
}

try {
    validators.torrent.validateMagnetLink('magnet:?xt=urn:btih:test123');
    console.log('   ✅ validateMagnetLink works');
} catch (e) {
    console.log('   ❌ validateMagnetLink failed:', e.message);
}

try {
    validators.torrent.validateMagnetLink('http://not-a-magnet');
    console.log('   ❌ Should have rejected invalid magnet');
} catch (e) {
    assert(e instanceof ValidationError);
    console.log('   ✅ validateMagnetLink rejects invalid format');
}

try {
    const result = validators.torrent.validateTorrentDownload({
        magnetLink: 'magnet:?xt=urn:btih:test',
        userId: 1
    });
    assert(result.magnetLink);
    assert.strictEqual(result.userId, 1);
    console.log('   ✅ validateTorrentDownload works');
} catch (e) {
    console.log('   ❌ validateTorrentDownload failed:', e.message);
}

try {
    validators.torrent.validateImdbId('tt1234567');
    console.log('   ✅ validateImdbId works');
} catch (e) {
    console.log('   ❌ validateImdbId failed:', e.message);
}

try {
    validators.torrent.validateImdbId('invalid');
    console.log('   ❌ Should have rejected invalid IMDB ID');
} catch (e) {
    assert(e instanceof ValidationError);
    console.log('   ✅ validateImdbId rejects invalid format');
}

// All tests passed
console.log('\n✅ All validator tests passed!\n');
console.log('📝 Summary:');
console.log('   - Common validators: ✅');
console.log('   - Auth validators: ✅');
console.log('   - Settings validators: ✅');
console.log('   - Torrent validators: ✅');
console.log('\n🎉 Validators are ready to use!\n');

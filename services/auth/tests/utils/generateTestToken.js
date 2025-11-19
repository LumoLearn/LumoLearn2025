/**
 * Helper script za generisanje test JWT tokena
 * Koristi se za testiranje protected routes
 * 
 * Usage:
 *   node src/utils/generateTestToken.js
 *   node src/utils/generateTestToken.js teacher
 *   node src/utils/generateTestToken.js student test@example.com
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT Secret (ili učitaj iz .env)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-for-testing-only-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

// Parse command line arguments
const role = process.argv[2] || 'student';
const email = process.argv[3] || `${role}@test.com`;

// Validacija uloge
const validRoles = ['student', 'teacher', 'parent'];
if (!validRoles.includes(role)) {
  console.error(`❌ Invalid role: ${role}`);
  console.error(`Valid roles: ${validRoles.join(', ')}`);
  process.exit(1);
}

// Generiši test user ID
const userId = crypto.randomUUID();

// Kreiraj payload
const payload = {
  userId,
  email,
  role
};

// Generiši token
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: JWT_EXPIRES_IN
});

// Prikaži informacije
console.log('\n🎟️  JWT Test Token Generated\n');
console.log('━'.repeat(80));
console.log('\n📋 Payload:');
console.log(JSON.stringify(payload, null, 2));
console.log('\n🔑 Token:');
console.log(token);
console.log('\n⏱️  Expires in:', JWT_EXPIRES_IN);
console.log('━'.repeat(80));

// Primeri curl komandi
console.log('\n📝 Example Usage:\n');

console.log('1. Test protected route:');
console.log(`   curl -X GET http://localhost:3001/api/test/profile \\`);
console.log(`     -H "Authorization: Bearer ${token}"`);
console.log('');

console.log('2. Test teacher-only route:');
console.log(`   curl -X GET http://localhost:3001/api/test/teacher-only \\`);
console.log(`     -H "Authorization: Bearer ${token}"`);
console.log('');

console.log('3. Test dashboard:');
console.log(`   curl -X GET http://localhost:3001/api/test/dashboard \\`);
console.log(`     -H "Authorization: Bearer ${token}"`);
console.log('');

// Decode token za debug
const decoded = jwt.decode(token);
console.log('🔍 Decoded Token (for debugging):');
console.log(JSON.stringify(decoded, null, 2));
console.log('');

// JWT.io link
console.log('🌐 Debug on JWT.io:');
console.log('   https://jwt.io/');
console.log('   Paste the token above to inspect it\n');

console.log('━'.repeat(80));
console.log('');


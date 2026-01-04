// Test script to check password reset token reuse
const fetch = require('node-fetch');
const API_URL = 'http://localhost:5000';
async function testPasswordResetReuse() {
  console.log('Testing password reset token reuse...\n');
  // Step 1: Request a password reset
  console.log('Step 1: Requesting password reset for test user...');
  const resetResponse = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com' })
  });
  const resetData = await resetResponse.json();
  console.log('Reset response:', resetData);
  // We would need to extract the token from the email or database
  // For now, this is a placeholder to show the test structure
  console.log('\nNote: In a real test, you would need to extract the reset token from the email or database');
  console.log('Then test using it twice to confirm it cannot be reused.\n');
}
testPasswordResetReuse().catch(console.error);

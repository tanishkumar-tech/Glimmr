const fetch = require('node-fetch');

(async () => {
  try {
    const base = 'http://localhost:5001/api';
    console.log('Signing up test user...');
    const signupResp = await fetch(`${base}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+15551234567', username: 'debuguser', password: 'DebugPass123!' }),
    });
    const signupJson = await signupResp.json();
    console.log('SIGNUP RESPONSE:', signupResp.status, signupJson);

    console.log('Note: Dev OTP fetching removed. Phone verification is now handled client-side via Firebase.');

    if (verifyResp.ok) {
      console.log('Test flow succeeded. Token:', verifyJson.token ? verifyJson.token.slice(0, 20) + '...' : '(no token)');
      process.exit(0);
    } else {
      console.error('Verify failed:', verifyJson);
      process.exit(3);
    }
  } catch (err) {
    console.error('Test script error:', err.message || err);
    process.exit(4);
  }
})();

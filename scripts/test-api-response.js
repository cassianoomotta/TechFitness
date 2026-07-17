// Test the API endpoint directly to see what data the frontend receives
const http = require('http');

// First, login to get a session cookie
async function testApi() {
  // We'll use the NextAuth credentials provider endpoint
  const loginData = JSON.stringify({
    email: 'cassiano@gmail.com',
    password: '123456',
    csrfToken: '',
    callbackUrl: 'http://localhost:3000/student/dashboard',
    json: true
  });

  // Get CSRF token first
  const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
  const csrfData = await csrfRes.json();
  console.log('CSRF Token:', csrfData.csrfToken);

  // Login
  const loginRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      email: 'cassiano@gmail.com',
      password: '123456',
      csrfToken: csrfData.csrfToken,
      callbackUrl: 'http://localhost:3000/student/dashboard',
      json: 'true'
    }),
    redirect: 'manual'
  });

  console.log('Login status:', loginRes.status);
  const cookies = loginRes.headers.getSetCookie();
  console.log('Cookies received:', cookies.length);

  // Get session token cookie
  const sessionCookie = cookies.find(c => c.includes('next-auth.session-token'));
  if (!sessionCookie) {
    console.log('No session cookie found. All cookies:', cookies);
    return;
  }

  const cookieValue = sessionCookie.split(';')[0];
  console.log('Session cookie:', cookieValue.substring(0, 60) + '...');

  // Now call the workout plans API
  const plansRes = await fetch('http://localhost:3000/api/student/workout-plans', {
    headers: { 'Cookie': cookieValue }
  });
  
  const plansData = await plansRes.json();
  
  if (plansData.error) {
    console.log('API Error:', plansData.error);
    return;
  }

  console.log('\nTrainer:', plansData.trainer?.name);
  console.log('Plans count:', plansData.plans?.length);
  
  // Check first plan exercises
  if (plansData.plans && plansData.plans.length > 0) {
    const firstPlan = plansData.plans[0];
    console.log(`\n=== Plan: ${firstPlan.name} ===`);
    for (const ex of firstPlan.exercises) {
      console.log(`  ${ex.name}`);
      console.log(`    videoUrl: ${ex.videoUrl}`);
      console.log(`    gifUrl: ${ex.gifUrl}`);
      console.log(`    -> TV icon would show: ${ex.gifUrl || ex.videoUrl || 'nothing'}`);
      console.log('');
    }
  }
}

testApi().catch(console.error);

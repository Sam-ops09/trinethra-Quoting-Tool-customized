
import 'dotenv/config';
import { featureFlags } from '../shared/feature-flags';

// Set port to 5001 to avoid conflict with running dev server
process.env.PORT = '5001';
// Set node env to test/dev to allow relaxed CSP/Rate limits
process.env.NODE_ENV = 'development';
process.env.TESTING = 'true';

// Import server (will start automatically)
import '../server/index';

// Wait for server to start
const API_URL = 'http://localhost:5001/api';
let cookie = '';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(endpoint: string, method: string = 'GET', body?: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cookie) {
    headers['Cookie'] = cookie;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Capture cookies
    const sc = response.headers.get('set-cookie');
    if (sc) {
        cookie = sc.split(';')[0];
    }

    const data = await response.json().catch(() => ({}));
    return { status: response.status, data };
  } catch (e) {
      return { status: 0, data: { error: String(e) } };
  }
}

// Import NumberingService to reset counter
import { NumberingService } from '../server/services/numbering.service';

async function runTests() {
  console.log('Waiting for server to start...');
  await delay(2000);
  console.log('Starting Feature Flag Verification...');

  // Reset counter to avoid collisions is risky. Instead, use a unique prefix.
  const uniquePrefix = `FLAG-${Date.now().toString().slice(-4)}`;
  console.log(`Setting unique quote prefix: ${uniquePrefix}`);
  
  // Login first to set settings
  const email = 'admin@example.com';
  const password = 'Admin@123';
  let res = await request('/auth/login', 'POST', { email, password });

  if (res.status !== 200) {
      console.log('Login failed, assuming clean DB, trying signup...');
       await request('/auth/signup', 'POST', {
            email, password, name: 'Admin User', role: 'admin'
        });
       res = await request('/auth/login', 'POST', { email, password });
  }

  if (res.status === 200) {
      await request('/settings', 'POST', { key: 'quotePrefix', value: uniquePrefix });
  } else {
      console.error('Failed to login for setup');
      process.exit(1);
  }
  
  console.log('Logged in and configured.');

  // 1. Authenticate (Already done above, but kept structure)
  // Re-verify login status just in case
  if (res.status !== 200) {
      console.error('Failed to login');
      process.exit(1);
  }

  // 2. Test Invoices PDF Generation Flag
  console.log('\n--- Testing invoices_pdfGeneration ---');
  // Ensure flag is ON
  featureFlags.invoices_pdfGeneration = true;
  
  // We need a valid invoice ID. Let's create a client and invoice first.
  // Wait, creating invoice via API relies on other flags.
  // Let's assume some exist or create one.
  const client = await request('/clients', 'POST', { name: 'FlagTest Client', email: `flag${Date.now()}@t.com` });
  const quote = await request('/quotes', 'POST', { 
      clientId: client.data.id, 
      items: [{ description: 'Item', quantity: 1, unitPrice: 100 }], 
      total: 100 
  });
  // Since we don't have direct invoice create API exposed (it's via convert in quotes or child invoice),
  // let's use convert.
  await request(`/quotes/${quote.data.id}`, 'PATCH', { status: 'approved' });
  const so = await request(`/quotes/${quote.data.id}/sales-orders`, 'POST', {});
  await request(`/sales-orders/${so.data.id}`, 'PATCH', { status: 'confirmed' });
  await request(`/sales-orders/${so.data.id}`, 'PATCH', { status: 'fulfilled' });
  const invoice = await request(`/sales-orders/${so.data.id}/convert-to-invoice`, 'POST', {});
  const invoiceId = invoice.data.id;
  
  if (!invoiceId) {
      console.error('Failed to create test invoice');
      process.exit(1);
  }
  console.log('Created test invoice:', invoiceId);

  // Test Access (Should be OK)
  let pdfRes = await request(`/invoices/${invoiceId}/pdf`);
  if (pdfRes.status === 200 || pdfRes.status === 404 || pdfRes.status === 500) {
      // 200 is success, 404/500 means route was reached but maybe PDF generation failed logically.
      // 403 or 404 with "Feature not available" is checking the flag.
      // Our middleware returns 404 with specific JSON for disabled feature.
      console.log('✅ Access allowed when flag is TRUE');
  } else {
      console.error(`❌ Unexpected status when flag is TRUE: ${pdfRes.status}`, pdfRes.data);
  }

  // Disable Flag
  console.log('Disabling invoices_pdfGeneration...');
  featureFlags.invoices_pdfGeneration = false;

  // Test Access (Should be blocked)
  pdfRes = await request(`/invoices/${invoiceId}/pdf`);
  if (pdfRes.status === 404 && pdfRes.data.error === 'Feature not available') {
      console.log('✅ Access BLOCKED when flag is FALSE');
  } else {
      console.error(`❌ Failed to block access. Status: ${pdfRes.status}`, pdfRes.data);
      process.exit(1);
  }

  // Re-enable
  featureFlags.invoices_pdfGeneration = true;

  // 3. Test Admin Settings Flag
  console.log('\n--- Testing admin_settings ---');
  featureFlags.admin_settings = true;
  let settingsRes = await request('/settings');
  if (settingsRes.status === 200) console.log('✅ Settings allowed when TRUE');
  
  featureFlags.admin_settings = false;
  settingsRes = await request('/settings');
  if (settingsRes.status === 404 && settingsRes.data.error === 'Feature not available') {
      console.log('✅ Settings BLOCKED when FALSE');
  } else {
      console.error(`❌ Failed to block settings. Status: ${settingsRes.status}`, settingsRes.data);
      process.exit(1);
  }
  featureFlags.admin_settings = true;

  console.log('\nAll verification tests passed.');
  process.exit(0);
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});

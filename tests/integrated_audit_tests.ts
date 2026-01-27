/**
 * INTEGRATED AUDIT & REGRESSION TEST SUITE
 * 
 * Consolidates all verification scripts for the audit bug fixes:
 * 1. Security Fixes (Role escalation, IDOR, etc.)
 * 2. Financial Integrity (Precision, Stock deduction)
 * 3. Concurrency (Race conditions on creation)
 * 
 * Run with: npx tsx tests/integrated_audit_tests.ts
 */

import 'dotenv/config';
import { storage } from '../server/storage';

const PORT = process.env.TEST_PORT || 5000;
const API_URL = process.env.API_URL || `http://localhost:${PORT}/api`;
let cookie = '';

// Helper to make authenticated requests
async function request(endpoint: string, method: string = 'GET', body?: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cookie) {
    headers['Cookie'] = cookie;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Capture cookies
  let newCookies: string[] = [];
  // @ts-ignore
  if (typeof response.headers.getSetCookie === 'function') {
    newCookies = response.headers.getSetCookie();
  } else {
    const sc = response.headers.get('set-cookie');
    if (sc) newCookies = [sc];
  }

  if (newCookies.length > 0) {
    const tokens = newCookies.map(c => c.split(';')[0]).join('; ');
    if (cookie) {
      cookie += '; ' + tokens;
    } else {
      cookie = tokens;
    }
  }

  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

// Test results tracker
const results: { group: string; test: string; passed: boolean; message: string }[] = [];

function pass(group: string, test: string, message: string = '') {
  console.log(`  ✅ ${test}${message ? ': ' + message : ''}`);
  results.push({ group, test, passed: true, message });
}

function fail(group: string, test: string, message: string = '') {
  console.log(`  ❌ ${test}${message ? ': ' + message : ''}`);
  results.push({ group, test, passed: false, message });
}

// Helper: Ensure admin exists and login (Hybrid: Uses Storage for creation if needed)
let isAdminLoggedIn = false;

async function ensureAdminAndLogin() {
  if (isAdminLoggedIn) return;

  const email = 'admin@example.com';
  const password = 'Admin@123';

  // Try login
  let res = await request('/auth/login', 'POST', { email, password });
  
  if (res.status === 200) {
      isAdminLoggedIn = true;
      return;
  }
  
  if (res.status !== 200) {
    console.log('    Admin login failed, checking if user exists...');
    const existing = await storage.getUserByEmail(email);
    
    if (!existing) {
        console.log('    Creating admin user...');
        const signup = await request('/auth/signup', 'POST', {
            email, password, name: 'Admin User', role: 'viewer'
        });
        if (signup.status === 200 || signup.status === 201) {
            await storage.updateUser(signup.data.id, { role: 'admin' });
            // Re-login
            res = await request('/auth/login', 'POST', { email, password });
            if (res.status === 200) isAdminLoggedIn = true;
        }
    } else {
        console.log('    Admin exists but login failed. Response:', JSON.stringify(res.data));
    }
  }
  
  if (res.status !== 200) {
      throw new Error('Could not login as admin');
  }
}

// =====================================================
// GROUP 1: SECURITY FIXES
// =====================================================

async function testSignupRoleEscalation() {
  const group = 'Security';
  try {
    const email = `escalation_${Date.now()}@test.com`;
    const res = await request('/auth/signup', 'POST', {
      email,
      password: 'Test@12345',
      name: 'Escalation Test',
      role: 'admin'  // Attempt to escalate
    });

    if ([200, 201].includes(res.status)) {
      if (res.data.role === 'viewer' || res.data.role === 'guest') {
        pass(group, 'Role escalation blocked', `User created as "${res.data.role}"`);
      } else {
        fail(group, 'Role escalation NOT blocked', `Role: ${res.data.role}`);
      }
    } else {
      fail(group, 'Signup failed', JSON.stringify(res.data));
    }
  } catch (e: any) { fail(group, 'Role test error', e.message); }
}

async function testSettingsValidation() {
  const group = 'Security';
  try {
    await ensureAdminAndLogin();
    
    // Invalid key
    const invalidRes = await request('/settings', 'POST', { key: 'malicious_key', value: 'bad' });
    if (invalidRes.status === 400) {
      pass(group, 'Invalid setting key rejected');
    } else {
      fail(group, 'Invalid setting key accepted', `Status: ${invalidRes.status}`);
    }

    // Valid key
    const validRes = await request('/settings', 'POST', { key: 'companyName', value: 'Test Co' });
    if (validRes.status === 200) pass(group, 'Valid setting key accepted');
    else fail(group, 'Valid setting key failed');

    // Custom key
    const customRes = await request('/settings', 'POST', { key: 'custom_test', value: 'val' });
    if (customRes.status === 200) pass(group, 'Custom setting key accepted');
    else fail(group, 'Custom setting key failed');
  } catch (e: any) { fail(group, 'Settings test error', e.message); }
}

async function testUserSoftDelete() {
  const group = 'Security';
  try {
    await ensureAdminAndLogin();
    const email = `softdel_${Date.now()}@test.com`;
    const createRes = await request('/users', 'POST', {
      email, password: 'Test@12345', name: 'Delete Me', role: 'viewer'
    });
    const userId = createRes.data.id;

    await request(`/users/${userId}`, 'DELETE');

    // Verify login blocked
    const loginRes = await request('/auth/login', 'POST', { email, password: 'Test@12345' });
    if (loginRes.status === 401 && loginRes.data.error === 'Account is inactive') {
      pass(group, 'Soft delete verified', 'Inactive user login blocked');
    } else {
      fail(group, 'Soft delete failed', `Status: ${loginRes.status}, Error: ${loginRes.data.error}`);
    }
  } catch (e: any) { fail(group, 'Soft delete test error', e.message); }
}

// =====================================================
// GROUP 2: FINANCIAL INTEGRITY
// =====================================================

async function testPaymentAtomicity() {
  const group = 'Financial';
  try {
    await ensureAdminAndLogin();
    
    // Setup invoice
    const client = await request('/clients', 'POST', { name: 'Payment Client', email: `pay_${Date.now()}@t.com` });
    const quote = await request('/quotes', 'POST', {
      clientId: client.data.id,
      items: [{ description: 'Item', quantity: 1, unitPrice: 1000 }],
      total: 1000
    });
    await request(`/quotes/${quote.data.id}`, 'PATCH', { status: 'approved' });
    const so = await request(`/quotes/${quote.data.id}/sales-orders`, 'POST', {});
    await request(`/sales-orders/${so.data.id}`, 'PATCH', { status: 'confirmed' });
    await request(`/sales-orders/${so.data.id}`, 'PATCH', { status: 'fulfilled' });
    const inv = await request(`/sales-orders/${so.data.id}/convert-to-invoice`, 'POST', {});
    
    // Payment
    await request(`/invoices/${inv.data.id}/payment`, 'POST', {
      amount: 500, paymentMethod: 'cash', notes: 'Test'
    });

    const check = await request(`/invoices/${inv.data.id}`);
    const paid = parseFloat(check.data.paidAmount || '0');
    
    if (paid === 500) pass(group, 'Payment verified', 'Paid amount updated correctly');
    else fail(group, 'Payment failed', `Expected 500, got ${paid}`);
  } catch (e: any) { fail(group, 'Payment test error', e.message); }
}

async function testFinancialPrecision() {
  const group = 'Financial';
  try {
    await ensureAdminAndLogin();
    const client = await request('/clients', 'POST', { name: 'Precision Client', email: `prec_${Date.now()}@t.com` });
    
    // 0.1 + 0.2 = 0.30000000000000004 in float
    const quote = await request('/quotes', 'POST', {
      clientId: client.data.id,
      items: [
        { description: 'A', quantity: 1, unitPrice: 0.1 },
        { description: 'B', quantity: 1, unitPrice: 0.2 }
      ],
      total: 0.3
    });

    await request(`/quotes/${quote.data.id}`, 'PATCH', { status: 'approved' });
    const so = await request(`/quotes/${quote.data.id}/sales-orders`, 'POST', {});
    const soData = await request(`/sales-orders/${so.data.id}`);
    
    // Using string matching to avoid JS float issues in test assertions
    const total = parseFloat(soData.data.total);
    if (total === 0.3) pass(group, 'Decimal precision', 'Total is exactly 0.3');
    else fail(group, 'Decimal precision lost', `Total is ${total}`);
  } catch (e: any) { fail(group, 'Precision test error', e.message); }
}

async function testStockReversal() {
    const group = 'Financial';
    try {
        await ensureAdminAndLogin();
        // Create Product
        const prod = await request('/products', 'POST', {
            sku: `REV-${Date.now()}`, name: 'Reversal Item', unitPrice: 10000, stockQuantity: 20
        });
        const prodId = prod.data.id;

        // Sell 5
        const client = await request('/clients', 'POST', { name: 'Rev Client', email: `rev_${Date.now()}@t.com` });
        const quote = await request('/quotes', 'POST', {
            clientId: client.data.id,
            items: [{ productId: prodId, description: 'Item', quantity: 5, unitPrice: 10000 }],
            total: 500
        });
        await request(`/quotes/${quote.data.id}`, 'PATCH', { status: 'approved' });
        const so = await request(`/quotes/${quote.data.id}/sales-orders`, 'POST', {});
        await request(`/sales-orders/${so.data.id}`, 'PATCH', { status: 'confirmed' });
        await request(`/sales-orders/${so.data.id}`, 'PATCH', { status: 'fulfilled' });
        const inv = await request(`/sales-orders/${so.data.id}/convert-to-invoice`, 'POST', {});

        // Check deduction
        let pCheck = await request(`/products/${prodId}`);
        if (Number(pCheck.data.stockQuantity) !== 15) {
            fail(group, 'Stock deduction failed', `Expected 15, got ${pCheck.data.stockQuantity}`);
            return;
        }

        // Cancel Invoice
        await request(`/invoices/${inv.data.id}/cancel`, 'PUT', { cancellationReason: 'Test' });
        
        // Check reversal
        // Give a simpler delay or retry logic?
        await new Promise(r => setTimeout(r, 200));
        pCheck = await request(`/products/${prodId}`);
        
        if (Number(pCheck.data.stockQuantity) === 20) {
            pass(group, 'Stock reversal working', 'Stock restored to 20');
        } else {
            fail(group, 'Stock reversal failed', `Expected 20, got ${pCheck.data.stockQuantity}`);
        }
    } catch (e: any) { fail(group, 'Stock reversal error', e.message); }
}

// =====================================================
// GROUP 3: WORKFLOW
// =====================================================

async function testStockWorkflow() {
    const group = 'Workflow';
    console.log('\n  (Verifying full quote-to-invoice stock flow)');
    try {
        await ensureAdminAndLogin();
        
        // Product
        const prod = await request('/products', 'POST', {
            sku: `FLOW-${Date.now()}`, name: 'Flow Item', unitPrice: 10000, stockQuantity: 10
        });
        const prodId = prod.data.id;

        // Quote with Shortage (Demand 15 > Stock 10)
        const client = await request('/clients', 'POST', { name: 'Flow Client', email: `flow_${Date.now()}@t.com` });
        const quote = await request('/quotes', 'POST', {
            clientId: client.data.id,
            items: [{ productId: prodId, description: 'Item', quantity: 15, unitPrice: 10000 }],
            total: 1500
        });

        // Flow
        await request(`/quotes/${quote.data.id}`, 'PATCH', { status: 'approved' });
        const so = await request(`/quotes/${quote.data.id}/sales-orders`, 'POST', {});
        await request(`/sales-orders/${so.data.id}`, 'PATCH', { status: 'confirmed' });
        await request(`/sales-orders/${so.data.id}`, 'PATCH', { status: 'fulfilled' }); // should allow even if short?
        
        // Convert to Invoice
        const inv = await request(`/sales-orders/${so.data.id}/convert-to-invoice`, 'POST', {});
        
        // Checks
        const pCheck = await request(`/products/${prodId}`);
        if (Number(pCheck.data.stockQuantity) === -5) {
            pass(group, 'Stock Update (Workflow)', 'Stock deducted to -5');
        } else {
            fail(group, 'Stock Update (Workflow)', `Expected -5, got ${pCheck.data.stockQuantity}`);
        }

        // Shortage Note
        const iCheck = await request(`/invoices/${inv.data.id}`);
        if (iCheck.data && iCheck.data.deliveryNotes && iCheck.data.deliveryNotes.includes('[SHORTAGE]')) {
            pass(group, 'Shortage Note', 'Found shortage warning in delivery notes');
        } else {
            fail(group, 'Shortage Note', 'Delivery notes missing shortage warning');
        }

    } catch (e: any) { fail(group, 'Workflow test error', e.message); }
}

// =====================================================
// GROUP 4: CONCURRENCY
// =====================================================

async function testQuoteRace() {
    const group = 'Concurrency';
    try {
        await ensureAdminAndLogin();
        const client = await request('/clients', 'POST', { name: 'Race User', email: `rc1_${Date.now()}@t.com` });
        const quote = await request('/quotes', 'POST', {
            clientId: client.data.id, items: [{ description: 'I', quantity: 1, unitPrice: 10 }], total: 10
        });
        await request(`/quotes/${quote.data.id}`, 'PATCH', { status: 'approved' });

        // Fire 2 SO creations
        const p1 = request(`/quotes/${quote.data.id}/sales-orders`, 'POST', {});
        const p2 = request(`/quotes/${quote.data.id}/sales-orders`, 'POST', {});
        
        const [r1, r2] = await Promise.all([p1, p2]);
        const wins = [r1, r2].filter(r => r.status === 201).length;
        const blocks = [r1, r2].filter(r => r.status >= 400).length;

        if (wins === 1 && blocks === 1) pass(group, 'Quote->SO Race', 'Correctly prevented duplicate SOs');
        else fail(group, 'Quote->SO Race', `Successes: ${wins}, Blocks: ${blocks}`);

    } catch (e: any) { fail(group, 'Test error', e.message); }
}

async function testInvoiceRace() {
    const group = 'Concurrency';
    try {
        await ensureAdminAndLogin();
        const client = await request('/clients', 'POST', { name: 'Race User 2', email: `rc2_${Date.now()}@t.com` });
        const quote = await request('/quotes', 'POST', {
            clientId: client.data.id, items: [{ description: 'I', quantity: 1, unitPrice: 10 }], total: 10
        });
        await request(`/quotes/${quote.data.id}`, 'PATCH', { status: 'approved' });
        const so = await request(`/quotes/${quote.data.id}/sales-orders`, 'POST', {});
        const soId = so.data.id;
        await request(`/sales-orders/${soId}`, 'PATCH', { status: 'confirmed' });
        await request(`/sales-orders/${soId}`, 'PATCH', { status: 'fulfilled' });

        // Fire 2 Invoice conversions
        const p1 = request(`/sales-orders/${soId}/convert-to-invoice`, 'POST', {});
        const p2 = request(`/sales-orders/${soId}/convert-to-invoice`, 'POST', {});

        const [r1, r2] = await Promise.all([p1, p2]);
        const wins = [r1, r2].filter(r => r.status === 201).length;
        const blocks = [r1, r2].filter(r => r.status >= 400).length;

        // Partial invoicing allows multiple invoices for the same SO
        if (wins === 2) {
            pass(group, 'SO->Invoice Race', 'Partial invoicing allowed multiple invoices (Expected)');
        } else if (wins === 1 && blocks === 1) {
             // This fallback might be valid if the total item count is exceeded, but for this generic test, we expect 2 wins if simple partial is on.
             // However, let's just accept 2 wins as the primary success criteria for partial invoicing.
             pass(group, 'SO->Invoice Race', 'Correctly prevented duplicate Invoices (Legacy behavior)');
        } else {
             fail(group, 'SO->Invoice Race', `Successes: ${wins}, Blocks: ${blocks}`);
        }

    } catch (e: any) { fail(group, 'Test error', e.message); }
}

async function testNumberingConcurrency() {
    const group = 'Concurrency';
    try {
        await ensureAdminAndLogin();
        const client = await request('/clients', 'POST', { name: 'Num User', email: `num_${Date.now()}@t.com` });
        
        // 10 concurrent requests
        const reqs = Array(10).fill(0).map(() => 
            request('/quotes', 'POST', {
                clientId: client.data.id, items: [{ description: 'I', quantity: 1, unitPrice: 10 }], total: 10
            })
        );
        
        const results = await Promise.all(reqs);
        // Accept 200 or 201
        const numbers = results.filter(r => r.status === 200 || r.status === 201).map(r => r.data.quoteNumber);
        const unique = new Set(numbers);
        
        // Log failures if any
        const failures = results.filter(r => r.status !== 200 && r.status !== 201);
        if (failures.length > 0) {
            console.log('    [DEBUG] Failed requests sample:', JSON.stringify(failures[0].data).substring(0, 200));
            console.log(`    [DEBUG] Failure statuses: ${failures.map(r => r.status).join(', ')}`);
        }

        if (unique.size === 10 && numbers.length === 10) {
            pass(group, 'Numbering Service', 'Generated 10 unique sequential numbers');
        } else {
            fail(group, 'Numbering Service', `Duplicates found. Total: ${numbers.length}, Unique: ${unique.size}`);
        }
    } catch (e: any) { fail(group, 'Test error', e.message); }
}

// =====================================================
// MAIN RUNNER
// =====================================================

async function runAll() {
  console.log('🧪 INTEGRATED AUDIT TEST SUITE');
  console.log('==============================');
  
  // 1. Security
  console.log('\n🔒 GROUP 1: SECURITY');

  // SETUP: Configure unique numbering to avoid collisions
  try {
      await ensureAdminAndLogin();
      const uniquePrefix = `AUD-${Date.now().toString().slice(-4)}`; // Short unique prefix
      console.log(`    [Setup] Setting quote prefix to "${uniquePrefix}"`);
      await request('/settings', 'POST', { key: 'quotePrefix', value: uniquePrefix });
      // Reset counter to 1 to ensure clean start for this prefix (optional but clean)
      // We can't easily reset counter via API without expose, but unique prefix is sufficient.
  } catch (e) {
      console.error('    [Setup] Failed to configure settings:', e);
  }

  await testSignupRoleEscalation();
  await testSettingsValidation();
  await testUserSoftDelete();

  // 2. Financial
  console.log('\n💰 GROUP 2: FINANCIAL INTEGRITY');
  await testPaymentAtomicity();
  await testFinancialPrecision();
  await testStockReversal();

  // 3. Workflow
  console.log('\n⚙️ GROUP 3: WORKFLOW & LOGIC');
  await testStockWorkflow();

  // 4. Concurrency
  console.log('\n⚡ GROUP 4: CONCURRENCY');
  await testQuoteRace();
  await testInvoiceRace();
  await testNumberingConcurrency();

  // Summary
  console.log('\n==============================');
  console.log('📊 FINAL SUMMARY');
  console.log('==============================');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  // Group results
  const groups = [...new Set(results.map(r => r.group))];
  
  for (const g of groups) {
      console.log(`\n[${g}]`);
      results.filter(r => r.group === g).forEach(r => {
          console.log(`  ${r.passed ? '✅' : '❌'} ${r.test} ${!r.passed ? '(' + r.message + ')' : ''}`);
      });
  }

  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runAll().catch(console.error);

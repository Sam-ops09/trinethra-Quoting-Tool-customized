import 'dotenv/config';
import { storage } from './server/storage';

const API_URL = 'http://localhost:5000/api';
let cookie = '';

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

async function testRaceCondition() {
  console.log('🏁 Starting Race Condition Test...');

  try {
    // 1. Login
    const email = `admin@example.com`;
    const password = 'Admin@123';
    await request('/auth/login', 'POST', { email, password });
    console.log('Logged in');

    // 2. Setup Data
    const clientRes = await request('/clients', 'POST', {
      name: 'Race Test Client',
      email: 'race@test.com',
      phone: '1234567890'
    });
    const clientId = clientRes.data.id;

    const productRes = await request('/products', 'POST', {
      sku: `RACE-${Date.now()}`,
      name: 'Race Item',
      description: 'Race Test',
      unitPrice: 100,
      stockQuantity: 10, // Stock 10
    });
    const productId = productRes.data.id;

    const quoteRes = await request('/quotes', 'POST', {
      clientId,
      status: 'draft',
      items: [{ productId, description: 'Race Item', quantity: 1, unitPrice: 100 }], // Qty 1
      validityDays: 30,
      quoteDate: new Date().toISOString(),
      subtotal: 100, discount: 0, cgst: 0, sgst: 0, igst: 0, shippingCharges: 0, total: 100
    });
    const quoteId = quoteRes.data.id;
    await request(`/quotes/${quoteId}`, 'PATCH', { status: 'approved' });
    const soRes = await request('/sales-orders', 'POST', { quoteId });
    const orderId = soRes.data.id;
    await request(`/sales-orders/${orderId}`, 'PATCH', { status: 'confirmed' });
    await request(`/sales-orders/${orderId}`, 'PATCH', { status: 'fulfilled' });
    
    console.log(`Setup complete. Order ID: ${orderId}. Initial Stock: 10. Qty: 1.`);

    // 3. RACE! Fire 2 requests simultaneously
    console.log('🔥 Firing 2 simultaneous requests to convert-to-invoice...');
    
    const p1 = request(`/sales-orders/${orderId}/convert-to-invoice`, 'POST', {});
    const p2 = request(`/sales-orders/${orderId}/convert-to-invoice`, 'POST', {});

    const [res1, res2] = await Promise.all([p1, p2]);

    console.log('Result 1:', res1.status, res1.data.invoiceNumber || res1.data.error);
    console.log('Result 2:', res2.status, res2.data.invoiceNumber || res2.data.error);

    // 4. Verify Results
    const successes = [res1, res2].filter(r => r.status === 201).length;
    const conflicts = [res1, res2].filter(r => r.status === 409).length;
    
    console.log(`Successes: ${successes} (Expected 1)`);
    console.log(`Conflicts: ${conflicts} (Expected 1)`);

    if (successes === 1 && conflicts === 1) {
        console.log('✅ RACE TEST PASSED: Duplicate prevented.');
    } else if (successes === 2) {
        console.error('❌ RACE TEST FAILED: Duplicate invoices created!');
        process.exit(1);
    } else {
        console.log('⚠️ Unexpected result (maybe errors):', successes, conflicts);
        // If both failed, that's also bad but not a double-creation bug.
        // It could be that the unique index stopped one, and app logic stopped the other? 
        // Or unique index stopped both (unlikely).
    }

    // 5. Verify Stock
    // Fetch product
    const prodCheck = await request(`/products/${productId}`, 'GET');
    // If we sold 1 item (success=1), stock should be 9.
    // If we sold 2 items (success=2), stock would be 8.
    const finalStock = Number(prodCheck.data.stockQuantity);
    console.log(`Final Stock: ${finalStock} (Expected 9)`);
    
    if (finalStock === 9) {
        console.log('✅ Stock Verification Checks Out');
    } else {
        console.error('❌ Stock Verification Failed');
         process.exit(1);
    }

    process.exit(0);

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

testRaceCondition();

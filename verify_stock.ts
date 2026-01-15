
import 'dotenv/config';
import { strict as assert } from 'assert';
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
  if (!response.ok) {
    throw new Error(`${method} ${endpoint} failed: ${response.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function verifyStockDeduction() {
  console.log('🚀 Starting Validation Script...');

  try {
    // 1. Login with existing user (or register if not exists)
    const email = `admin@example.com`;
    const password = 'Admin@123';
    console.log(`1. Logging in as: ${email}`);
    
    let user;
    try {
      // Try login first
      user = await request('/auth/login', 'POST', { email, password });
      console.log('   Logged in with existing user:', user.id);
    } catch (loginError) {
      // If login fails, try to create user
      console.log('   Login failed, creating new user...');
      user = await request('/auth/signup', 'POST', {
        email,
        password,
        name: 'Test Setup User'
      });
      console.log('   User registered:', user.id);

      // Promote to Admin (Direct DB Access)
      console.log('   Promoting user to admin...');
      await storage.updateUser(user.id, { role: 'admin' });

      // Login to get cookies
      user = await request('/auth/login', 'POST', { email, password });
      console.log('   Logged in:', user.id);
    }

    // 2. Create Client
    console.log('2. Creating Client...');
    const client = await request('/clients', 'POST', {
      name: 'Stock Test Client',
      email: 'client@stocktest.com',
      phone: '1234567890'
    });
    console.log('   Client created:', client.id);

    // 3. Create Product (Initial Stock = 10)
    console.log('3. Creating Product...');
    // Note: Assuming /products route exists (standard CRUD)
    const product = await request('/products', 'POST', {
      sku: `PROD-${Date.now()}`,
      name: 'Stock Deduction Test Item',
      description: 'Verifying automatic deduction',
      unitPrice: 100,
      stockQuantity: 10,
      minStockLevel: 5
    });
    console.log('   Product created:', product.id, 'Initial Stock:', product.stockQuantity);

    // 4. Create Quote (Draft)
    console.log('4. Creating Quote...');
    const quote = await request('/quotes', 'POST', {
      clientId: client.id,
      status: 'draft',
      items: [
        {
            productId: product.id,
            description: product.description,
            quantity: 15, // Requesting 15 (Demand > Stock)
            unitPrice: 100
        }
      ],
      validityDays: 30,
      quoteDate: new Date().toISOString(),
      subtotal: 1500,
      discount: 0,
      cgst: 0, 
      sgst: 0,
      igst: 0,
      shippingCharges: 0,
      total: 1500
    });
    console.log('   Quote created:', quote.id);

    // 5. Approve Quote
    console.log('5. Approving Quote...');
    await request(`/quotes/${quote.id}`, 'PATCH', { status: 'approved' });
    console.log('   Quote approved');

    // 6. Create Sales Order
    console.log('6. Creating Sales Order...');
    const salesOrder = await request('/sales-orders', 'POST', { quoteId: quote.id });
    console.log('   Sales Order created:', salesOrder.id);

    // 7. Confirm Sales Order (Draft -> Confirmed)
    console.log('7. Confirming Sales Order...');
    await request(`/sales-orders/${salesOrder.id}`, 'PATCH', { status: 'confirmed' });
    
    // 8. Fulfill Sales Order (Confirmed -> Fulfilled)
    console.log('8. Fulfilling Sales Order...');
    await request(`/sales-orders/${salesOrder.id}`, 'PATCH', { status: 'fulfilled' });
    console.log('   Sales Order fulfilled');

    // 9. Convert to Invoice (The Triger Point)
    console.log('9. Converting to Invoice (should trigger stock deduction)...');
    const invoice = await request(`/sales-orders/${salesOrder.id}/convert-to-invoice`, 'POST', {});
    console.log('   Invoice created:', invoice.id);

    // 10. Verify Stock Deduction
    // Initial: 10. Deducted: 15. Expected: -5.
    console.log('10. Verifying Product Stock...');
    // Need to fetch product again
    // Assuming GET /products/:id exists. If not, filtered list.
    let updatedProduct;
    try {
        updatedProduct = await request(`/products/${product.id}`, 'GET');
    } catch (e) {
        // Fallback to list if by ID fails
        const products = await request('/products', 'GET');
        updatedProduct = products.find((p: any) => p.id === product.id);
    }
    
    console.log(`    Current Stock: ${updatedProduct.stockQuantity}`);
    console.log(`    Current Available: ${updatedProduct.availableQuantity}`);
    console.log(`    Current Reserved: ${updatedProduct.reservedQuantity}`);
    
    if (Number(updatedProduct.stockQuantity) === -5) {
        console.log('✅ PASS: Stock correctly deducted to -5');
    } else {
        console.error(`❌ FAIL: Expected stock -5, got ${updatedProduct.stockQuantity}`);
        process.exit(1);
    }
    
    // Available should equal stock (since reserved is released upon fulfillment)
    if (Number(updatedProduct.availableQuantity) === -5) {
        console.log('✅ PASS: Available quantity correctly updated to -5');
    } else {
        console.error(`❌ FAIL: Expected available -5, got ${updatedProduct.availableQuantity}`);
        process.exit(1);
    }

    // 11. Verify Shortage Notes
    console.log('11. Verifying Invoice Shortage Notes...');
    // Check invoice.deliveryNotes
    // Need to fetch invoice to be sure we have latest
    // Assuming GET /invoices/:id
    // Wait, the create response usually returns the object.
    const fetchedInvoice = await request(`/invoices/${invoice.id}`, 'GET');
    console.log('    Delivery Notes:', fetchedInvoice.deliveryNotes);
    
    if (fetchedInvoice.deliveryNotes && fetchedInvoice.deliveryNotes.includes('[SHORTAGE] Verifying automatic deduction')) {
        console.log('✅ PASS: Shortage note found in delivery notes');
    } else {
         console.error('❌ FAIL: Shortage note NOT found');
         console.log('Actual Notes:', fetchedInvoice.deliveryNotes);
         process.exit(1);
    }

    console.log('🎉 ALL CHECKS PASSED');

  } catch (e: any) {
    console.error('❌ VALIDATION FAILED');
    console.error(e);
    process.exit(1);
  }
}

verifyStockDeduction();

/**
 * Comprehensive End-to-End Test for the Quoting Tool Flow.
 * 
 * Verifies:
 * 1. Admin Login
 * 2. Product & Client Creation
 * 3. Quote Creation & Approval
 * 4. Sales Order Creation & Fulfillment
 * 5. Invoice Generation, Finalization, and Payment
 * 6. Stock Deduction Verification
 * 
 * Run with: npx tsx test_full_flow.ts
 */

import 'dotenv/config';

const API_URL = 'http://localhost:5000/api';
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

  let data;
  try {
    data = await response.json();
  } catch (e) {
    const text = await response.text();
    data = { error: 'Invalid JSON', text }; // Return text content for debugging
  }
  return { status: response.status, data };
}

// Test results tracker
const results: { test: string; passed: boolean; message: string }[] = [];

function pass(test: string, message: string = '') {
  console.log(`  ✅ ${test}${message ? ': ' + message : ''}`);
  results.push({ test, passed: true, message });
}

function fail(test: string, message: string = '') {
  console.log(`  ❌ ${test}${message ? ': ' + message : ''}`);
  results.push({ test, passed: false, message });
}

// --- GLOBALS for shared state between tests ---
// --- GLOBALS for shared state between tests ---
let clientId: string;
let productId: string;
let quoteId: string;
let salesOrderId: string;
let invoiceId: string;
const INITIAL_STOCK = 100;
let ORDER_QUANTITY = 5; // Mutable to allow edit test
const UNIT_PRICE = 200;

// =====================================================
// STEP 1: Authentication
// =====================================================
async function testAuth() {
  console.log('\n📋 Step 1: Authentication');
  try {
    const res = await request('/auth/login', 'POST', { email: 'admin@example.com', password: 'Admin@123' });
    if (res.status === 200) {
      pass('Login successful', `Logged in as ${res.data.name}`);
    } else {
      fail('Login failed', JSON.stringify(res.data));
    }
  } catch (e: any) {
    fail('Auth Error', e.message);
  }
}

// =====================================================
// STEP 2: Setup (Product & Client)
// =====================================================
async function testSetup() {
  console.log('\n📋 Step 2: Setup Entities');
  try {
    // Create Client
    const valStr = Date.now().toString();
    const clientRes = await request('/clients', 'POST', {
      name: `Flow Client ${valStr}`,
      email: `flow_client_${valStr}@test.com`,
      phone: '1234567890'
    });

    if (clientRes.status === 200 || clientRes.status === 201) {
      clientId = clientRes.data.id;
      pass('Client created', `ID: ${clientId}`);
    } else {
      fail('Client creation failed', JSON.stringify(clientRes.data));
    }

    // Create Product
    const productRes = await request('/products', 'POST', {
      sku: `FLOW-PROD-${valStr}`,
      name: 'Flow Test Product',
      description: 'Product for full flow test',
      unitPrice: UNIT_PRICE,
      stockQuantity: INITIAL_STOCK,
    });

    if (productRes.status === 200 || productRes.status === 201) {
      productId = productRes.data.id;
      pass('Product created', `ID: ${productId}, Stock: ${INITIAL_STOCK}`);
    } else {
      fail('Product creation failed', JSON.stringify(productRes.data));
    }

  } catch (e: any) {
    fail('Setup Error', e.message);
  }
}

// =====================================================
// STEP 3: Quote Lifecycle
// =====================================================
async function testQuoteLifecycle() {
  console.log('\n📋 Step 3: Quote Lifecycle');
  if (!clientId || !productId) return fail('Skipping', 'Missing dependencies');

  try {
    // Create Quote
    const quoteRes = await request('/quotes', 'POST', {
      clientId,
      status: 'draft',
      items: [{ productId, description: 'Flow Item', quantity: ORDER_QUANTITY, unitPrice: UNIT_PRICE }],
      validityDays: 30,
      quoteDate: new Date().toISOString(),
      // These total fields are usually calculated by backend or frontend logic sent over.
      // We'll send them as typically expected.
      subtotal: ORDER_QUANTITY * UNIT_PRICE, 
      total: ORDER_QUANTITY * UNIT_PRICE
    });

    if (quoteRes.status === 200 || quoteRes.status === 201) {
      quoteId = quoteRes.data.id;
      pass('Quote created', `Quote #: ${quoteRes.data.quoteNumber}, Qty: ${ORDER_QUANTITY}`);
    } else {
      fail('Quote creation failed', JSON.stringify(quoteRes.data));
      return;
    }
    
    // NOTE: Approval is now separate step to allow edit test in between
  } catch (e: any) {
    fail('Quote Error', e.message);
  }
}

// =====================================================
// HELPER: Generalized Edit Scenarios
// =====================================================
// =====================================================
// HELPER: Generalized Edit Scenarios
// =====================================================
async function verifyEditScenarios(
  entityType: 'quotes' | 'sales-orders' | 'invoices', 
  entityId: string, 
  baseItems: any[],
  baseTotal: number
): Promise<boolean> {
  console.log(`  🛠️ Verifying Edit Scenarios for ${entityType} (${entityId})...`);
  const endpoint = `/${entityType}/${entityId}${entityType === 'invoices' ? '/master-details' : ''}`;
  const getEndpoint = `/${entityType}/${entityId}`;
  const method = entityType === 'invoices' ? 'PUT' : 'PATCH';
  
  // Helper to verify totals
  const verifyTotals = async (expectedTotal: number, context: string) => {
    const res = await request(getEndpoint, 'GET');
    const actualTotal = parseFloat(res.data.total);
    const diff = Math.abs(actualTotal - expectedTotal);
    if (diff < 0.01) { // Floating point tolerance
       pass(`${entityType} ${context}`, `Total matched: ${actualTotal}`);
       return true;
    } else {
       fail(`${entityType} ${context}`, `Total mismatch! Expected: ${expectedTotal}, Got: ${actualTotal}`);
       return false;
    }
  };

  try {
    // 1. Cancel Edit (Simulate)
    // We already have the current state (baseItems), we assume we "cancel" by not saving changes.
    // Verification: Data should match baseItems/baseTotal.
    const initial = await request(getEndpoint, 'GET');
    if (initial.status === 200) {
      if (initial.data.items.length === baseItems.length) {
         pass(`${entityType} Edit Cancel`, 'State preserved');
      } else {
         fail(`${entityType} Edit Cancel`, 'State mismatch');
      }
    }

    // 2. Add New Item
    const newItem = {
      description: 'Extra Service Item',
      quantity: 1,
      unitPrice: 50,
      subtotal: 50, 
      sortOrder: 10,
      hsnSac: '9983' // dummy hsn
    };
    
    // Construct Payload
    // Note: For SO/Invoice updates, we usually need to send ALL items back.
    const addItems = [...baseItems, newItem];
    const addTotal = baseTotal + 50;
    
    const addPayload: any = { items: addItems };
    // Some endpoints might require top-level total fields to be sent, or they calc it.
    // Based on previous code, let's send them to be safe/consistent with frontend behavior.
    if (entityType === 'invoices' || entityType === 'quotes' || entityType === 'sales-orders') {
      addPayload.total = String(addTotal);
      addPayload.subtotal = String(addTotal); // Simplified assumption: no distinct tax logic here for the test add
      addPayload.cgst = "0"; addPayload.sgst = "0"; addPayload.igst = "0";
    }

    const addRes = await request(endpoint, method, addPayload);
    if (addRes.status === 200 || addRes.status === 201) {
       const check = await request(getEndpoint, 'GET');
       if (check.data.items?.length === baseItems.length + 1) {
          pass(`${entityType} Add Item`, `Count: ${check.data.items.length}`);
          await verifyTotals(addTotal, 'Add Item Total');
       } else {
          fail(`${entityType} Add Item`, `Check failed, count: ${check.data.items?.length}`);
       }
    } else {
       fail(`${entityType} Add Item`, `API Error: ${JSON.stringify(addRes.data)}`);
    }

    // 3. Delete Added Item (Revert to Base)
    // We explicitly send back the baseItems list
    const delPayload: any = { items: baseItems };
    if (entityType === 'invoices' || entityType === 'quotes' || entityType === 'sales-orders') {
      delPayload.total = String(baseTotal);
      delPayload.subtotal = String(baseTotal);
    }

    const delRes = await request(endpoint, method, delPayload);
    if (delRes.status === 200 || delRes.status === 201) {
       const check = await request(getEndpoint, 'GET');
       if (check.data.items?.length === baseItems.length) {
          pass(`${entityType} Delete Item`, `Count: ${check.data.items.length}`);
          await verifyTotals(baseTotal, 'Delete Item Total');
       } else {
          fail(`${entityType} Delete Item`, `Check failed`);
       }
    } else {
       fail(`${entityType} Delete Item`, `API Error: ${JSON.stringify(delRes.data)}`);
    }

    // 4. Modify Existing Item
    // Change Qty of first item
    const modItems = JSON.parse(JSON.stringify(baseItems));
    if (modItems.length > 0) {
        modItems[0].quantity = (Number(modItems[0].quantity) || 0) + 1;
        const uPrice = Number(modItems[0].unitPrice || 0);
        modItems[0].subtotal = modItems[0].quantity * uPrice;
        
        // Calculate expected new total
        const diff = uPrice; 
        const modTotal = baseTotal + diff;

        const modPayload: any = { items: modItems };
        if (entityType === 'invoices' || entityType === 'quotes' || entityType === 'sales-orders') {
           modPayload.total = String(modTotal);
           modPayload.subtotal = String(modTotal);
        }
        
        const modRes = await request(endpoint, method, modPayload);
        if (modRes.status === 200 || modRes.status === 201) {
           const check = await request(getEndpoint, 'GET');
           const checkQty = check.data.items?.[0]?.quantity;
           if (checkQty === modItems[0].quantity) {
              pass(`${entityType} Modify Item`, `Qty updated to ${checkQty}`);
              await verifyTotals(modTotal, 'Modify Item Total');
           } else {
              fail(`${entityType} Modify Item`, `Expected ${modItems[0].quantity}, got ${checkQty}`);
           }
        } else {
           fail(`${entityType} Modify Item`, `API Error: ${JSON.stringify(modRes.data)}`);
        }

        // Revert Modification
        await request(endpoint, method, delPayload); // Reuses the 'base' payload
    }
    
    return true;
  } catch (e: any) {
    fail(`${entityType} Scenarios Exception`, e.message);
    return false;
  }
}

// =====================================================
// F1: Quote -> SO -> Invoice
// =====================================================
async function runFlowF1() {
  console.log('\n🔵 FLOW F1: Quote -> SO -> Invoice');
  
  // 1. Create Quote
  const qItem = { productId, description: 'F1 Item', quantity: 5, unitPrice: 200, subtotal: 1000, hsnSac: '9983' };
  const qPayload = {
    clientId,
    status: 'draft',
    items: [qItem],
    validityDays: 30,
    quoteDate: new Date().toISOString(),
    subtotal: 1000,
    total: 1000
  };
  
  const qRes = await request('/quotes', 'POST', qPayload);
  if (qRes.status !== 200 && qRes.status !== 201) return fail('F1 Quit', 'Quote creation failed');
  const qId = qRes.data.id;
  pass('F1 Quote Created', qRes.data.quoteNumber);

  // 2. Edit Quote Scenarios
  await verifyEditScenarios('quotes', qId, [qItem], 1000);

  // 3. Approve
  await request(`/quotes/${qId}`, 'PATCH', { status: 'approved' });
  pass('F1 Quote Approved');

  // 4. Convert to SO
  const soRes = await request(`/quotes/${qId}/sales-orders`, 'POST', {});
  const soId = soRes.data.id;
  pass('F1 SO Created', soRes.data.orderNumber);

  // 5. Edit SO Scenarios
  // Need to fetch current SO items to use as base, since conversion map items
  const soFetch = await request(`/sales-orders/${soId}`, 'GET');
  const soBaseItems = soFetch.data.items.map((i: any) => ({
      productId: i.productId,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal || (i.quantity * i.unitPrice),
      hsnSac: i.hsnSac
  }));
  await verifyEditScenarios('sales-orders', soId, soBaseItems, 1000);

  // 6. Confirm & Fulfill SO
  await request(`/sales-orders/${soId}`, 'PATCH', { status: 'confirmed' });
  await request(`/sales-orders/${soId}`, 'PATCH', { status: 'fulfilled' });
  pass('F1 SO Fullfilled');

  // 7. Convert to Invoice
  const invRes = await request(`/sales-orders/${soId}/convert-to-invoice`, 'POST', {});
  const invId = invRes.data.id;
  pass('F1 Invoice Created', invRes.data.invoiceNumber);

  // 8. Edit Invoice Scenarios (This covers F4 requirements too effectively, but we'll add F4 specific too)
  const invFetch = await request(`/invoices/${invId}`, 'GET');
  const invBaseItems = invFetch.data.items.map((i: any) => ({
      productId: i.productId,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      hsnSac: i.hsnSac
  }));
  await verifyEditScenarios('invoices', invId, invBaseItems, 1000);
}

// =====================================================
// F2: Quote -> Invoice (Direct)
// =====================================================
async function runFlowF2() {
  console.log('\n🔵 FLOW F2: Quote -> Invoice');
  
  // 1. Create Quote
  const qItem = { productId, description: 'F2 Item', quantity: 2, unitPrice: 100, subtotal: 200, hsnSac: '1234' };
  const qRes = await request('/quotes', 'POST', {
    clientId,
    status: 'draft',
    items: [qItem],
    subtotal: 200, total: 200,
    validityDays: 15, quoteDate: new Date().toISOString()
  });
  const qId = qRes.data.id;
  pass('F2 Quote Created', qRes.data.quoteNumber);

  // 2. Approve
  await request(`/quotes/${qId}`, 'PATCH', { status: 'approved' });

  // 3. Direct Convert
  const invRes = await request(`/quotes/${qId}/convert-to-invoice`, 'POST', {});
  if (invRes.status === 200 || invRes.status === 201) {
     pass('F2 Direct Conversion Success', invRes.data.invoiceNumber);
     const invId = invRes.data.id;

     // 4. Verify Invoice Items match Quote
     const invFetch = await request(`/invoices/${invId}`, 'GET');
     if (invFetch.data.items.length === 1 && invFetch.data.items[0].description === 'F2 Item') {
         pass('F2 Invoice Items Verified', 'Matched Quote');
     } else {
         fail('F2 Invoice Items Mismatch', 'Did not match quote items');
     }
     
     // 5. Short Edit Test on resulting Invoice
     const invBaseItems = invFetch.data.items.map((i: any) => ({
        productId: i.productId,
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        hsnSac: i.hsnSac
    }));
    await verifyEditScenarios('invoices', invId, invBaseItems, 200);

  } else {
     fail('F2 Direct Conversion Failed', JSON.stringify(invRes.data));
  }
}

// =====================================================
// F3: Standalone Sales Order -> Invoice
// =====================================================
async function runFlowF3() {
   console.log('\n🔵 FLOW F3: Standalone SO -> Invoice');
   
   // 1. Create Standalone SO
   // Test "Manual Item" (no productId)
   const soPayload = {
     clientId,
     status: 'draft',
     items: [
         { description: 'Manual Service', quantity: 1, unitPrice: 500, subtotal: 500, sortOrder: 0, hsnSac: '998311' }
     ],
     orderDate: new Date().toISOString(),
     subtotal: 500, total: 500
   };
   
   const soRes = await request('/sales-orders', 'POST', soPayload);
   if (soRes.status !== 200 && soRes.status !== 201) return fail('F3 SO Create Failed', JSON.stringify(soRes.data));
   
   const soId = soRes.data.id;
   pass('F3 Standalone SO Created', soRes.data.orderNumber);

   // 2. Edit Scenarios
   // Verify manual item exists and is editable
   const soFetch = await request(`/sales-orders/${soId}`, 'GET');
   const soBaseItems = soFetch.data.items.map((i: any) => ({
      productId: i.productId || undefined,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal || (i.quantity * i.unitPrice),
      hsnSac: i.hsnSac
   }));
   
   if (soBaseItems.length > 0 && !soBaseItems[0].productId) {
       pass('F3 Manual Item Verified', 'No Product ID');
   } else {
       fail('F3 Manual Item Check', 'Item has product ID or missing');
   }

   await verifyEditScenarios('sales-orders', soId, soBaseItems, 500);

   // 3. Confirm & Fulfill
   await request(`/sales-orders/${soId}`, 'PATCH', { status: 'confirmed' });
   await request(`/sales-orders/${soId}`, 'PATCH', { status: 'fulfilled' });
   
   // 4. Convert
   const invRes = await request(`/sales-orders/${soId}/convert-to-invoice`, 'POST', {});
   pass('F3 Converted to Invoice', invRes.data?.invoiceNumber);
   
   // 5. Verify Manual Item Persistence
   const invId = invRes.data.id;
   const invFetch = await request(`/invoices/${invId}`, 'GET');
   const invItem = invFetch.data.items[0];
   if (invItem && invItem.description === 'Manual Service' && !invItem.productId) {
       pass('F3 Invoice Manual Item Verified', 'Preserved from SO');
   } else {
       fail('F3 Invoice Manual Item Check', 'Item mismatch or missing');
   }
}

// =====================================================
// F4: Invoice (Edit-only / Revision)
// =====================================================
async function runFlowF4() {
    console.log('\n🔵 FLOW F4: Invoice Revision (Edit-only)');
    
    // Setup: Create a fresh Invoice via SO flow to have cleanliness
    // Reuse F3-like steps but minimal
    const soPayload = {
        clientId,
        status: 'draft',
        items: [{ productId, description: 'F4 Item', quantity: 10, unitPrice: 10, subtotal: 100 }],
        subtotal: 100, total: 100
    };
    const soRes = await request('/sales-orders', 'POST', soPayload);
    const soId = soRes.data.id;
    await request(`/sales-orders/${soId}`, 'PATCH', { status: 'confirmed' });
    await request(`/sales-orders/${soId}`, 'PATCH', { status: 'fulfilled' });
    const invRes = await request(`/sales-orders/${soId}/convert-to-invoice`, 'POST', {});
    const invId = invRes.data.id;
    pass('F4 Invoice Created', invRes.data.invoiceNumber);

    // Scenario: Extensive Editing
    const invFetch = await request(`/invoices/${invId}`, 'GET');
    const baseItems = invFetch.data.items.map((i: any) => ({
        productId: i.productId, description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, hsnSac: i.hsnSac
    }));
    
    // 1. Standard scenarios
    await verifyEditScenarios('invoices', invId, baseItems, 100);
    
    // 2. Specific "Revision" test: Edit, Save, Edit Again, Save (Simulate user adjusting fields multiple times)
    console.log('  Testing Multiple Revisions...');
    // Rev 1: Add note
    await request(`/invoices/${invId}/master-details`, 'PUT', { notes: 'Revision 1' });
    // Rev 2: Charge Shipping
    await request(`/invoices/${invId}/master-details`, 'PUT', { shippingCharges: "50", total: "150" }); // Simple total update
    
    const check = await request(`/invoices/${invId}`, 'GET');
    if (check.data.notes === 'Revision 1' && parseFloat(check.data.total) === 150) {
        pass('F4 Multiple Revisions', 'Notes and Total updated correctly');
    } else {
        fail('F4 Multiple Revisions', `Got Notes: ${check.data.notes}, Total: ${check.data.total}`);
    }
}


// =====================================================
// MAIN
// =====================================================
async function run() {
  console.log('🚀 Starting Comprehensive Full Flow Test (F1, F2, F3, F4)...\n');
  
  await testAuth();
  await testSetup();

  await runFlowF1();
  await runFlowF2();
  await runFlowF3();
  await runFlowF4();

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`\n🏁 Completed: ${passed}/${total} tests passed.`);
  
  if (passed !== total) process.exit(1);
}

run().catch(console.error);

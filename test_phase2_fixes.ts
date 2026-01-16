
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

  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

async function runTests() {
  console.log("🧪 PHASE 2 FIXES API VERIFICATION SUITE");
  console.log("=======================================\n");

  // Use seeded admin user
  const email = "admin@example.com";
  const password = "Admin@123";
  
  console.log(`Logging in as seeded admin: ${email}`);

  // Login
  const loginRes = await request('/auth/login', 'POST', { email, password });
  if (loginRes.status !== 200) {
      console.error("Login failed:", loginRes.data);
      throw new Error("Login failed - ensure admin@example.com exists (run seed script if needed)");
  }
  console.log("✅ Logged in");

  // ----------------------------------------------------------------
  // Test 1: Client Soft Delete
  // ----------------------------------------------------------------
  console.log("\n📋 Test 1: Client Soft Delete");
  
  const clientRes = await request('/clients', 'POST', {
    name: "Soft Delete Client",
    email: "softdelete@test.com",
    gstin: "29ABCDE1234F1Z5",
    address: "123 Test St",
  });
  
  if (clientRes.status !== 200) {
      console.error("Client creation failed:", clientRes.data);
      throw new Error("Client creation failed");
  }

  const client = clientRes.data;

  console.log(`Created client ${client.id}`);

  // Delete Client
  const deleteRes = await request(`/clients/${client.id}`, 'DELETE');
  if (deleteRes.status !== 200) throw new Error("Client deletion failed");
  console.log("Client deleted API call success");

  // Verify Soft Delete
  const getRes = await request(`/clients/${client.id}`, 'GET');
  if (getRes.status === 200) {
      if (getRes.data.isActive === false) {
          console.log("✅ Client soft deleted successfully (isActive: false)");
      } else {
          console.error("❌ Client still active (isActive: true or undefined)");
          console.log("Client data:", getRes.data);
      }
  } else {
      console.log("❌ Client not found (Hard Deleted?) - Status:", getRes.status);
  }

  // ----------------------------------------------------------------
  // Test 2: Template Deletion Validation
  // ----------------------------------------------------------------
  console.log("\n📋 Test 2: Template Deletion Validation");

  // Create Template
  const templateRes = await request('/templates', 'POST', {
    name: "Protected Template",
    type: "quote",
    content: "<h1>Template</h1>",
    isDefault: false,
  });
  const template = templateRes.data;
  
  // Create Product
  const productRes = await request('/products', 'POST', {
      name: "Test Product",
      sku: `PROD-${Date.now()}`,
      price: 100,
      description: "Desc",
      stockQuantity: 100
  });
  const product = productRes.data;

  // Create Quote using Template
  const quoteRes = await request('/quotes', 'POST', {
      clientId: client.id, // Soft deleted client might still work for quote creation? Typically yes unless validated.
      // Wait, if client is soft deleted, quote creation might fail if we validate client.
      // Let's create a new client just in case.
  });
  
  // Create active client for quote
  const activeClientRes = await request('/clients', 'POST', {
      name: "Active Client",
      email: "active@test.com",
      gstin: "22AAAAA0000A1Z5",
      address: "Address"
  });
  const activeClient = activeClientRes.data;

  const quoteCreateRes = await request('/quotes', 'POST', {
    clientId: activeClient.id,
    templateId: template.id,
    items: [{ productId: product.id, quantity: 1, unitPrice: 100, description: "Item" }],
    subtotal: 100,
    total: 100,
    discount: 0,
    shippingCharges: 0,
    cgst: 0,
    sgst: 0,
    igst: 0
  });

  if (quoteCreateRes.status !== 200) {
      console.error("Quote creation failed:", quoteCreateRes.data);
      throw new Error("Setup for template test failed");
  }

  // Try Delete Template
  const deleteTemplateRes = await request(`/templates/${template.id}`, 'DELETE');
  
  if (deleteTemplateRes.status !== 200) {
      console.log("✅ Template deletion blocked as expected");
      console.log("Error:", deleteTemplateRes.data.error);
  } else {
      console.error("❌ Template deletion allowed despite quote reference!");
  }

  // ----------------------------------------------------------------
  // Test 3: Payment Overpayment Validation
  // ----------------------------------------------------------------
  console.log("\n📋 Test 3: Payment Overpayment Validation");

  const quoteId = quoteCreateRes.data.id;
  
  // Approve Quote
  await request(`/quotes/${quoteId}`, 'PATCH', { status: 'approved' });
  
  // Convert to Sales Order
  // Use correct endpoint: POST /sales-orders with quoteId in body
  const soRes = await request(`/sales-orders`, 'POST', { quoteId });
  if (soRes.status !== 200) {
      console.error("Convert to SO failed:", soRes.data);
      throw new Error("Convert to SO failed");
  }
  const soId = soRes.data.id;

  // Confirm SO
  await request(`/sales-orders/${soId}`, 'PATCH', { status: 'confirmed' });

  // Fulfill SO
  const patchRes = await request(`/sales-orders/${soId}`, 'PATCH', { status: 'fulfilled' });
  if (patchRes.status !== 200) {
      console.error("Set SO status fulfilled failed:", patchRes.data);
      throw new Error("Set SO fulfilled failed");
  }

  // Convert to Invoice
  const invRes = await request(`/sales-orders/${soId}/convert-to-invoice`, 'POST');
  if (invRes.status !== 200 && invRes.status !== 201) {
      console.error("Convert to Invoice failed:", invRes.data);
      throw new Error("Convert to Invoice failed");
  }
  const invoice = invRes.data;
  
  if (!invoice.total) { // Basic check
      console.error("Invalid invoice data:", invoice);
      throw new Error("Invalid invoice returned");
  }
  
  console.log(`Invoice Total: ${invoice.total}`);

  // Overpay
  const overPaymentAmount = parseFloat(invoice.total) + 100;
  const payRes = await request(`/invoices/${invoice.id}/payment`, 'POST', {
      amount: overPaymentAmount,
      paymentMethod: "cash",
      paymentDate: new Date().toISOString()
  });

  if (payRes.status !== 200) {
      console.log("✅ Overpayment blocked successfully");
      console.log("Response:", payRes.data.error);
  } else {
      console.error("❌ Overpayment allowed!");
  }

  // Valid Payment
  const validPayRes = await request(`/invoices/${invoice.id}/payment`, 'POST', {
      amount: 10,
      paymentMethod: "cash",
      paymentDate: new Date().toISOString()
  });

  if (validPayRes.status === 200) {
      const updatedInvoice = (await request(`/invoices/${invoice.id}`)).data;
      console.log(`✅ Valid payment accepted. Remaining Amount: ${updatedInvoice.remainingAmount}`);
      
      const expected = parseFloat(invoice.total) - 10;
      if (Math.abs(parseFloat(updatedInvoice.remainingAmount) - expected) < 0.01) {
             console.log("✅ Remaining amount calculation correct");
      } else {
             console.error(`❌ Remaining amount calculation incorrect: Expected ${expected}, Got ${updatedInvoice.remainingAmount}`);
      }
  } else {
      console.error("❌ Valid payment failed:", validPayRes.data);
  }

  console.log("\n✅ Phase 2 Verification Completed");
}

runTests().catch(console.error);

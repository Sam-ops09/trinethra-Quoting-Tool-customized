
import 'dotenv/config';

const API_URL = 'http://localhost:5000/api';
let cookie = '';

async function request(endpoint: string, method: string = 'GET', body?: any) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cookie) headers['Cookie'] = cookie;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Capture cookies
  // @ts-ignore
  if (typeof response.headers.getSetCookie === 'function') {
    const newCookies = response.headers.getSetCookie();
    if (newCookies.length > 0) {
        const tokens = newCookies.map(c => c.split(';')[0]).join('; ');
        cookie = cookie ? cookie + '; ' + tokens : tokens;
    }
  } else {
    const sc = response.headers.get('set-cookie');
    if (sc) {
        const token = sc.split(';')[0];
        cookie = cookie ? cookie + '; ' + token : token;
    }
  }

  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

async function run() {
    console.log('🧪 DEBUGGING PAYMENT FAILURE');
    
    // Login
    await request('/auth/login', 'POST', { email: 'admin@example.com', password: 'Admin@123' });

    // Setup invoice
    const client = await request('/clients', 'POST', { name: 'Payment Debug Client', email: `paydebug_${Date.now()}@t.com` });
    const quote = await request('/quotes', 'POST', {
      clientId: client.data.id,
      items: [{ description: 'Item', quantity: 1, unitPrice: 1000 }],
      total: 1000
    });
    
    await request(`/quotes/${quote.data.id}`, 'PATCH', { status: 'approved' });
    const so = await request(`/quotes/${quote.data.id}/sales-orders`, 'POST', {});
    await request(`/sales-orders/${so.data.id}`, 'PATCH', { status: 'confirmed' });
    await request(`/sales-orders/${so.data.id}`, 'PATCH', { status: 'fulfilled' });
    const invResponse = await request(`/sales-orders/${so.data.id}/convert-to-invoice`, 'POST', {});
    
    const invId = invResponse.data.id;
    console.log('Invoice created:', invId);

    // Fetch and log invoice details
    const invDetails = await request(`/invoices/${invId}`);
    console.log('Invoice Details:', JSON.stringify(invDetails.data, null, 2));

    // Payment attempt (exactly as in failing test)
    console.log('Attempting payment: 500, cash');
    const paymentRes = await request(`/invoices/${invId}/payment`, 'POST', {
      amount: 500, paymentMethod: 'cash', notes: 'Test'
    });

    console.log('Payment Response Status:', paymentRes.status);
    console.log('Payment Response Data:', JSON.stringify(paymentRes.data, null, 2));

    const check = await request(`/invoices/${invId}`);
    console.log('Invoice Paid Amount:', check.data.paidAmount);
}

run();

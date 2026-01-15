import { test, expect, makeAuthenticatedRequest, createTestUser, testData } from './setup';

test.describe('Manual Line Items & Custom Pricing Workflow', () => {
  const BASE_URL = 'http://localhost:5000/api';

  test('should support manual line items and custom pricing throughout Quote -> SO -> Invoice workflow', async ({ request }) => {
    // 1. Setup User and Client
    const { request: authRequest } = await createTestUser(request);

    const clientRes = await makeAuthenticatedRequest(
      authRequest,
      `${BASE_URL}/clients`,
      'POST',
      undefined,
      testData.client()
    );
    const client = await clientRes.json();

    // 2. Create Product for Mixed Item Test
    const productRes = await makeAuthenticatedRequest(
      authRequest,
      `${BASE_URL}/products`,
      'POST',
      undefined,
      {
        name: 'Catalog Product',
        description: 'Standard product',
        unitPrice: '100',
        sku: `CAT-${Date.now()}`,
        stockQuantity: 100,
      }
    );
    if (productRes.status() !== 200) {
        console.log('Product Creation Error:', await productRes.json());
    }
    expect(productRes.status()).toBe(200);
    const product = await productRes.json();

    // 2.5 Set Unique Quote Prefix to avoid collisions
    const prefix = `QT${Date.now()}`;
    await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/settings`,
        'POST',
        undefined,
        { key: 'quotePrefix', value: prefix }
    );

    // 3. Create Quote with Mixed Items (Catalog + Manual) and Custom Prices
    const quoteData = {
      clientId: client.id,
      status: 'draft',
      items: [
        {
          // Catalog Item with OVERRIDDEN price (Base: 100, Custom: 150)
          productId: product.id,
          description: product.name,
          quantity: 2,
          unitPrice: 150, 
        },
        {
          // Manual (Free-text) Item
          productId: null,
          description: 'Manual Service Fee',
          quantity: 1,
          unitPrice: 500,
        }
      ],
      total: '800.00', // (2 * 150) + (1 * 500)
    };

    const quoteRes = await makeAuthenticatedRequest(
      authRequest,
      `${BASE_URL}/quotes`,
      'POST',
      undefined,
      quoteData
    );
    expect(quoteRes.status()).toBe(200);
    const createdQuote = await quoteRes.json();

    // Fetch full quote details to verify items
    const quoteDetailsRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${createdQuote.id}`,
        'GET'
    );
    expect(quoteDetailsRes.status()).toBe(200);
    const quote = await quoteDetailsRes.json();

    // Verify Quote Items
    expect(quote.items).toHaveLength(2);
    const quoteCatalogItem = quote.items.find((i: any) => i.productId === product.id);
    const quoteManualItem = quote.items.find((i: any) => i.productId === null);

    expect(quoteCatalogItem.unitPrice).toBe('150.00'); // Custom price persisted
    expect(quoteManualItem.description).toBe('Manual Service Fee');
    expect(quoteManualItem.unitPrice).toBe('500.00');

    // Approve Quote for Conversion
    await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'PATCH',
        undefined,
        { status: 'approved' }
    );

    // 4. Convert to Sales Order
    const soRes = await makeAuthenticatedRequest(
      authRequest,
      `${BASE_URL}/sales-orders`,
      'POST',
      undefined,
      { quoteId: quote.id }
    );
    expect(soRes.status()).toBe(200);
    const salesOrder = await soRes.json();

    // Verify SO Items
    const soItemsRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/sales-orders/${salesOrder.id}`,
        'GET'
    );
    const soDetails = await soItemsRes.json();
    expect(soDetails.items).toHaveLength(2);
    
    const soCatalogItem = soDetails.items.find((i: any) => i.productId === product.id);
    const soManualItem = soDetails.items.find((i: any) => i.productId === null);

    expect(soCatalogItem.unitPrice).toBe('150.00');
    expect(soManualItem.description).toBe('Manual Service Fee');
    expect(soManualItem.unitPrice).toBe('500.00');

    // Confirm and Fulfill SO for Invoice Conversion
    await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/sales-orders/${salesOrder.id}`,
        'PATCH',
        undefined,
        { status: 'confirmed' }
    );
    await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/sales-orders/${salesOrder.id}`,
        'PATCH',
        undefined,
        { status: 'fulfilled', actualDeliveryDate: new Date().toISOString() }
    );

    // 5. Convert to Invoice
    const invoiceRes = await makeAuthenticatedRequest(
      authRequest,
      `${BASE_URL}/sales-orders/${salesOrder.id}/convert-to-invoice`,
      'POST'
    );
    expect(invoiceRes.status()).toBe(201);
    const invoice = await invoiceRes.json();

    // Verify Invoice Items
    const invoiceDetailsRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}`,
        'GET'
    );
    const invoiceDetails = await invoiceDetailsRes.json();
    expect(invoiceDetails.items).toHaveLength(2);

    const invCatalogItem = invoiceDetails.items.find((i: any) => i.productId === product.id);
    const invManualItem = invoiceDetails.items.find((i: any) => i.productId === null);

    expect(invCatalogItem.unitPrice).toBe('150.00');
    expect(invManualItem.description).toBe('Manual Service Fee');
    expect(invManualItem.unitPrice).toBe('500.00');

    // 6. Edit Invoice: Add another Manual Item
    // Note: We need to use the master-details endpoint for editing items
    const editData = {
      items: [
        ...invoiceDetails.items,
        {
          productId: null,
          description: 'Late Added Fee',
          quantity: 1,
          unitPrice: 50,
        }
      ],
      // Recalculate totals roughly (backend handles logic but we pass totals usually)
      subtotal: '850.00',
      total: '850.00'
    };

    const editRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}/master-details`,
        'PUT',
        undefined,
        editData
    );
    expect(editRes.status()).toBe(200);

    // Verify Edited Invoice
    const finalInvoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}`,
        'GET'
    );
    const finalInvoice = await finalInvoiceRes.json();
    expect(finalInvoice.items).toHaveLength(3);
    
    const addedItem = finalInvoice.items.find((i: any) => i.description === 'Late Added Fee');
    expect(addedItem).toBeDefined();
    expect(addedItem.productId).toBeNull();
    expect(addedItem.unitPrice).toBe('50.00');
  });
});

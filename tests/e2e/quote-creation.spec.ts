import { test, expect, makeAuthenticatedRequest, createTestUser, testData } from './setup';

test.describe('Quote Creation - Comprehensive Scenarios', () => {
  const BASE_URL = 'http://localhost:5000/api';

  test.describe('1.1 Basic Quote Creation', () => {
    test('1.1.1 should create quote with minimal data', async ({ request }) => {
      const { request: authRequest, userId } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      expect(clientRes.status()).toBe(200);
      const client = await clientRes.json();

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        {
          clientId: client.id,
          status: 'draft',
        }
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();
      expect(quote.id).toBeDefined();
      expect(quote.quoteNumber).toBeDefined();
      expect(quote.quoteNumber).toMatch(/^PO-\d+$/);
      expect(quote.clientId).toBe(client.id);
      expect(quote.status).toBe('draft');
      expect(quote.createdBy).toBe(userId);
    });

    test('1.1.2 should create quote with all basic fields', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const quoteData = {
        clientId: client.id,
        status: 'draft',
        validityDays: 30,
        quoteDate: new Date().toISOString(),
        notes: 'Payment terms: Net 30',
        termsAndConditions: 'Standard terms apply',
        subtotal: '5000.00',
        discount: '500.00',
        cgst: '810.00',
        sgst: '810.00',
        igst: '0.00',
        shippingCharges: '100.00',
        total: '6220.00',
      };

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        quoteData
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();
      expect(quote.status).toBe('draft');
      expect(quote.validityDays).toBe(30);
      expect(quote.notes).toBe('Payment terms: Net 30');
      expect(quote.termsAndConditions).toBe('Standard terms apply');
      expect(quote.subtotal).toBeDefined();
      expect(quote.discount).toBeDefined();
      expect(quote.total).toBeDefined();
    });
  });

  test.describe('1.2 Quote with Items', () => {
    test('1.2.1 should create quote with single item', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const quoteData = {
        clientId: client.id,
        status: 'draft',
        subtotal: '1500.00',
        total: '1500.00',
        items: [
          {
            description: 'Consulting Services',
            quantity: 10,
            unitPrice: 150.00,
          },
        ],
      };

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        quoteData
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();
      expect(quote.id).toBeDefined();

      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );

      expect(detailRes.status()).toBe(200);
      const details = await detailRes.json();
      expect(details.items).toBeDefined();
      expect(details.items.length).toBe(1);
      expect(details.items[0].description).toBe('Consulting Services');
      expect(details.items[0].quantity).toBe(10);
      expect(details.items[0].unitPrice).toBeDefined();
    });

    test('1.2.2 should create quote with multiple items', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const items = [
        { description: 'Item 1', quantity: 5, unitPrice: 100 },
        { description: 'Item 2', quantity: 3, unitPrice: 250 },
        { description: 'Item 3', quantity: 1, unitPrice: 500 },
        { description: 'Item 4', quantity: 2, unitPrice: 75 },
        { description: 'Item 5', quantity: 10, unitPrice: 50 },
      ];

      const quoteData = {
        clientId: client.id,
        status: 'draft',
        total: '2900.00',
        items,
      };

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        quoteData
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();

      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );

      const details = await detailRes.json();
      expect(details.items.length).toBe(5);

      const expectedSubtotals = [500, 750, 500, 150, 500];
      details.items.forEach((item: any, index: number) => {
        expect(item.sortOrder).toBe(index);
        expect(Number(item.subtotal)).toBe(expectedSubtotals[index]);
      });
    });

    test('1.2.3 should create quote with empty items array', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const quoteData = {
        clientId: client.id,
        status: 'draft',
        items: [],
      };

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        quoteData
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();
      expect(quote.id).toBeDefined();

      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );
      const details = await detailRes.json();
      expect(details.items.length).toBe(0);
    });

    test('1.2.4 should calculate item subtotals correctly', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const quoteData = {
        clientId: client.id,
        status: 'draft',
        items: [
          { description: 'Test Item', quantity: 7, unitPrice: 125.50 },
        ],
      };

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        quoteData
      );

      const quote = await quoteRes.json();
      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );
      const details = await detailRes.json();
      expect(Number(details.items[0].subtotal)).toBe(878.50);
    });
  });

  test.describe('1.3 Quote Validation & Error Handling', () => {
    test('1.3.1 should fail creating quote without clientId', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        { status: 'draft' }
      );

      expect([400, 500]).toContain(quoteRes.status());
    });

    test('1.3.2 should fail creating quote with invalid clientId', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        {
          clientId: 'invalid-uuid',
          status: 'draft',
        }
      );

      expect([400, 500]).toContain(quoteRes.status());
    });

    test('1.3.3 should handle invalid date format gracefully', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const quoteData = {
        clientId: client.id,
        status: 'draft',
        quoteDate: 'not-a-date',
      };

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        quoteData
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();
      expect(quote.quoteDate).toBeDefined();
    });

    test('1.3.4 should allow negative quantity in item', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const quoteData = {
        clientId: client.id,
        status: 'draft',
        items: [
          { description: 'Test', quantity: -5, unitPrice: 150 },
        ],
      };

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        quoteData
      );

      expect([200, 400]).toContain(quoteRes.status());
    });

    test('1.3.5 should handle zero quantity and price', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const quoteData = {
        clientId: client.id,
        status: 'draft',
        items: [
          { description: 'Test', quantity: 0, unitPrice: 0 },
        ],
      };

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        quoteData
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();
      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );
      const details = await detailRes.json();
      expect(Number(details.items[0].subtotal)).toBe(0);
    });

    test('1.3.6 should handle very large numbers', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const quoteData = {
        clientId: client.id,
        status: 'draft',
        items: [
          { description: 'Test', quantity: 1000, unitPrice: 999999.99 },
        ],
      };

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        quoteData
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();
      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );
      const details = await detailRes.json();
      expect(details.items[0].subtotal).toBeDefined();
    });

    test('1.3.7 should fail without authentication', async ({ request }) => {
      const quoteRes = await request.post(`${BASE_URL}/quotes`, {
        data: { clientId: 'test', status: 'draft' },
      });

      expect([401, 403]).toContain(quoteRes.status());
    });
  });

  test.describe('1.4 Quote Date Validation', () => {
    test('1.4.1 should accept ISO date string', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const isoDate = '2025-12-03T10:30:00Z';
      const quoteData = {
        clientId: client.id,
        status: 'draft',
        quoteDate: isoDate,
      };

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        quoteData
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();
      expect(quote.quoteDate).toBeDefined();
    });

    test('1.4.2 should default to current date', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const beforeTime = new Date();
      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        { clientId: client.id, status: 'draft' }
      );
      const afterTime = new Date();

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();
      const quoteDate = new Date(quote.quoteDate);
      expect(quoteDate.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(quoteDate.getTime()).toBeLessThanOrEqual(afterTime.getTime() + 1000);
    });

    test('1.4.3 should accept future dates', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const quoteData = {
        clientId: client.id,
        status: 'draft',
        quoteDate: futureDate.toISOString(),
      };

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        quoteData
      );

      expect(quoteRes.status()).toBe(200);
    });

    test('1.4.4 should accept past dates', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const pastDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      const quoteData = {
        clientId: client.id,
        status: 'draft',
        quoteDate: pastDate.toISOString(),
      };

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        quoteData
      );

      expect(quoteRes.status()).toBe(200);
    });
  });

  test.describe('1.5 Quote Update Operations', () => {
    test('1.5.1 should update draft quote', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        { clientId: client.id, status: 'draft' }
      );
      const quote = await quoteRes.json();

      const updateRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'PATCH',
        undefined,
        {
          notes: 'Updated notes',
          discount: '1000.00',
        }
      );

      expect(updateRes.status()).toBe(200);
      const updated = await updateRes.json();
      expect(updated.notes).toBe('Updated notes');
      expect(updated.discount).toBeDefined();
    });

    test('1.5.2 should prevent editing invoiced quote', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        { clientId: client.id, status: 'draft' }
      );
      const quote = await quoteRes.json();

      const convertRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      expect(convertRes.status()).toBe(200);

      const updateRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'PATCH',
        undefined,
        { notes: 'New notes' }
      );

      expect(updateRes.status()).toBe(400);
      const error = await updateRes.json();
      expect(error.error).toContain('invoiced');
    });

    test('1.5.3 should fail updating non-existent quote', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const updateRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/invalid-id`,
        'PATCH',
        undefined,
        { notes: 'New notes' }
      );

      expect(updateRes.status()).toBe(404);
    });
  });

  test.describe('Quote Retrieval', () => {
    test('should retrieve all quotes', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      for (let i = 0; i < 3; i++) {
        await makeAuthenticatedRequest(
          authRequest,
          `${BASE_URL}/quotes`,
          'POST',
          undefined,
          { clientId: client.id, status: 'draft' }
        );
      }

      const listRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'GET'
      );

      expect(listRes.status()).toBe(200);
      const quotes = await listRes.json();
      expect(Array.isArray(quotes)).toBeTruthy();
      expect(quotes.length).toBeGreaterThanOrEqual(3);
    });

    test('should retrieve quote by ID with items', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        {
          clientId: client.id,
          status: 'draft',
          items: [
            { description: 'Item 1', quantity: 5, unitPrice: 100 },
            { description: 'Item 2', quantity: 3, unitPrice: 50 },
          ],
        }
      );
      const quote = await quoteRes.json();

      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );

      expect(detailRes.status()).toBe(200);
      const details = await detailRes.json();
      expect(details.client).toBeDefined();
      expect(details.items).toBeDefined();
      expect(details.items.length).toBe(2);
    });
  });
});

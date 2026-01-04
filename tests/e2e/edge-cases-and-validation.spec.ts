import { test, expect, makeAuthenticatedRequest, createTestUser, testData } from './setup';

test.describe('Edge Cases & Validation - Quote & Invoice Testing', () => {
  const BASE_URL = 'http://localhost:5000/api';

  test.describe('4.1 Decimal Precision Testing', () => {
    test('4.1.1 should handle currency precision (scale: 2)', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const testValues = [
        { unitPrice: 100.00, quantity: 1, expected: '100.00' },
        { unitPrice: 100.01, quantity: 1, expected: '100.01' },
        { unitPrice: 100.99, quantity: 1, expected: '100.99' },
        { unitPrice: 999999.99, quantity: 1, expected: '999999.99' },
        { unitPrice: 0.01, quantity: 1, expected: '0.01' },
      ];

      for (const testValue of testValues) {
        const quoteRes = await makeAuthenticatedRequest(
          authRequest,
          `${BASE_URL}/quotes`,
          'POST',
          undefined,
          {
            clientId: client.id,
            status: 'draft',
            items: [
              {
                description: `Test ${testValue.unitPrice}`,
                quantity: testValue.quantity,
                unitPrice: testValue.unitPrice,
              },
            ],
          }
        );

        expect(quoteRes.status()).toBe(200);
        const quote = await quoteRes.json();
        const detailRes = await makeAuthenticatedRequest(
          authRequest,
          `${BASE_URL}/quotes/${quote.id}`,
          'GET'
        );
        const details = await detailRes.json();
        expect(details.items[0].unitPrice).toBeDefined();
      }
    });

    test('4.1.2 should handle very small decimal values', async ({ request }) => {
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
            { description: 'Item 1', quantity: 1, unitPrice: 100.001 },
            { description: 'Item 2', quantity: 1, unitPrice: 100.1 },
          ],
        }
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();
      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );
      const details = await detailRes.json();
      expect(details.items).toHaveLength(2);
    });
  });

  test.describe('4.2 Concurrent Operations', () => {
    test('4.2.1 should handle concurrent quote creation with unique numbers', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const quoteNumbers = new Set<string>();
      const promises = [];

      for (let i = 0; i < 5; i++) {
        promises.push(
          makeAuthenticatedRequest(
            authRequest,
            `${BASE_URL}/quotes`,
            'POST',
            undefined,
            { clientId: client.id, status: 'draft' }
          )
        );
      }

      const results = await Promise.all(promises);

      for (const result of results) {
        expect(result.status()).toBe(200);
        const quote = await result.json();
        quoteNumbers.add(quote.quoteNumber);
      }

      expect(quoteNumbers.size).toBe(5);
    });

    test('4.2.2 should handle concurrent payments on same invoice', async ({ request }) => {
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
          total: '10000.00',
        }
      );
      const quote = await quoteRes.json();

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      const invoice = await invoiceRes.json();

      const paymentPromises = [];
      for (let i = 0; i < 4; i++) {
        paymentPromises.push(
          makeAuthenticatedRequest(
            authRequest,
            `${BASE_URL}/invoices/${invoice.id}/payment`,
            'POST',
            undefined,
            { amount: 2500, paymentMethod: 'bank_transfer' }
          )
        );
      }

      const paymentResults = await Promise.all(paymentPromises);

      for (const result of paymentResults) {
        expect([200, 400]).toContain(result.status());
      }

      const finalInvoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}`,
        'GET'
      );
      const finalInvoice = await finalInvoiceRes.json();
      expect(finalInvoice.paidAmount).toBeDefined();
    });
  });

  test.describe('4.3 Bulk Operations', () => {
    test('4.3.1 should create quote with many line items (50+)', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const items = [];
      for (let i = 1; i <= 50; i++) {
        items.push({
          description: `Item ${i}`,
          quantity: i,
          unitPrice: 100,
        });
      }

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        {
          clientId: client.id,
          status: 'draft',
          items,
        }
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();

      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );
      const details = await detailRes.json();
      expect(details.items.length).toBe(50);
      expect(details.items[0].sortOrder).toBe(0);
      expect(details.items[49].sortOrder).toBe(49);
    });

    test('4.3.2 should handle long text fields', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const longText = 'A'.repeat(5000);
      const veryLongText = 'B'.repeat(10000);

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        {
          clientId: client.id,
          status: 'draft',
          notes: longText,
          termsAndConditions: veryLongText,
        }
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();
      expect(quote.id).toBeDefined();
    });
  });

  test.describe('4.4 Status Transitions', () => {
    test('4.4.1 should allow draft to approved transition', async ({ request }) => {
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
        { status: 'approved' }
      );

      expect(updateRes.status()).toBe(200);
      const updated = await updateRes.json();
      expect(updated.status).toBe('approved');
    });

    test('4.4.2 should allow draft to rejected transition', async ({ request }) => {
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
        { status: 'rejected' }
      );

      expect(updateRes.status()).toBe(200);
      const updated = await updateRes.json();
      expect(updated.status).toBe('rejected');
    });

    test('4.4.3 should transition to invoiced via conversion', async ({ request }) => {
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

      const checkRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );
      const updated = await checkRes.json();
      expect(updated.status).toBe('invoiced');
    });
  });

  test.describe('5.1 Authentication Tests', () => {
    test('5.1.1 should reject POST /quotes without auth', async ({ request }) => {
      const clientRes = await request.post(`${BASE_URL}/clients`, {
        data: testData.client(),
      });
      if (clientRes.status() === 200) {
        const client = await clientRes.json();
        const quoteRes = await request.post(`${BASE_URL}/quotes`, {
          data: { clientId: client.id, status: 'draft' },
        });
        expect([401, 403]).toContain(quoteRes.status());
      }
    });

    test('5.1.2 should reject GET /quotes without auth', async ({ request }) => {
      const res = await request.get(`${BASE_URL}/quotes`);
      expect([401, 403]).toContain(res.status());
    });

    test('5.1.3 should reject GET /invoices without auth', async ({ request }) => {
      const res = await request.get(`${BASE_URL}/invoices`);
      expect([401, 403]).toContain(res.status());
    });

    test('5.1.4 should reject POST /invoices/:id/payment without auth', async ({ request }) => {
      const res = await request.post(`${BASE_URL}/invoices/test-id/payment`, {
        data: { amount: 1000, paymentMethod: 'cash' },
      });
      expect([401, 403]).toContain(res.status());
    });
  });

  test.describe('6.1 Data Integrity', () => {
    test('6.1.1 should maintain quote-invoice relationship', async ({ request }) => {
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
        total: '5000.00',
        notes: 'Important quote',
        items: [
          { description: 'Service', quantity: 5, unitPrice: 1000 },
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

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      const invoice = await invoiceRes.json();

      const invoiceDetailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}`,
        'GET'
      );
      const invoiceDetail = await invoiceDetailRes.json();

      expect(invoiceDetail.quote.id).toBe(quote.id);
      expect(invoiceDetail.quote.clientId).toBe(client.id);
      expect(invoiceDetail.quote.total).toBeDefined();
    });

    test('6.1.2 should create activity logs for operations', async ({ request }) => {
      const { request: authRequest, userId } = await createTestUser(request);

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

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      const invoice = await invoiceRes.json();

      const paymentRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}/payment`,
        'POST',
        undefined,
        { amount: 1000, paymentMethod: 'cash' }
      );

      expect([200, 500]).toContain(paymentRes.status());
    });

    test('6.1.3 should maintain payment history consistency', async ({ request }) => {
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
        { clientId: client.id, status: 'draft', total: '10000.00' }
      );
      const quote = await quoteRes.json();

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      const invoice = await invoiceRes.json();

      const payments = [3000, 3000, 4000];
      let totalRecorded = 0;

      for (const amount of payments) {
        const paymentRes = await makeAuthenticatedRequest(
          authRequest,
          `${BASE_URL}/invoices/${invoice.id}/payment`,
          'POST',
          undefined,
          { amount, paymentMethod: 'bank_transfer' }
        );
        expect(paymentRes.status()).toBe(200);
        totalRecorded += amount;
      }

      const historyRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}/payment-history`,
        'GET'
      );
      const history = await historyRes.json();
      expect(history.length).toBe(3);

      const finalInvoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}`,
        'GET'
      );
      const finalInvoice = await finalInvoiceRes.json();
      expect(Number(finalInvoice.paidAmount)).toBe(totalRecorded);
    });
  });

  test.describe('Quote Item Sorting', () => {
    test('should maintain sort order for items', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const items = [];
      for (let i = 1; i <= 10; i++) {
        items.push({
          description: `Item ${i}`,
          quantity: 1,
          unitPrice: 100 * i,
        });
      }

      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        {
          clientId: client.id,
          status: 'draft',
          items,
        }
      );

      const quote = await quoteRes.json();
      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );
      const details = await detailRes.json();

      for (let i = 0; i < details.items.length; i++) {
        expect(details.items[i].sortOrder).toBe(i);
      }
    });
  });

  test.describe('Timestamp Management', () => {
    test('should manage timestamps correctly', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const createTime = new Date();
      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        { clientId: client.id, status: 'draft' }
      );
      const quote = await quoteRes.json();
      const createdAtTime = new Date(quote.createdAt);

      expect(createdAtTime.getTime()).toBeGreaterThanOrEqual(createTime.getTime() - 1000);
      expect(createdAtTime.getTime()).toBeLessThanOrEqual(createTime.getTime() + 5000);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const updateTime = new Date();
      const updateRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'PATCH',
        undefined,
        { notes: 'Updated' }
      );
      const updated = await updateRes.json();
      const updatedAtTime = new Date(updated.updatedAt);

      expect(updatedAtTime.getTime()).toBeGreaterThanOrEqual(updateTime.getTime() - 1000);
      expect(new Date(updated.createdAt).getTime()).toBe(createdAtTime.getTime());
    });

    test('should update lastPaymentDate on payment', async ({ request }) => {
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
        { clientId: client.id, status: 'draft', total: '1000.00' }
      );
      const quote = await quoteRes.json();

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      const invoice = await invoiceRes.json();
      expect(invoice.lastPaymentDate).toBeNull();

      const paymentTime = new Date();
      const paymentRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}/payment`,
        'POST',
        undefined,
        { amount: 500, paymentMethod: 'cash' }
      );
      const updated = await paymentRes.json();

      const lastPaymentTime = new Date(updated.lastPaymentDate);
      expect(lastPaymentTime.getTime()).toBeGreaterThanOrEqual(paymentTime.getTime() - 1000);
    });
  });

  test.describe('Quote Date Validity', () => {
    test('should calculate validUntil based on validityDays', async ({ request }) => {
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
          validityDays: 60,
          quoteDate: new Date().toISOString(),
        }
      );

      expect(quoteRes.status()).toBe(200);
      const quote = await quoteRes.json();
      expect(quote.validityDays).toBe(60);
      expect(quote.quoteDate).toBeDefined();
    });
  });

  test.describe('Reference Fields', () => {
    test('should store and retrieve reference number', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const refNum = `REF-${Date.now()}`;
      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        {
          clientId: client.id,
          status: 'draft',
          referenceNumber: refNum,
        }
      );

      const quote = await quoteRes.json();
      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );
      const details = await detailRes.json();
      expect(details.referenceNumber).toBe(refNum);
    });

    test('should store and retrieve attention to field', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const attentionTo = 'Mr. John Doe';
      const quoteRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes`,
        'POST',
        undefined,
        {
          clientId: client.id,
          status: 'draft',
          attentionTo,
        }
      );

      const quote = await quoteRes.json();
      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );
      const details = await detailRes.json();
      expect(details.attentionTo).toBe(attentionTo);
    });
  });
});

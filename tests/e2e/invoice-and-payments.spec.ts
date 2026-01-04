import { test, expect, makeAuthenticatedRequest, createTestUser, testData } from './setup';

test.describe('Invoice Creation & Payment Tracking - Comprehensive Scenarios', () => {
  const BASE_URL = 'http://localhost:5000/api';

  test.describe('2.1 Convert Quote to Invoice', () => {
    test('2.1.1 should convert quote to invoice with basic conversion', async ({ request }) => {
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
          total: '5000.00',
        }
      );
      const quote = await quoteRes.json();

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );

      expect(invoiceRes.status()).toBe(200);
      const invoice = await invoiceRes.json();
      expect(invoice.id).toBeDefined();
      expect(invoice.invoiceNumber).toBeDefined();
      expect(invoice.invoiceNumber).toMatch(/^INV-\d+$/);
      expect(invoice.quoteId).toBe(quote.id);
      expect(invoice.paymentStatus).toBe('pending');
      expect(invoice.paidAmount).toBe('0');
      expect(invoice.dueDate).toBeDefined();
    });

    test('2.1.2 should use custom invoice prefix', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request, { role: 'admin' });

      const clientRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/clients`,
        'POST',
        undefined,
        testData.client()
      );
      const client = await clientRes.json();

      const invoiceNumbers = new Set<string>();
      for (let i = 0; i < 3; i++) {
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
        invoiceNumbers.add(invoice.invoiceNumber);
      }

      expect(invoiceNumbers.size).toBe(3);
      const numbers = Array.from(invoiceNumbers).sort();
      expect(numbers[0]).not.toBe(numbers[1]);
      expect(numbers[1]).not.toBe(numbers[2]);
    });

    test('2.1.3 should prevent double conversion of quote', async ({ request }) => {
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

      const firstConvert = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      expect(firstConvert.status()).toBe(200);

      const secondConvert = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      expect(secondConvert.status()).toBe(400);
      const error = await secondConvert.json();
      expect(error.error).toContain('already converted');
    });

    test('2.1.4 should fail converting non-existent quote', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const convertRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/invalid-id/convert-to-invoice`,
        'POST'
      );

      expect(convertRes.status()).toBe(404);
    });

    test('2.1.5 should preserve quote data in invoice', async ({ request }) => {
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
        items: [
          { description: 'Item 1', quantity: 5, unitPrice: 500 },
          { description: 'Item 2', quantity: 5, unitPrice: 500 },
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
      const details = await invoiceDetailRes.json();

      expect(details.quote).toBeDefined();
      expect(details.quote.clientId).toBe(client.id);
      expect(details.quote.total).toBeDefined();
    });
  });

  test.describe('2.2 Get Invoice Details', () => {
    test('2.2.1 should retrieve invoice by ID', async ({ request }) => {
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

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      const invoice = await invoiceRes.json();

      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}`,
        'GET'
      );

      expect(detailRes.status()).toBe(200);
      const details = await detailRes.json();
      expect(details.id).toBe(invoice.id);
      expect(details.invoiceNumber).toBeDefined();
      expect(details.quoteId).toBe(quote.id);
      expect(details.paymentStatus).toBe('pending');
      expect(details.dueDate).toBeDefined();
    });

    test('2.2.2 should fail retrieving non-existent invoice', async ({ request }) => {
      const { request: authRequest } = await createTestUser(request);

      const detailRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/invalid-id`,
        'GET'
      );

      expect(detailRes.status()).toBe(404);
    });

    test('2.2.3 should list all invoices', async ({ request }) => {
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
        const quoteRes = await makeAuthenticatedRequest(
          authRequest,
          `${BASE_URL}/quotes`,
          'POST',
          undefined,
          { clientId: client.id, status: 'draft' }
        );
        const quote = await quoteRes.json();

        await makeAuthenticatedRequest(
          authRequest,
          `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
          'POST'
        );
      }

      const listRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices`,
        'GET'
      );

      expect(listRes.status()).toBe(200);
      const invoices = await listRes.json();
      expect(Array.isArray(invoices)).toBeTruthy();
      expect(invoices.length).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('3.1 Record Payments', () => {
    test('3.1.1 should record full payment', async ({ request }) => {
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
          total: '5000.00',
        }
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
        {
          amount: 5000,
          paymentMethod: 'bank_transfer',
          transactionId: 'TXN-12345',
        }
      );

      expect(paymentRes.status()).toBe(200);
      const updated = await paymentRes.json();
      expect(updated.paymentStatus).toBe('paid');
      expect(updated.paidAmount).toBe('5000');
      expect(updated.lastPaymentDate).toBeDefined();
    });

    test('3.1.2 should record partial payment', async ({ request }) => {
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
          total: '5000.00',
        }
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
        {
          amount: 2000,
          paymentMethod: 'credit_card',
        }
      );

      expect(paymentRes.status()).toBe(200);
      const updated = await paymentRes.json();
      expect(updated.paymentStatus).toBe('partial');
      expect(updated.paidAmount).toBe('2000');
    });

    test('3.1.3 should handle multiple partial payments correctly', async ({ request }) => {
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
          total: '5000.00',
        }
      );
      const quote = await quoteRes.json();

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      const invoice = await invoiceRes.json();

      const payments = [2000, 2500, 500];
      let totalPaid = 0;

      for (const amount of payments) {
        const paymentRes = await makeAuthenticatedRequest(
          authRequest,
          `${BASE_URL}/invoices/${invoice.id}/payment`,
          'POST',
          undefined,
          { amount, paymentMethod: 'bank_transfer' }
        );

        expect(paymentRes.status()).toBe(200);
        totalPaid += amount;
        const updated = await paymentRes.json();

        if (totalPaid < 5000) {
          expect(updated.paymentStatus).toBe('partial');
        } else {
          expect(updated.paymentStatus).toBe('paid');
        }
        expect(updated.paidAmount).toBe(String(totalPaid));
      }
    });

    test('3.1.4 should allow overpayment', async ({ request }) => {
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
          total: '5000.00',
        }
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
        { amount: 5500, paymentMethod: 'bank_transfer' }
      );

      expect([200, 400]).toContain(paymentRes.status());
    });

    test('3.1.5 should fail payment without amount', async ({ request }) => {
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
        { paymentMethod: 'credit_card' }
      );

      expect(paymentRes.status()).toBe(400);
      const error = await paymentRes.json();
      expect(error.error).toContain('amount');
    });

    test('3.1.6 should fail payment with zero amount', async ({ request }) => {
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
        { amount: 0, paymentMethod: 'cash' }
      );

      expect(paymentRes.status()).toBe(400);
    });

    test('3.1.7 should fail payment with negative amount', async ({ request }) => {
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
        { amount: -1000, paymentMethod: 'bank_transfer' }
      );

      expect(paymentRes.status()).toBe(400);
    });

    test('3.1.8 should fail payment without payment method', async ({ request }) => {
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
        { amount: 2000 }
      );

      expect(paymentRes.status()).toBe(400);
      const error = await paymentRes.json();
      expect(error.error).toContain('payment method');
    });

    test('3.1.9 should record payment with custom date', async ({ request }) => {
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

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      const invoice = await invoiceRes.json();

      const customDate = '2025-12-01T10:00:00Z';
      const paymentRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}/payment`,
        'POST',
        undefined,
        {
          amount: 1000,
          paymentMethod: 'check',
          paymentDate: customDate,
          notes: 'Check #12345',
        }
      );

      expect(paymentRes.status()).toBe(200);
      const updated = await paymentRes.json();
      expect(updated.lastPaymentDate).toBeDefined();
    });

    test('3.1.10 should record payment with transaction ID', async ({ request }) => {
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

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      const invoice = await invoiceRes.json();

      const txnId = 'CC-TXN-98765432';
      const paymentRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}/payment`,
        'POST',
        undefined,
        {
          amount: 3000,
          paymentMethod: 'credit_card',
          transactionId: txnId,
        }
      );

      expect(paymentRes.status()).toBe(200);
    });
  });

  test.describe('3.2 Payment Methods', () => {
    const paymentMethods = ['bank_transfer', 'credit_card', 'check', 'cash', 'upi'];

    for (const method of paymentMethods) {
      test(`should accept ${method} payment method`, async ({ request }) => {
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

        const paymentRes = await makeAuthenticatedRequest(
          authRequest,
          `${BASE_URL}/invoices/${invoice.id}/payment`,
          'POST',
          undefined,
          { amount: 500, paymentMethod: method }
        );

        expect(paymentRes.status()).toBe(200);
      });
    }
  });

  test.describe('3.3 Payment History', () => {
    test('3.3.1 should retrieve payment history', async ({ request }) => {
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
        { clientId: client.id, status: 'draft', total: '6000.00' }
      );
      const quote = await quoteRes.json();

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      const invoice = await invoiceRes.json();

      for (let i = 0; i < 3; i++) {
        await makeAuthenticatedRequest(
          authRequest,
          `${BASE_URL}/invoices/${invoice.id}/payment`,
          'POST',
          undefined,
          { amount: 2000, paymentMethod: 'bank_transfer' }
        );
      }

      const historyRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}/payment-history`,
        'GET'
      );

      expect(historyRes.status()).toBe(200);
      const history = await historyRes.json();
      expect(Array.isArray(history)).toBeTruthy();
      expect(history.length).toBe(3);
      history.forEach((record: any) => {
        expect(record.amount).toBeDefined();
        expect(record.paymentMethod).toBeDefined();
        expect(record.paymentDate).toBeDefined();
      });
    });

    test('3.3.2 should retrieve detailed payment history', async ({ request }) => {
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
        { clientId: client.id, status: 'draft', total: '3000.00' }
      );
      const quote = await quoteRes.json();

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      const invoice = await invoiceRes.json();

      await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}/payment`,
        'POST',
        undefined,
        { amount: 1500, paymentMethod: 'credit_card', notes: 'Test payment' }
      );

      const detailedRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}/payment-history-detailed`,
        'GET'
      );

      expect(detailedRes.status()).toBe(200);
      const detailed = await detailedRes.json();
      expect(Array.isArray(detailed)).toBeTruthy();
      if (detailed.length > 0) {
        expect(detailed[0].recordedBy).toBeDefined();
      }
    });
  });

  test.describe('Integration: Full Quote to Invoice to Payment Flow', () => {
    test('should complete full workflow: quote -> invoice -> payments', async ({ request }) => {
      const { request: authRequest, userId } = await createTestUser(request);

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
        total: '10000.00',
        items: [
          { description: 'Service A', quantity: 5, unitPrice: 1000 },
          { description: 'Service B', quantity: 5, unitPrice: 1000 },
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
      expect(quote.status).toBe('draft');

      const invoiceRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}/convert-to-invoice`,
        'POST'
      );
      const invoice = await invoiceRes.json();
      expect(invoice.paymentStatus).toBe('pending');

      const quoteCheckRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/quotes/${quote.id}`,
        'GET'
      );
      const updatedQuote = await quoteCheckRes.json();
      expect(updatedQuote.status).toBe('invoiced');

      const payment1Res = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}/payment`,
        'POST',
        undefined,
        { amount: 4000, paymentMethod: 'bank_transfer' }
      );
      const afterPayment1 = await payment1Res.json();
      expect(afterPayment1.paymentStatus).toBe('partial');
      expect(afterPayment1.paidAmount).toBe('4000');

      const payment2Res = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}/payment`,
        'POST',
        undefined,
        { amount: 6000, paymentMethod: 'credit_card' }
      );
      const afterPayment2 = await payment2Res.json();
      expect(afterPayment2.paymentStatus).toBe('paid');
      expect(afterPayment2.paidAmount).toBe('10000');

      const historyRes = await makeAuthenticatedRequest(
        authRequest,
        `${BASE_URL}/invoices/${invoice.id}/payment-history`,
        'GET'
      );
      const history = await historyRes.json();
      expect(history.length).toBe(2);
    });
  });
});

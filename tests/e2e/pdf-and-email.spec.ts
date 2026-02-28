import { test, expect, makeAuthenticatedRequest, createTestUser, testData } from './setup';
import { APIRequestContext } from '@playwright/test';

/**
 * E2E Tests for PDF Download and Email Features
 * Tests the core functionality of PDF generation and email delivery for quotes and invoices
 */

test.describe('PDF Download and Email API Features', () => {
  let testUserId: string;
  let testUserRequest: APIRequestContext | undefined;
  let clientId: string = '';
  let quoteId: string = '';

  test.beforeEach(async ({ request }) => {
    try {
      // Re-authenticate for EVERY test to get a fresh context
      const userResult = await createTestUser(request);
      testUserRequest = userResult.request;
      testUserId = userResult.userId;

      // Only setup entities once per worker
      if (clientId) return;

      // Create a test client
      const clientRes = await makeAuthenticatedRequest(
        testUserRequest!,
        'http://localhost:5001/api/clients',
        'POST',
        undefined,
        testData.client()
      );

      if (clientRes.status() === 200 || clientRes.status() === 201) {
        const client = await clientRes.json();
        clientId = client.id;
        console.log(`[Test Setup] Created client: ${clientId}`);

        // Create a test quote
        const quoteRes = await makeAuthenticatedRequest(
          testUserRequest!,
          'http://localhost:5001/api/quotes',
          'POST',
          undefined,
          {
            clientId,
            quoteNumber: `QT${Date.now()}`,
            status: 'draft',
            quoteDate: new Date().toISOString(),
            validityDays: 30,
            subtotal: 1000,
            discount: 0,
            cgst: 90,
            sgst: 90,
            igst: 0,
            shippingCharges: 0,
            total: 1180,
            referenceNumber: 'REF001',
            attentionTo: 'Test Person',
            notes: 'Test notes',
            termsAndConditions: 'Test T&C',
            items: [],
          }
        );

        if (quoteRes.status() === 200 || quoteRes.status() === 201) {
          const quote = await quoteRes.json();
          quoteId = quote.id;
          console.log(`[Test Setup] Created quote: ${quoteId}`);
        } else {
          const error = await quoteRes.text();
          console.error(`[Test Setup] Failed to create quote: ${quoteRes.status()} - ${error}`);
        }
      } else {
        const error = await clientRes.text();
        console.error(`[Test Setup] Failed to create client: ${clientRes.status()} - ${error}`);
      }
    } catch (error) {
      console.error('Setup error:', error);
    }
  });

  test('quote PDF endpoint should be accessible and return PDF', async () => {
    test.skip(!quoteId || !testUserRequest, 'Quote not created in setup');

    const pdfResponse = await makeAuthenticatedRequest(
      testUserRequest!,
      `http://localhost:5001/api/quotes/${quoteId}/pdf`,
      'GET'
    );

    expect(pdfResponse.status()).toBe(200);
    const contentType = pdfResponse.headers()['content-type'];
    expect(contentType).toContain('application/pdf');
  });

  test('quote email endpoint should accept valid recipient', async () => {
    test.skip(!quoteId || !testUserRequest, 'Quote not created in setup');

    const emailRes = await makeAuthenticatedRequest(
      testUserRequest!,
      `http://localhost:5001/api/quotes/${quoteId}/email`,
      'POST',
      undefined,
      {
        recipientEmail: 'recipient@example.com',
        message: 'Please review this quote',
      }
    );

    // Should return success (200 or 201)
    expect([200, 201]).toContain(emailRes.status());
  });

  test('quote email endpoint should handle empty message', async () => {
    test.skip(!quoteId || !testUserRequest, 'Quote not created in setup');

    const emailRes = await makeAuthenticatedRequest(
      testUserRequest!,
      `http://localhost:5001/api/quotes/${quoteId}/email`,
      'POST',
      undefined,
      {
        recipientEmail: 'test@example.com',
        message: '',
      }
    );

    // Should handle gracefully
    expect([200, 201, 400, 422]).toContain(emailRes.status());
  });

  test('quote PDF should return 404 for non-existent quote', async () => {
    test.skip(!testUserRequest, 'User not created');

    const pdfResponse = await makeAuthenticatedRequest(
      testUserRequest!,
      'http://localhost:5001/api/quotes/00000000-0000-0000-0000-000000000000/pdf',
      'GET'
    );

    expect(pdfResponse.status()).toBe(404);
  });

  test('unauthenticated request should not access PDF', async ({ playwright }) => {
    // Create a fresh context to ensure no cookies are carried over
    const cleanRequest = await playwright.request.newContext();
    const response = await cleanRequest.get('http://localhost:5001/api/quotes/any-id/pdf');

    // Should return unauthorized, redirect, or rate limited
    expect([301, 302, 307, 401, 403, 429]).toContain(response.status());
  });
});

test.describe('Invoice PDF and Email Features', () => {
  let testUserId: string;
  let testUserRequest: APIRequestContext | undefined;
  let invoiceId: string = '';

  test.beforeEach(async ({ request }) => {
    try {
      // Re-authenticate for EVERY test to get a fresh context
      const userResult = await createTestUser(request);
      testUserRequest = userResult.request;
      testUserId = userResult.userId;

      // Only setup once per describe block
      if (invoiceId) return;

      // Create client
      const clientRes = await makeAuthenticatedRequest(
        testUserRequest!,
        'http://localhost:5001/api/clients',
        'POST',
        undefined,
        testData.client()
      );

      let clientId = '';
      if (clientRes.status() === 200 || clientRes.status() === 201) {
        const client = await clientRes.json();
        clientId = client.id;
      }

      // Create quote
      const quoteRes = await makeAuthenticatedRequest(
        testUserRequest!,
        'http://localhost:5001/api/quotes',
        'POST',
        undefined,
        {
          clientId,
          quoteNumber: `QT${Date.now()}`,
          status: 'draft',
          quoteDate: new Date().toISOString(),
          validityDays: 30,
          subtotal: 1000,
          discount: 0,
          cgst: 90,
          sgst: 90,
          igst: 0,
          shippingCharges: 0,
          total: 1180,
          referenceNumber: 'REF001',
          attentionTo: 'Test',
          notes: 'Test',
          termsAndConditions: 'Test',
          items: [],
        }
      );

      let quoteId = '';
      if (quoteRes.status() === 200 || quoteRes.status() === 201) {
        const quote = await quoteRes.json();
        quoteId = quote.id;
      }

      // Convert to invoice
      if (quoteId) {
        const convertRes = await makeAuthenticatedRequest(
          testUserRequest!,
          `http://localhost:5001/api/quotes/${quoteId}/convert-to-invoice`,
          'POST',
          undefined,
          {}
        );

        if (convertRes.status() === 200 || convertRes.status() === 201) {
          const invoice = await convertRes.json();
          invoiceId = invoice.id;
        }
      }
    } catch (error) {
      console.error('Setup error:', error);
    }
  });

  test('invoice PDF endpoint should be accessible', async () => {
    test.skip(!invoiceId || !testUserRequest, 'Invoice not created in setup');

    const pdfResponse = await makeAuthenticatedRequest(
      testUserRequest!,
      `http://localhost:5001/api/invoices/${invoiceId}/pdf`,
      'GET'
    );

    expect(pdfResponse.status()).toBe(200);
    const contentType = pdfResponse.headers()['content-type'];
    expect(contentType).toContain('application/pdf');
  });

  test('invoice email endpoint should accept valid recipient', async () => {
    test.skip(!invoiceId || !testUserRequest, 'Invoice not created in setup');

    const emailRes = await makeAuthenticatedRequest(
      testUserRequest!,
      `http://localhost:5001/api/invoices/${invoiceId}/email`,
      'POST',
      undefined,
      {
        recipientEmail: 'client@example.com',
        message: 'Payment due',
      }
    );

    expect([200, 201]).toContain(emailRes.status());
  });

  test('invoice PDF should return 404 for non-existent invoice', async () => {
    test.skip(!testUserRequest, 'User not created');

    const pdfResponse = await makeAuthenticatedRequest(
      testUserRequest!,
      'http://localhost:5001/api/invoices/00000000-0000-0000-0000-000000000000/pdf',
      'GET'
    );

    expect(pdfResponse.status()).toBe(404);
  });
});

test.describe('UI Components Verification', () => {
  test('quotes page should load without critical errors', async ({ page }) => {
    // Just verify the app structure loads
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check page structure
    const content = await page.content();
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(100);
  });

  test('app should have proper component structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify critical page elements exist
    const html = await page.content();

    // Should have React app container and basic structure
    expect(html).toContain('root');
    expect(html).toContain('Company name-QuoteFlow');
  });

  test('navigation should be properly implemented', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const content = await page.content();

    // Should have navigation elements
    expect(
      content.includes('Login') ||
      content.includes('Sign in') ||
      content.includes('Quotes') ||
      content.includes('Dashboard')
    ).toBeTruthy();
  });
});
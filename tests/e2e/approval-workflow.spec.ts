import { test, expect, makeAuthenticatedRequest, createTestUser, testData } from './setup';

test.describe('Approval Workflow', () => {
  test('should create an approval rule', async ({ request }) => {
    const { request: authRequest } = await createTestUser(request, { role: 'admin' });

    const ruleData = {
      name: 'High Discount Approval',
      triggerType: 'discount_percentage',
      thresholdValue: '10',
      requiredRole: 'sales_manager',
      isActive: true,
    };

    const response = await makeAuthenticatedRequest(
      authRequest,
      'http://localhost:5000/api/approval-rules',
      'POST',
      undefined,
      ruleData
    );

    expect([200, 201]).toContain(response.status());
    const rule = await response.json();
    expect(rule.name).toBe(ruleData.name);
  });

  test('should trigger approval for high discount', async ({ request }) => {
    // 1. Create Admin and Rule
    const { request: adminRequest } = await createTestUser(request, { role: 'admin' });
    const ruleRes = await makeAuthenticatedRequest(
      adminRequest,
      'http://localhost:5000/api/approval-rules',
      'POST',
      undefined,
      {
        name: 'Discount > 10%',
        triggerType: 'discount_percentage',
        thresholdValue: '10',
        requiredRole: 'sales_manager',
        isActive: true, // Make sure rule is active
      }
    );
    expect([200, 201]).toContain(ruleRes.status());

    // 2. Create Client
    const clientRes = await makeAuthenticatedRequest(
      adminRequest,
      'http://localhost:5000/api/clients',
      'POST',
      undefined,
      testData.client()
    );
    const client = await clientRes.json();

    // 3. Create Quote with 15% discount (should trigger)
    // Note: total amount needs to be calculated or backend handles it.
    // We pass `discount` as a value. Logic uses `(discount / subtotal) * 100`.
    // Let's rely on backend calculation or pass simple values.
    // If we pass `items`, backend calculates subtotal.
    // Let's create a quote with 1 item of 100, and discount 15.
    const quoteData = {
      ...testData.quote({ clientId: client.id }),
      items: [
        { description: 'Test Item', quantity: 1, unitPrice: 100 }
      ],
      discount: 15, // 15% of 100
    };

    const quoteRes = await makeAuthenticatedRequest(
      adminRequest,
      'http://localhost:5000/api/quotes',
      'POST',
      undefined,
      quoteData
    );

    expect([200, 201]).toContain(quoteRes.status());
    const quote = await quoteRes.json();

    // 4. Verify Pending Approval
    expect(quote.approvalStatus).toBe('pending');
    expect(quote.approvalRequiredBy).toBe('sales_manager');

    // 5. Attempt to approve as regular user (should fail)
    const { request: userRequest } = await createTestUser(request, { role: 'user' });
    const failApproveRes = await makeAuthenticatedRequest(
      userRequest,
      `http://localhost:5000/api/quotes/${quote.id}/approve`,
      'POST'
    );
    expect(failApproveRes.status()).toBe(403);

    // 6. Approve as Sales Manager (should success)
    const { request: managerRequest } = await createTestUser(request, { role: 'sales_manager' });
    const approveRes = await makeAuthenticatedRequest(
        managerRequest,
      `http://localhost:5000/api/quotes/${quote.id}/approve`,
      'POST'
    );
    expect([200, 201]).toContain(approveRes.status());
    
    const approvedQuote = await approveRes.json();
    expect(approvedQuote.approvalStatus).toBe('approved');
  });

  test('should not trigger approval for low discount', async ({ request }) => {
     // 1. Create Admin and Rule
     const { request: adminRequest } = await createTestUser(request, { role: 'admin' });
     await makeAuthenticatedRequest(
       adminRequest,
       'http://localhost:5000/api/approval-rules',
       'POST',
       undefined,
       {
         name: 'Discount > 50%',
         triggerType: 'discount_percentage',
         thresholdValue: '50',
         requiredRole: 'sales_manager',
         isActive: true,
       }
     );
 
     // 2. Create Client
     const clientRes = await makeAuthenticatedRequest(
       adminRequest,
       'http://localhost:5000/api/clients',
       'POST',
       undefined,
       testData.client()
     );
     const client = await clientRes.json();
 
     // 3. Create Quote with 10% discount (should NOT trigger)
     const quoteData = {
       ...testData.quote({ clientId: client.id }),
       items: [
         { description: 'Test Item', quantity: 1, unitPrice: 100 }
       ],
       discount: 10,
     };
 
     const quoteRes = await makeAuthenticatedRequest(
       adminRequest,
       'http://localhost:5000/api/quotes',
       'POST',
       undefined,
       quoteData
     );
 
     const quote = await quoteRes.json();
     expect(quote.approvalStatus).toBe('none');
  });
});

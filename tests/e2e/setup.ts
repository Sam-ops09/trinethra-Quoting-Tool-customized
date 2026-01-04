import { test as base, APIRequestContext } from '@playwright/test';

/**
 * Shared test fixture for authentication and API testing
 */
export type TestFixtures = {
  authToken?: string;
  userId?: string;
  adminToken?: string;
  adminUserId?: string;
};

export const test = base.extend<TestFixtures>({
  authToken: async ({}, use) => {
    let token = '';
    // Token will be set during test setup if needed
    await use(token);
  },
  userId: async ({}, use) => {
    let id = '';
    await use(id);
  },
  adminToken: async ({}, use) => {
    let token = '';
    await use(token);
  },
  adminUserId: async ({}, use) => {
    let id = '';
    await use(id);
  },
});

export { expect } from '@playwright/test';

/**
 * Helper to make authenticated API requests
 * Supports both Bearer token (manual) and cookie-based auth (automatic)
 */
export async function makeAuthenticatedRequest(
  request: APIRequestContext,
  url: string,
  method: string = 'GET',
  token?: string,
  body?: any
) {
  const headers: any = {
    'Content-Type': 'application/json',
  };

  // Only add Bearer token if explicitly provided
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options: any = { headers };

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.data = body;
  }

  // Use the appropriate method on the request context
  // Cookies are automatically managed by Playwright's request context
  switch (method.toUpperCase()) {
    case 'GET':
      return request.get(url, options);
    case 'POST':
      return request.post(url, options);
    case 'PATCH':
      return request.patch(url, options);
    case 'PUT':
      return request.put(url, options);
    case 'DELETE':
      return request.delete(url, options);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

/**
 * Helper to create a user and return auth context with cookies
 */
export async function createTestUser(
  request: APIRequestContext,
  override?: any,
  retries: number = 3
): Promise<{ userId: string; email: string; request: APIRequestContext }> {
  const userData = testData.user(override);
  let lastError: any;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const signupRes = await makeAuthenticatedRequest(
        request,
        'http://localhost:5000/api/auth/signup',
        'POST',
        undefined,
        userData
      );
      
      // Handle rate limiting - wait and retry
      if (signupRes.status() === 429) {
        if (attempt < retries - 1) {
          const waitTime = 1000 * (attempt + 1); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      // Try to parse response
      let responseData: any;
      try {
        responseData = await signupRes.json();
      } catch (parseError) {
        // If JSON parsing fails, it might be rate limiting returning plain text
        const text = await signupRes.text();
        if (text.includes('Too many') || text.includes('rate')) {
          if (attempt < retries - 1) {
            const waitTime = 1000 * (attempt + 1);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          throw new Error(`Rate limited: ${text}`);
        }
        throw new Error(`Invalid response: ${text}`);
      }
      
      if (signupRes.status() !== 200 && signupRes.status() !== 201) {
        throw new Error(`Signup failed: ${responseData.error}`);
      }
      
      return {
        userId: responseData.id,
        email: userData.email,
        request, // Return same request context which has cookies
      };
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        const waitTime = 1000 * (attempt + 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('Failed to create test user after retries');
}

/**
 * Test data generators
 */
export const testData = {
  user: (override?: any) => ({
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test@123456',
    role: 'user' as const,
    ...override,
  }),

  admin: (override?: any) => ({
    name: 'Test Admin',
    email: `admin${Date.now()}@example.com`,
    password: 'Admin@123456',
    role: 'admin' as const,
    ...override,
  }),

  client: (override?: any) => ({
    name: `Test Client ${Date.now()}`,
    email: `client${Date.now()}@example.com`,
    phone: '+1234567890',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    country: 'Test Country',
    postalCode: '12345',
    ...override,
  }),

  quote: (override?: any) => ({
    quoteNumber: `QT${Date.now()}`,
    title: 'Test Quote',
    description: 'Test Quote Description',
    status: 'draft' as const,
    subtotal: 1000,
    tax: 100,
    total: 1100,
    ...override,
  }),

  pricingTier: (override?: any) => ({
    name: `Tier ${Date.now()}`,
    minAmount: 1000,
    maxAmount: 50000,
    discountPercentage: 5,
    isActive: true,
    ...override,
  }),

  taxRate: (override?: any) => ({
    region: 'US-CA',
    taxType: 'SALES_TAX',
    sgstRate: 0,
    cgstRate: 0,
    igstRate: 9,
    effectiveFrom: new Date().toISOString(),
    effectiveTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    ...override,
  }),

  clientTag: (override?: any) => ({
    tag: `Tag${Date.now()}`,
    ...override,
  }),

  communication: (override?: any) => ({
    type: 'email' as const,
    subject: 'Test Communication',
    message: 'This is a test communication',
    date: new Date().toISOString(),
    ...override,
  }),
};

/**
 * Common assertion helpers
 */
export const assertions = {
  isSuccessResponse: (response: any) => {
    return [200, 201, 204].includes(response.status);
  },

  isErrorResponse: (response: any) => {
    return [400, 401, 403, 404, 500].includes(response.status);
  },

  hasValidStructure: (data: any, requiredFields: string[]) => {
    return requiredFields.every((field) => field in data);
  },
};
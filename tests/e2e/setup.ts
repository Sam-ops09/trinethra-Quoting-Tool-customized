import 'dotenv/config';
import { test as base, APIRequestContext } from '@playwright/test';
import { db } from '../../server/db';
import { users } from '../../shared/schema';
import { storage } from '../../server/storage';
import { eq } from 'drizzle-orm';

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
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await request.get(url, options);
          break;
        case 'POST':
          response = await request.post(url, options);
          break;
        case 'PATCH':
          response = await request.patch(url, options);
          break;
        case 'PUT':
          response = await request.put(url, options);
          break;
        case 'DELETE':
          response = await request.delete(url, options);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      if (response.status() === 429 && attempt < maxRetries - 1) {
        const waitTime = 1000 * (attempt + 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (error) {
      if (attempt < maxRetries - 1) {
        const waitTime = 1000 * (attempt + 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Request failed after retries');
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
        'http://localhost:5001/api/auth/signup',
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
        // If user already exists (likely due to retry after timeout), proceed to login
        if (responseData.error && responseData.error.includes('already exists')) {
          console.log(`[Setup] User ${userData.email} already exists, proceeding to login...`);
        } else {
            throw new Error(`Signup failed: ${responseData.error}`);
        }
      }

      // AUTO-APPROVE USER IN DB
      try {
        console.log(`[Setup] Attempting auto-approval for ${userData.email}...`);
        const userList = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
        if (userList.length > 0) {
          const user = userList[0];
          
          await storage.updateUser(user.id, {
            status: 'active',
            role: userData.role || 'viewer'
          });
          
          
          // Small delay to ensure DB propagation/cache clearing
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
            console.warn(`[Setup] User ${userData.email} not found in DB for auto-approval.`);
        }
      } catch (err: any) {
        console.warn(`[Setup] Failed to auto-approve user: ${err.message}`);
        console.warn(err);
      }

      // Login to establish session
      const loginRes = await makeAuthenticatedRequest(
        request,
        'http://localhost:5001/api/auth/login',
        'POST',
        undefined,
        { email: userData.email, password: userData.password }
      );

      if (loginRes.status() !== 200) {
        throw new Error(`Login failed after signup`);
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
  user: (override?: any) => {
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      name: `Test User ${uniqueId}`,
      email: `test_${uniqueId}@example.com`,
      password: 'Test@123456',
      role: 'admin' as const,
      ...override,
    };
  },

  admin: (override?: any) => {
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      name: `Test Admin ${uniqueId}`,
      email: `admin_${uniqueId}@example.com`,
      password: 'Admin@123456',
      role: 'admin' as const,
      ...override,
    };
  },

  client: (override?: any) => {
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      name: `Test Client ${uniqueId}`,
      email: `client_${uniqueId}@example.com`,
      phone: '+1234567890',
      billingAddress: '123 Test St, Test City, TS, Test Country, 12345',
      shippingAddress: '123 Test St, Test City, TS, Test Country, 12345',
      contactPerson: `Contact ${uniqueId}`,
      ...override,
    };
  },

  quote: (override?: any) => ({
    quoteNumber: `QT${Date.now()}`,
    status: 'draft' as const,
    subtotal: "1000",
    discount: "0",
    total: "1100",
    ...override,
  }),

  pricingTier: (override?: any) => ({
    name: `Tier ${Date.now()}`,
    minAmount: 1000,
    maxAmount: 50000,
    discountPercent: 5,
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
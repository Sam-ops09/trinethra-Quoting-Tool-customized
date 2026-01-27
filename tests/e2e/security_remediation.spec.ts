
import { test, expect } from '@playwright/test';
import { storage } from '../../server/storage';
import { db } from '../../server/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const TEST_EMAIL = `security_test_serial_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

test.use({ baseURL: 'http://localhost:5001' });

test.describe.serial('Security Remediation Verification Serial', () => {

    test('Complete Security Flow', async ({ request }) => {
        // 1. Signup
        const signupRes = await request.post('/api/auth/signup', {
            data: {
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                name: 'Security Test User'
            }
        });

        expect(signupRes.status(), "Signup status should be 200").toBe(200);
        const signupBody = await signupRes.json();
        expect(signupBody.role, "Role should be guest").toBe('guest');
        
        // Verify in DB
        const user = await storage.getUserByEmail(TEST_EMAIL);
        expect(user).toBeDefined();
        expect(user?.role).toBe('guest');
        expect(user?.status).toBe('pending');

        // 2. Login (Should Fail)
        const loginFailRes = await request.post('/api/auth/login', {
            data: {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            }
        });
        
        expect(loginFailRes.status(), "Login should fail with 403").toBe(403);
        const loginFailBody = await loginFailRes.json();
        expect(loginFailBody.error).toContain('pending approval');

        // 3. Admin Approval
        if (!user) throw new Error("User not found for approval");
        await db.update(users)
            .set({ status: 'active', role: 'viewer' })
            .where(eq(users.id, user.id));

        // 4. Login (Should Succeed)
        const loginSuccessRes = await request.post('/api/auth/login', {
            data: {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            }
        });

        expect(loginSuccessRes.status(), "Login after approval should be 200").toBe(200);
        const loginSuccessBody = await loginSuccessRes.json();
        expect(loginSuccessBody.email).toBe(TEST_EMAIL);
    });
});

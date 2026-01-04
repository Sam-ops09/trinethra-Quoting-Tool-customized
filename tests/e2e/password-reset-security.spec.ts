import { test, expect } from "@playwright/test";
import { db } from "../../server/db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";

test.describe("Password Reset Security", () => {
  test("should prevent reset token reuse", async ({ request }) => {
    // Step 1: Request a password reset
    const resetResponse = await request.post("/api/auth/reset-password", {
      data: {
        email: "admin@example.com",
      },
    });

    expect(resetResponse.ok()).toBeTruthy();
    const resetData = await resetResponse.json();
    expect(resetData.message).toContain("reset email");

    // Step 2: Get the reset token from the database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@example.com"));

    expect(user).toBeDefined();
    expect(user.resetToken).not.toBeNull();
    const resetToken = user.resetToken!;

    // Step 3: Use the reset token to change the password (first time - should succeed)
    const confirmResponse1 = await request.post("/api/auth/reset-password-confirm", {
      data: {
        token: resetToken,
        newPassword: "NewPassword123!",
      },
    });

    expect(confirmResponse1.ok()).toBeTruthy();
    const confirmData1 = await confirmResponse1.json();
    expect(confirmData1.success).toBe(true);
    expect(confirmData1.message).toContain("successfully");

    // Step 4: Verify the token was cleared in the database
    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@example.com"));

    expect(updatedUser.resetToken).toBeNull();
    expect(updatedUser.resetTokenExpiry).toBeNull();

    // Step 5: Try to use the same token again (should fail)
    const confirmResponse2 = await request.post("/api/auth/reset-password-confirm", {
      data: {
        token: resetToken,
        newPassword: "AnotherPassword456!",
      },
    });

    expect(confirmResponse2.status()).toBe(400);
    const confirmData2 = await confirmResponse2.json();
    expect(confirmData2.error).toContain("Invalid or expired reset token");

    // Step 6: Verify the password was not changed by the second attempt
    // Try to login with the first new password (should work)
    const loginResponse = await request.post("/api/auth/login", {
      data: {
        email: "admin@example.com",
        password: "NewPassword123!",
      },
    });

    expect(loginResponse.ok()).toBeTruthy();

    // Reset the password back to original for other tests
    await request.post("/api/auth/reset-password", {
      data: {
        email: "admin@example.com",
      },
    });

    const [userAfterReset] = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@example.com"));

    await request.post("/api/auth/reset-password-confirm", {
      data: {
        token: userAfterReset.resetToken!,
        newPassword: "Admin123!",
      },
    });
  });

  test("should prevent concurrent token usage", async ({ request }) => {
    // Step 1: Request a password reset
    const resetResponse = await request.post("/api/auth/reset-password", {
      data: {
        email: "admin@example.com",
      },
    });

    expect(resetResponse.ok()).toBeTruthy();

    // Step 2: Get the reset token from the database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@example.com"));

    const resetToken = user.resetToken!;

    // Step 3: Try to use the token twice concurrently
    const [response1, response2] = await Promise.all([
      request.post("/api/auth/reset-password-confirm", {
        data: {
          token: resetToken,
          newPassword: "NewPassword123!",
        },
      }),
      request.post("/api/auth/reset-password-confirm", {
        data: {
          token: resetToken,
          newPassword: "DifferentPassword456!",
        },
      }),
    ]);

    // One should succeed, the other should fail
    const responses = [response1, response2];
    const successResponses = responses.filter(r => r.ok());
    const failureResponses = responses.filter(r => !r.ok());

    expect(successResponses.length).toBe(1);
    expect(failureResponses.length).toBe(1);
    expect(failureResponses[0].status()).toBe(400);

    // Reset password back to original
    await request.post("/api/auth/reset-password", {
      data: {
        email: "admin@example.com",
      },
    });

    const [userAfterReset] = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@example.com"));

    await request.post("/api/auth/reset-password-confirm", {
      data: {
        token: userAfterReset.resetToken!,
        newPassword: "Admin123!",
      },
    });
  });
});


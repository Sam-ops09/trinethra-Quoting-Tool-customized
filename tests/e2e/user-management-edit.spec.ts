import { test, expect, makeAuthenticatedRequest, createTestUser } from "./setup";

test.describe("User Management - Edit Functionality", () => {
  test("admin can edit user information via API", async ({ request }) => {
    // Create admin user
    const admin = await createTestUser(request, { role: "admin", email: `admin${Date.now()}@example.com` });

    // Create a regular user to edit
    const userToEdit = await createTestUser(request, {
      role: "user",
      name: "Original User Name",
      email: `user${Date.now()}@example.com`
    });

    // Edit the user's information
    const updateData = {
      name: "Updated User Name",
      role: "manager",
      status: "active",
    };

    const response = await makeAuthenticatedRequest(
      admin.request,
      `http://localhost:5000/api/users/${userToEdit.userId}`,
      "PUT",
      undefined,
      updateData
    );

    expect(response.status()).toBe(200);
    const updatedUser = await response.json();
    expect(updatedUser.name).toBe("Updated User Name");
    expect(updatedUser.role).toBe("manager");
  });

  test("admin can change user status", async ({ request }) => {
    // Create admin user
    const admin = await createTestUser(request, { role: "admin", email: `admin${Date.now()}@example.com` });

    // Create a user to modify
    const userToModify = await createTestUser(request, {
      role: "user",
      email: `statususer${Date.now()}@example.com`
    });

    // Change user status to inactive
    const response = await makeAuthenticatedRequest(
      admin.request,
      `http://localhost:5000/api/users/${userToModify.userId}`,
      "PUT",
      undefined,
      { status: "inactive" }
    );

    expect(response.status()).toBe(200);
    const updatedUser = await response.json();
    expect(updatedUser.status).toBe("inactive");
  });

  test("admin can reset user password", async ({ request }) => {
    // Create admin user
    const admin = await createTestUser(request, { role: "admin", email: `admin${Date.now()}@example.com` });

    // Create a user whose password will be reset
    const userToReset = await createTestUser(request, {
      role: "user",
      email: `pwdreset${Date.now()}@example.com`,
      password: "OldPassword123"
    });

    // Reset the password
    const response = await makeAuthenticatedRequest(
      admin.request,
      `http://localhost:5000/api/users/${userToReset.userId}`,
      "PUT",
      undefined,
      { password: "NewPassword456" }
    );

    expect(response.status()).toBe(200);

    // Verify the user can't login with old password
    const oldLoginRes = await request.post("http://localhost:5000/api/auth/login", {
      data: {
        email: userToReset.email,
        password: "OldPassword123"
      }
    });
    expect(oldLoginRes.status()).toBe(401);

    // Verify the user can login with new password
    const newLoginRes = await request.post("http://localhost:5000/api/auth/login", {
      data: {
        email: userToReset.email,
        password: "NewPassword456"
      }
    });
    expect(newLoginRes.status()).toBe(200);
  });

  test("admin can update multiple fields at once", async ({ request }) => {
    // Create admin user
    const admin = await createTestUser(request, { role: "admin", email: `admin${Date.now()}@example.com` });

    // Create a user to update
    const userToUpdate = await createTestUser(request, {
      role: "user",
      name: "Original Name",
      email: `multiupdate${Date.now()}@example.com`
    });

    // Update multiple fields
    const updateData = {
      name: "New Name",
      role: "manager",
      status: "inactive",
      backupEmail: `backup${Date.now()}@example.com`
    };

    const response = await makeAuthenticatedRequest(
      admin.request,
      `http://localhost:5000/api/users/${userToUpdate.userId}`,
      "PUT",
      undefined,
      updateData
    );

    expect(response.status()).toBe(200);
    const updatedUser = await response.json();
    expect(updatedUser.name).toBe("New Name");
    expect(updatedUser.role).toBe("manager");
    expect(updatedUser.status).toBe("inactive");
    expect(updatedUser.backupEmail).toBe(updateData.backupEmail);
  });

  test("non-admin cannot edit users", async ({ request }) => {
    // Create regular user
    const regularUser = await createTestUser(request, {
      role: "user",
      email: `regular${Date.now()}@example.com`
    });

    // Create another user to try to edit
    const targetUser = await createTestUser(request, {
      role: "user",
      email: `target${Date.now()}@example.com`
    });

    // Try to edit as non-admin
    const response = await makeAuthenticatedRequest(
      regularUser.request,
      `http://localhost:5000/api/users/${targetUser.userId}`,
      "PUT",
      undefined,
      { name: "Unauthorized Change" }
    );

    expect(response.status()).toBe(403);
  });

  test("cannot change email to one that already exists", async ({ request }) => {
    // Create admin user
    const admin = await createTestUser(request, { role: "admin", email: `admin${Date.now()}@example.com` });

    // Create two users
    const user1 = await createTestUser(request, { email: `user1${Date.now()}@example.com` });
    const user2 = await createTestUser(request, { email: `user2${Date.now()}@example.com` });

    // Try to change user2's email to user1's email
    const response = await makeAuthenticatedRequest(
      admin.request,
      `http://localhost:5000/api/users/${user2.userId}`,
      "PUT",
      undefined,
      { email: user1.email }
    );

    expect(response.status()).toBe(400);
    const error = await response.json();
    expect(error.error).toContain("already exists");
  });
});





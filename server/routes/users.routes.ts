
import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { logger } from "../utils/logger";
import { authMiddleware, AuthRequest } from "../middleware";

const router = Router();

// Get all users (Admin only)
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const users = await storage.getAllUsers();
    return res.json(users.map(u => ({
      id: u.id,
      email: u.email,
      backupEmail: u.backupEmail,
      name: u.name,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    })));
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create user (Admin only)
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { email, backupEmail, password, name, role, status } = req.body;

    const existing = await storage.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      email,
      backupEmail,
      passwordHash,
      name,
      role: role || "viewer",
      status: status || "active",
    });

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "create_user",
      entityType: "user",
      entityId: user.id,
    });

    return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to create user" });
  }
});

// Update user (Admin only)
router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { name, email, backupEmail, role, status, password } = req.body;
    const userId = req.params.id;

    // Check if email is being changed and already exists
    if (email) {
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Build update object
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (backupEmail !== undefined) updateData.backupEmail = backupEmail;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await storage.updateUser(userId, updateData);
      
    if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
    }

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "update_user",
      entityType: "user",
      entityId: userId,
    });

    const safeUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      backupEmail: updatedUser.backupEmail
    };

    return res.json(safeUser);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update user" });
  }
});

// Delete user (Admin only)
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (req.params.id === req.user!.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    await storage.deleteUser(req.params.id);

    await storage.createActivityLog({
      userId: req.user!.id,
      action: "delete_user",
      entityType: "user",
      entityId: req.params.id,
    });

    return res.json({ success: true });
  } catch (error: any) {
    logger.error("Delete user error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete user" });
  }
});

export default router;

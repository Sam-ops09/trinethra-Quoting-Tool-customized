
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { storage } from "../storage";
import { EmailService } from "../services/email.service";
import { logger } from "../utils/logger";
import { getJWTSecret, authMiddleware, AuthRequest } from "../middleware";
import { requireFeature } from "../feature-flags-middleware";

const router = Router();

const JWT_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

// Signup
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password and name are required" });
    }

    if (await storage.getUserByEmail(email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // SECURITY: Always set role to "viewer" for self-signup
    // Admin-created users can have other roles via the /api/users endpoint
    const user = await storage.createUser({
      email,
      passwordHash: hashedPassword,
      name,
      role: "viewer",
      status: "active"
    });

    await storage.createActivityLog({
      userId: user.id,
      action: "signup",
      entityType: "user",
      entityId: user.id,
    });


    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(email, name);
    } catch (error) {
      logger.error("Failed to send welcome email:", error);
      // Don't fail signup if email fails
    }

    return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error: any) {
    logger.error("Signup error:", error);
    return res.status(500).json({ error: error.message || "Failed to create account" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    logger.info("Login attempt received");
    const { email, password } = req.body;

    if (!email || !password) {
      logger.info("Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }

    logger.info("Fetching user from database");
    const user = await storage.getUserByEmail(email);
    if (!user) {
      logger.info("User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    logger.info("User found, checking status");
    if (user.status !== "active") {
      logger.info("User account is not active:", user.status);
      return res.status(401).json({ error: "Account is inactive" });
    }

    logger.info("Verifying password");
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      logger.info("Invalid password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    logger.info("Generating tokens");
    // Generate new refresh token
    const refreshToken = nanoid(32);
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update user with new refresh token
    await storage.updateUser(user.id, {
      refreshToken,
      refreshTokenExpiry,
    });

    // Generate access token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getJWTSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info("Setting cookies");
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info("Creating activity log");
    await storage.createActivityLog({
      userId: user.id,
      action: "login",
      entityType: "user",
      entityId: user.id,
    });

    logger.info("Login successful");
    return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error: any) {
    logger.error("Login error:", error);
    logger.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return res.status(500).json({
      error: "Login failed",
      details: process.env.NODE_ENV !== "production" ? error.message : undefined
    });
  }
});

// Logout
router.post("/logout", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Clear refresh token from database
    if (req.user?.id) {
      await storage.updateUser(req.user.id, {
        refreshToken: null,
        refreshTokenExpiry: null,
      });

      // Log the logout action
      await storage.createActivityLog({
        userId: req.user.id,
        action: "logout",
        entityType: "user",
        entityId: req.user.id,
      });
    }

    // Clear both cookies
    res.clearCookie("token");
    res.clearCookie("refreshToken");

    return res.json({ success: true });
  } catch (error: any) {
    logger.error("Logout error:", error);
    // Still clear cookies even if database update fails
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return res.json({ success: true });
  }
});

// Get User Profile
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Reset Password Request
router.post("/reset-password", requireFeature('pages_resetPassword'), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await storage.getUserByEmail(email);
    
    if (!user || !user.backupEmail) {
      // Don't reveal if user exists for security
      return res.json({ success: true });
    }

    const resetToken = nanoid(32);
    await storage.updateUser(user.id, {
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour
    });

    // Send email with reset link
    // Construct the full URL using request headers for production URLs
    const protocol = req.header('x-forwarded-proto') || req.protocol || 'http';
    const host = req.header('x-forwarded-host') || req.header('host') || 'localhost:5000';
    const baseUrl = `${protocol}://${host}`;
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    try {
      await EmailService.sendPasswordResetEmail(user.backupEmail, resetLink);
    } catch (error) {
      logger.error("Failed to send password reset email:", error);
      // Don't fail the request, just log the error
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to process request" });
  }
});

// Confirm Password Reset with Token
router.post("/reset-password-confirm", requireFeature('pages_resetPassword'), async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    // Find user with reset token using indexed lookup
    const user = await storage.getUserByResetToken(token);

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Check if token is expired
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      // Clear the expired token
      await storage.updateUser(user.id, {
        resetToken: null,
        resetTokenExpiry: null,
      });
      return res.status(400).json({ error: "Reset token has expired" });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      return res.status(400).json({ error: "Password must contain uppercase, lowercase, number, and special character" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token atomically
    // This uses a special update method that checks the token in the WHERE clause
    const updatedUser = await storage.updateUserWithTokenCheck(user.id, token, {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    });

    // If no user was updated, the token was already used or invalidated
    if (!updatedUser) {
      logger.warn(`Reset token already used or invalidated for user ${user.id}`);
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    logger.info(`Password reset successful for user ${user.id}, token cleared`);

    await storage.createActivityLog({
      userId: user.id,
      action: "reset_password",
      entityType: "user",
      entityId: user.id,
    });

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error: any) {
    logger.error("Reset password confirm error:", error);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

// Refresh Token
router.post("/refresh", async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: "No refresh token" });
        }

        // Find user by refresh token using indexed lookup
        const user = await storage.getUserByRefreshToken(refreshToken);

        if (!user) {
            // Clear invalid refresh token cookie
            res.clearCookie("refreshToken");
            res.clearCookie("token");
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        // Check if refresh token is expired
        if (user.refreshTokenExpiry && new Date(user.refreshTokenExpiry) < new Date()) {
            // Clear expired refresh token from database and cookies
            await storage.updateUser(user.id, {
                refreshToken: null,
                refreshTokenExpiry: null,
            });
            res.clearCookie("refreshToken");
            res.clearCookie("token");
            return res.status(401).json({ error: "Refresh token expired" });
        }

        if (user.status !== "active") {
            res.clearCookie("refreshToken");
            res.clearCookie("token");
            return res.status(401).json({ error: "Account is inactive" });
        }

        // Generate new access token
        const newToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            getJWTSecret(),
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.cookie("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });

        return res.json({
            success: true,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error: any) {
        logger.error("Refresh token error:", error);
        // Clear cookies on any error
        res.clearCookie("refreshToken");
        res.clearCookie("token");
        return res.status(500).json({ error: "Failed to refresh token" });
    }
});

export default router;

import type { Express } from "express";
import type { Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { PDFService } from "./services/pdf.service";
import { InvoicePDFService } from "./services/invoice-pdf.service";
import { EmailService } from "./services/email.service";
import { analyticsService } from "./services/analytics.service";
import { pricingService } from "./services/pricing.service";
import { NumberingService } from "./services/numbering.service";
import { requirePermission } from "./permissions-middleware";
import { requireFeature, getFeatureFlagsEndpoint } from "./feature-flags-middleware";
import { isFeatureEnabled } from "@shared/feature-flags";
import analyticsRoutes from "./analytics-routes";
import quoteWorkflowRoutes from "./quote-workflow-routes";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db";
import * as schema from "../shared/schema";
import { z } from "zod";
// Validate SESSION_SECRET at runtime, not at module load
function getJWTSecret(): string {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  return process.env.SESSION_SECRET;
}

const JWT_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Middleware to verify JWT token
async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, getJWTSecret()) as { id: string; email: string; role: string };
    const user = await storage.getUser(decoded.id);
    
    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}


export async function registerRoutes(app: Express): Promise<Server> {


  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password and name are required" });
      }

      if (await storage.getUserByEmail(email)) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        passwordHash: hashedPassword,
        name,
        role: req.body.role || "viewer",
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
        console.error("Failed to send welcome email:", error);
        // Don't fail signup if email fails
      }

      return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error: any) {
      console.error("Signup error:", error);
      return res.status(500).json({ error: error.message || "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      console.log("Login attempt received");
      const { email, password } = req.body;

      if (!email || !password) {
        console.log("Missing email or password");
        return res.status(400).json({ error: "Email and password are required" });
      }

      console.log("Fetching user from database");
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("User not found:", email);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log("User found, checking status");
      if (user.status !== "active") {
        console.log("User account is not active:", user.status);
        return res.status(401).json({ error: "Account is inactive" });
      }

      console.log("Verifying password");
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        console.log("Invalid password");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log("Generating tokens");
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

      console.log("Setting cookies");
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

      console.log("Creating activity log");
      await storage.createActivityLog({
        userId: user.id,
        action: "login",
        entityType: "user",
        entityId: user.id,
      });

      console.log("Login successful");
      return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error: any) {
      console.error("Login error:", error);
      console.error("Error details:", {
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

  app.post("/api/auth/logout", authMiddleware, async (req: AuthRequest, res: Response) => {
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
      console.error("Logout error:", error);
      // Still clear cookies even if database update fails
      res.clearCookie("token");
      res.clearCookie("refreshToken");
      return res.json({ success: true });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res: Response) => {
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

  app.post("/api/auth/reset-password", requireFeature('pages_resetPassword'), async (req: Request, res: Response) => {
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
        console.error("Failed to send password reset email:", error);
        // Don't fail the request, just log the error
      }

      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Confirm Password Reset with Token
  app.post("/api/auth/reset-password-confirm", requireFeature('pages_resetPassword'), async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }

      // Find user with reset token (ensure token is not null and matches)
      const users_list = await storage.getAllUsers();
      const user = users_list.find(u => u.resetToken !== null && u.resetToken === token);

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
        console.warn(`Reset token already used or invalidated for user ${user.id}`);
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      console.log(`Password reset successful for user ${user.id}, token cleared`);

      await storage.createActivityLog({
        userId: user.id,
        action: "reset_password",
        entityType: "user",
        entityId: user.id,
      });

      return res.json({ success: true, message: "Password reset successfully" });
    } catch (error: any) {
      console.error("Reset password confirm error:", error);
      return res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Refresh Token Endpoint
    app.post("/api/auth/refresh", async (req: Request, res: Response) => {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token" });
            }

            // Find user by refresh token
            const users_list = await storage.getAllUsers();
            const user = users_list.find(u => u.refreshToken === refreshToken);

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
            console.error("Refresh token error:", error);
            // Clear cookies on any error
            res.clearCookie("refreshToken");
            res.clearCookie("token");
            return res.status(500).json({ error: "Failed to refresh token" });
        }
    });


    // Analytics & Dashboard Routes
    app.use("/api", authMiddleware, analyticsRoutes);
    
    // Quote Workflow Routes
    app.use("/api", authMiddleware, quoteWorkflowRoutes);

    // Users Routes (Admin only)
  app.get("/api/users", authMiddleware, async (req: AuthRequest, res: Response) => {
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

  app.post("/api/users", authMiddleware, async (req: AuthRequest, res: Response) => {
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
        role: role || "user",
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

  app.put("/api/users/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
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

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_user",
        entityType: "user",
        entityId: userId,
      });

      return res.json(updatedUser);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
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
      console.error("Delete user error:", error);
      return res.status(500).json({ error: error.message || "Failed to delete user" });
    }
  });

  // Clients Routes
  app.get("/api/clients", requireFeature('clients_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", requireFeature('clients_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      return res.json(client);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", requireFeature('clients_create'), authMiddleware, requirePermission("clients", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, phone } = req.body;

      // Validate required fields
      if (!name || !email) {
        return res.status(400).json({ error: "Client name and email are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const client = await storage.createClient({
        ...req.body,
        createdBy: req.user!.id,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_client",
        entityType: "client",
        entityId: client.id,
      });

      return res.json(client);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", requireFeature('clients_edit'), authMiddleware, requirePermission("clients", "edit"), async (req: AuthRequest, res: Response) => {
    try {
      const { name, email } = req.body;

      // Validate required fields
      if (!name || !email) {
        return res.status(400).json({ error: "Client name and email are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const client = await storage.updateClient(req.params.id, req.body);

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_client",
        entityType: "client",
        entityId: client.id,
      });

      return res.json(client);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", requireFeature('clients_delete'), authMiddleware, requirePermission("clients", "delete"), async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteClient(req.params.id);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_client",
        entityType: "client",
        entityId: req.params.id,
      });

      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // Quotes Routes
  app.get("/api/quotes", requireFeature('quotes_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const quotes = await storage.getAllQuotes();
      const quotesWithClients = await Promise.all(
        quotes.map(async (quote) => {
          const client = await storage.getClient(quote.clientId);
          return {
            ...quote,
            clientName: client?.name || "Unknown",
            clientEmail: client?.email || "",
          };
        })
      );
      res.json(quotesWithClients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:id", requireFeature('quotes_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const client = await storage.getClient(quote.clientId);
      const items = await storage.getQuoteItems(quote.id);
      const creator = await storage.getUser(quote.createdBy);

      res.json({
        ...quote,
        client,
        items,
        createdByName: creator?.name || "Unknown",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  app.post("/api/quotes", requireFeature('quotes_create'), authMiddleware, requirePermission("quotes", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const { items, ...quoteData } = req.body;

      // Convert ISO string date to Date object if provided (optional; DB has default)
      if (quoteData.quoteDate && typeof quoteData.quoteDate === "string") {
        const parsed = new Date(quoteData.quoteDate);
        if (!isNaN(parsed.getTime())) {
          quoteData.quoteDate = parsed;
        } else {
          delete quoteData.quoteDate; // invalid date string, let DB default
        }
      }

      // Get settings for quote prefix
      const prefixSetting = await storage.getSetting("quotePrefix");
      const prefix = prefixSetting?.value || "QT";

      // Generate quote number using NumberingService
      const quoteNumber = await NumberingService.generateQuoteNumber();

      // Create quote
      const quote = await storage.createQuote({
        ...quoteData,
        quoteNumber,
        createdBy: req.user!.id,
      });

      // Create quote items
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await storage.createQuoteItem({
            quoteId: quote.id,
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
            subtotal: String(item.quantity * item.unitPrice),
            sortOrder: i,
            hsnSac: item.hsnSac || null,
          });
        }
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_quote",
        entityType: "quote",
        entityId: quote.id,
      });

      return res.json(quote);
    } catch (error: any) {
      console.error("Create quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to create quote" });
    }
  });

  app.patch("/api/quotes/:id", authMiddleware, requirePermission("quotes", "edit"), async (req: AuthRequest, res: Response) => {
    try {
      // Check if quote exists and is not invoiced
      const existingQuote = await storage.getQuote(req.params.id);
      if (!existingQuote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      // Prevent editing invoiced quotes
      if (existingQuote.status === "invoiced") {
        return res.status(400).json({ error: "Cannot edit an invoiced quote" });
      }

      // Prevent editing quotes converted to sales orders
      const existingSalesOrder = await storage.getSalesOrderByQuote(req.params.id);
      if (existingSalesOrder) {
        return res.status(400).json({ 
          error: "Cannot edit a quote that has been converted to a Sales Order." 
        });
      }

      // Prevent editing finalized quotes (Sent/Approved/Rejected) unless only updating status
      // We allow updating status (e.g. marking as Approved), but not content changes.
      if (["sent", "approved", "rejected", "closed_paid", "closed_cancelled"].includes(existingQuote.status)) {
         const keys = Object.keys(req.body);
         const allowedKeys = ["status", "closureNotes", "closedBy", "closedAt"]; // Start with status and closure fields
         const hasContentUpdates = keys.some(key => !allowedKeys.includes(key));
         
         if (hasContentUpdates) {
             return res.status(400).json({ 
                 error: `Quote is in '${existingQuote.status}' state and cannot be edited. Please use the 'Revise' option to create a new version.` 
             });
         }
      }

      // Normalize date fields
      const toDate = (v: any) => {
        if (!v) return undefined;
        if (v instanceof Date) return v;
        if (typeof v === 'string') {
          const d = new Date(v);
          return isNaN(d.getTime()) ? undefined : d;
        }
        return undefined;
      };

      const { items, ...updateFields } = req.body;
      const updateData = { ...updateFields };
      if (updateData.quoteDate) updateData.quoteDate = toDate(updateData.quoteDate);
      if (updateData.validUntil) updateData.validUntil = toDate(updateData.validUntil);

      const quote = await storage.updateQuote(req.params.id, updateData);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      // Update items if provided
      if (items && Array.isArray(items)) {
        await storage.deleteQuoteItems(quote.id);
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          await storage.createQuoteItem({
            quoteId: quote.id,
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
            subtotal: String(item.quantity * item.unitPrice),
            sortOrder: i,
            hsnSac: item.hsnSac || null,
          });
        }
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_quote",
        entityType: "quote",
        entityId: quote.id,
      });


      // DISABLED: Automatic email sending when quote status changes to "sent"
      // if (updateData.status === "sent" && existingQuote.status !== "sent") {
      /*
        try {
          const client = await storage.getClient(quote.clientId);
          if (client?.email) {
            // ... email sending code disabled ...
          }
        } catch (emailError) {
          console.error("Auto-send email error:", emailError);
        }
      */

      return res.json(quote);
    } catch (error) {
      console.error("Update quote error:", error);
      res.status(500).json({ error: "Failed to update quote" });
    }
  });

  app.post("/api/quotes/:id/convert-to-invoice", authMiddleware, requirePermission("invoices", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) return res.status(404).json({ error: "Quote not found" });

      if (quote.status === "invoiced") {
        return res.status(400).json({ error: "Quote is already invoiced" });
      }

      // CRITICAL: Check if sales order exists for this quote
      // If SO exists, invoice should be created FROM the SO, not from the quote
      const existingSalesOrder = await storage.getSalesOrderByQuote(req.params.id);
      if (existingSalesOrder) {
        return res.status(400).json({ 
          error: "Cannot create invoice directly from quote. This quote has already been converted to a sales order. Please create the invoice from the sales order instead.",
          salesOrderId: existingSalesOrder.id,
          salesOrderNumber: existingSalesOrder.orderNumber
        });
      }

      // Generate a new master invoice number using admin master invoice numbering settings
      const invoiceNumber = await NumberingService.generateMasterInvoiceNumber();

      // Create the invoice
      const invoice = await storage.createInvoice({
        invoiceNumber,
        quoteId: quote.id,
        isMaster: true,
        masterInvoiceStatus: "draft", 
        paymentStatus: "pending", 
        dueDate: new Date(Date.now() + (quote.validityDays || 30) * 24 * 60 * 60 * 1000), // Default due date based on validity
        paidAmount: "0",
        subtotal: quote.subtotal,
        discount: quote.discount,
        cgst: quote.cgst,
        sgst: quote.sgst,
        igst: quote.igst,
        shippingCharges: quote.shippingCharges,
        total: quote.total,
        notes: quote.notes,
        termsAndConditions: quote.termsAndConditions,
        createdBy: req.user!.id,
      });

      // Get quote items and create invoice items
      const quoteItems = await storage.getQuoteItems(quote.id);
      for (const item of quoteItems) {
        await storage.createInvoiceItem({
          invoiceId: invoice.id,
          productId: (item as any).productId || null,
          description: item.description,
          quantity: item.quantity,
          fulfilledQuantity: 0,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          status: "pending",
          sortOrder: item.sortOrder,
          hsnSac: item.hsnSac
        });
      }

      // Update quote status
      await storage.updateQuote(quote.id, { status: "invoiced" });

      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "convert_quote_to_invoice",
        entityType: "invoice",
        entityId: invoice.id,
      });

      return res.json(invoice);
      
    } catch (error: any) {
      console.error("Convert quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to convert quote" });
    }
  });

  // ============================================
  // MASTER INVOICE MANAGEMENT ROUTES
  // ============================================

  // Update Master Invoice Status (Draft -> Confirmed -> Locked)
  app.put("/api/invoices/:id/master-status", authMiddleware, requirePermission("invoices", "finalize"), async (req: AuthRequest, res: Response) => {
    try {
      const { masterInvoiceStatus } = req.body;

      if (!["draft", "confirmed", "locked"].includes(masterInvoiceStatus)) {
        return res.status(400).json({ error: "Invalid master invoice status" });
      }

      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      if (!invoice.isMaster) {
        return res.status(400).json({ error: "This is not a master invoice" });
      }

      // Validate status transitions
      const currentStatus = invoice.masterInvoiceStatus;
      const validTransitions: Record<string, string[]> = {
        "draft": ["confirmed"],
        "confirmed": ["locked"],
        "locked": [], // Cannot transition from locked
      };

      if (currentStatus && !validTransitions[currentStatus]?.includes(masterInvoiceStatus)) {
        return res.status(400).json({
          error: `Cannot transition from ${currentStatus} to ${masterInvoiceStatus}`
        });
      }

      const updatedInvoice = await storage.updateInvoice(req.params.id, {
        masterInvoiceStatus: masterInvoiceStatus as "draft" | "confirmed" | "locked",
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: `master_invoice_${masterInvoiceStatus}`,
        entityType: "invoice",
        entityId: invoice.id,
      });

      res.json({ success: true, invoice: updatedInvoice });
    } catch (error: any) {
      console.error("Update master invoice status error:", error);
      return res.status(500).json({ error: error.message || "Failed to update master invoice status" });
    }
  });

  // Delete Invoice (Soft Delete)
  app.delete("/api/invoices/:id", authMiddleware, requirePermission("invoices", "delete"), async (req: AuthRequest, res: Response) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Validation: Cannot delete paid or partially paid invoices
      if (invoice.paymentStatus === "paid" || invoice.paymentStatus === "partial") {
        return res.status(400).json({ error: "Cannot delete invoices with payments. Please cancel instead." });
      }

      // Validation: Cannot delete master invoices with child invoices
      if (invoice.isMaster) {
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId);
        const childInvoices = allInvoices.filter((inv: any) => inv.parentInvoiceId === invoice.id);
        if (childInvoices.length > 0) {
          return res.status(400).json({ error: "Cannot delete master invoice with child invoices" });
        }
      }

      // Soft delete by marking as cancelled
      const updatedInvoice = await storage.updateInvoice(req.params.id, {
        status: "cancelled" as any,
        cancelledAt: new Date(),
        cancelledBy: req.user!.id,
        cancellationReason: "Deleted by user",
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "invoice_deleted",
        entityType: "invoice",
        entityId: invoice.id,
      });

      res.json({ success: true, message: "Invoice deleted successfully" });
    } catch (error: any) {
      console.error("Delete invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to delete invoice" });
    }
  });

  // Finalize Invoice
  app.put("/api/invoices/:id/finalize", authMiddleware, requirePermission("invoices", "finalize"), async (req: AuthRequest, res: Response) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Validation: Cannot finalize if already paid
      if (invoice.paymentStatus === "paid") {
        return res.status(400).json({ error: "Cannot finalize paid invoices" });
      }

      // Validation: Cannot finalize if cancelled
      if (invoice.status === "cancelled") {
        return res.status(400).json({ error: "Cannot finalize cancelled invoices" });
      }

      // For master invoices, must be confirmed first
      if (invoice.isMaster && invoice.masterInvoiceStatus !== "confirmed" && invoice.masterInvoiceStatus !== "locked") {
        return res.status(400).json({ error: "Master invoice must be confirmed before finalizing" });
      }

      const updatedInvoice = await storage.updateInvoice(req.params.id, {
        finalizedAt: new Date(),
        finalizedBy: req.user!.id,
        status: invoice.status === "draft" ? ("sent" as any) : invoice.status as any,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "invoice_finalized",
        entityType: "invoice",
        entityId: invoice.id,
      });

      res.json({ success: true, invoice: updatedInvoice });
    } catch (error: any) {
      console.error("Finalize invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to finalize invoice" });
    }
  });

  // Lock/Unlock Invoice
  app.put("/api/invoices/:id/lock", authMiddleware, requirePermission("invoices", "lock"), async (req: AuthRequest, res: Response) => {
    try {
      const { isLocked } = req.body;

      if (typeof isLocked !== "boolean") {
        return res.status(400).json({ error: "isLocked must be a boolean" });
      }

      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Validation: Can only lock finalized or paid invoices
      if (isLocked && !invoice.finalizedAt && invoice.paymentStatus !== "paid") {
        return res.status(400).json({ error: "Can only lock finalized or paid invoices" });
      }

      const updatedInvoice = await storage.updateInvoice(req.params.id, {
        isLocked,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: isLocked ? "invoice_locked" : "invoice_unlocked",
        entityType: "invoice",
        entityId: invoice.id,
      });

      res.json({ success: true, invoice: updatedInvoice });
    } catch (error: any) {
      console.error("Lock invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to lock/unlock invoice" });
    }
  });

  // Cancel Invoice
  app.put("/api/invoices/:id/cancel", authMiddleware, requirePermission("invoices", "cancel"), async (req: AuthRequest, res: Response) => {
    try {
      const { cancellationReason } = req.body;

      if (!cancellationReason || cancellationReason.trim().length === 0) {
        return res.status(400).json({ error: "Cancellation reason is required" });
      }

      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Validation: Cannot cancel paid invoices
      if (invoice.paymentStatus === "paid") {
        return res.status(400).json({ error: "Cannot cancel fully paid invoices" });
      }

      // Validation: Cannot cancel if already cancelled (check both status and cancelledAt)
      if (invoice.status === "cancelled" || invoice.cancelledAt) {
        return res.status(400).json({ error: "Invoice is already cancelled" });
      }

      // Helper function to reverse stock for an invoice
      const reverseStockForInvoice = async (invoiceId: string) => {
        try {
          // Get serial numbers linked to this invoice
          const serialsResult = await db
            .select()
            .from(schema.serialNumbers)
            .where(eq(schema.serialNumbers.invoiceId, invoiceId));

          // Group serials by productId for stock updates
          const productStockUpdates: Record<string, number> = {};

          for (const serial of serialsResult) {
            // Track stock to restore per product
            if (serial.productId) {
              productStockUpdates[serial.productId] = (productStockUpdates[serial.productId] || 0) + 1;
            }

            // Reset serial number: status back to in_stock, unlink from invoice
            await db
              .update(schema.serialNumbers)
              .set({
                status: "in_stock",
                invoiceId: null,
                invoiceItemId: null,
                updatedAt: new Date(),
              })
              .where(eq(schema.serialNumbers.id, serial.id));
          }

          // Update product stock quantities
          for (const [productId, quantityToRestore] of Object.entries(productStockUpdates)) {
            const [product] = await db.select().from(schema.products).where(eq(schema.products.id, productId));
            if (product) {
              const currentStock = product.stockQuantity || 0;
              const currentAvailable = product.availableQuantity || 0;

              await db
                .update(schema.products)
                .set({
                  stockQuantity: currentStock + quantityToRestore,
                  availableQuantity: currentAvailable + quantityToRestore,
                  updatedAt: new Date(),
                })
                .where(eq(schema.products.id, productId));
            }
          }

          console.log(`[Stock Reversal] Restored ${serialsResult.length} serial numbers and updated ${Object.keys(productStockUpdates).length} product stock levels for invoice ${invoiceId}`);
        } catch (error) {
          console.error(`[Stock Reversal] Error reversing stock for invoice ${invoiceId}:`, error);
          // Don't throw - we still want to cancel the invoice even if stock reversal fails
        }
      };

      // If master invoice with child invoices, check if any are paid
      if (invoice.isMaster) {
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId);
        const childInvoices = allInvoices.filter((inv: any) => inv.parentInvoiceId === invoice.id);
        const paidChildren = childInvoices.filter((c: any) => c.paymentStatus === "paid");
        if (paidChildren.length > 0) {
          return res.status(400).json({ error: "Cannot cancel master invoice with paid child invoices" });
        }

        // Cancel all unpaid child invoices and reverse their stock
        for (const child of childInvoices) {
          if (child.paymentStatus !== "paid") {
            // Reverse stock for child invoice
            await reverseStockForInvoice(child.id);

            await storage.updateInvoice(child.id, {
              status: "cancelled" as any,
              paymentStatus: "cancelled" as any,
              cancelledAt: new Date(),
              cancelledBy: req.user!.id,
              cancellationReason: `Parent invoice cancelled: ${cancellationReason}`,
            });
          }
        }
      }

      // Reverse stock for the main invoice
      await reverseStockForInvoice(req.params.id);

      const updatedInvoice = await storage.updateInvoice(req.params.id, {
        status: "cancelled" as any,
        paymentStatus: "cancelled" as any,
        cancelledAt: new Date(),
        cancelledBy: req.user!.id,
        cancellationReason,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "invoice_cancelled",
        entityType: "invoice",
        entityId: invoice.id,
      });

      res.json({ success: true, invoice: updatedInvoice });
    } catch (error: any) {
      console.error("Cancel invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to cancel invoice" });
    }
  });

  // Update Master Invoice (with edit restrictions based on status)
  // Also works for Child Invoices (editable until paid)
  app.put("/api/invoices/:id/master-details", authMiddleware, requirePermission("invoices", "edit"), async (req: AuthRequest, res: Response) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Determine if this is a master or child invoice
      const isMasterInvoice = invoice.isMaster;
      const isChildInvoice = !!invoice.parentInvoiceId;
      const isRegularInvoice = !isMasterInvoice && !isChildInvoice;

      // Check edit permissions
      if (isMasterInvoice) {
        // Master invoice edit rules
        if (invoice.masterInvoiceStatus === "locked") {
          return res.status(400).json({
            error: "Cannot edit a locked master invoice"
          });
        }
      } else if (isChildInvoice || isRegularInvoice) {
        // Child or regular invoice edit rules: can edit until paid
        if (invoice.paymentStatus === "paid") {
          return res.status(400).json({
            error: "Cannot edit a paid invoice"
          });
        }
      }

      // Determine if full editing is allowed
      const isDraft = isMasterInvoice
        ? (!invoice.masterInvoiceStatus || invoice.masterInvoiceStatus === "draft")
        : (invoice.paymentStatus !== "paid"); // Child/regular invoices are "draft" until paid

      const updateData: any = {};

      if (isDraft) {
        // Full editing allowed in draft (or for unpaid child invoices)
        const editableFields = [
          "notes", "termsAndConditions", "deliveryNotes", "milestoneDescription",
          "dueDate", "subtotal", "discount", "cgst", "sgst", "igst",
          "shippingCharges", "total", "paymentStatus", "paidAmount"
        ];

        for (const field of editableFields) {
          if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
          }
        }

        // Handle items update
        if (req.body.items && Array.isArray(req.body.items)) {
          // For child invoices, validate quantities don't exceed master limits
          if (isChildInvoice && invoice.parentInvoiceId) {
            const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
            if (masterInvoice) {
              const masterItems = await storage.getInvoiceItems(masterInvoice.id);
              const allChildInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
              const siblingInvoices = allChildInvoices.filter(
                inv => inv.parentInvoiceId === masterInvoice.id && inv.id !== invoice.id
              );

              // Calculate already invoiced quantities by siblings (excluding current)
              const invoicedQuantities: Record<string, number> = {};
              for (const sibling of siblingInvoices) {
                const siblingItems = await storage.getInvoiceItems(sibling.id);
                for (const item of siblingItems) {
                  const key = item.description;
                  invoicedQuantities[key] = (invoicedQuantities[key] || 0) + item.quantity;
                }
              }

              // Validate new items don't exceed remaining quantities
              for (const newItem of req.body.items) {
                const masterItem = masterItems.find(mi => mi.description === newItem.description);
                if (!masterItem) {
                  return res.status(400).json({
                    error: `Item "${newItem.description}" not found in master invoice`
                  });
                }

                const alreadyInvoiced = invoicedQuantities[newItem.description] || 0;
                const remaining = masterItem.quantity - alreadyInvoiced;

                if (newItem.quantity > remaining) {
                  return res.status(400).json({
                    error: `Item "${newItem.description}" quantity (${newItem.quantity}) exceeds remaining quantity (${remaining})`
                  });
                }
              }
            }
          }

          // Delete existing items
          await storage.deleteInvoiceItems(invoice.id);

          // Create new items
          for (const item of req.body.items) {
            await storage.createInvoiceItem({
              invoiceId: invoice.id,
              productId: item.productId || null,
              description: item.description,
              quantity: item.quantity,
              fulfilledQuantity: item.fulfilledQuantity || 0,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal || String(Number(item.quantity) * Number(item.unitPrice)),
              serialNumbers: item.serialNumbers || null,
              status: item.status || "pending",
              sortOrder: item.sortOrder || 0,
              hsnSac: item.hsnSac || null,
            });
          }
        }
      } else {
        // Limited editing in confirmed status (master only - child invoices are always "draft" until paid)
        const allowedFields = ["notes", "termsAndConditions", "deliveryNotes", "milestoneDescription"];

        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
          }
        }
      }

      if (Object.keys(updateData).length === 0 && (!isDraft || !req.body.items)) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      // Update invoice if there are field changes
      let updatedInvoice = invoice;
      if (Object.keys(updateData).length > 0) {
        updatedInvoice = await storage.updateInvoice(req.params.id, updateData) || invoice;
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_master_invoice",
        entityType: "invoice",
        entityId: invoice.id,
      });

      return res.json(updatedInvoice);
    } catch (error: any) {
      console.error("Update master invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to update master invoice" });
    }
  });

  // Create Child Invoice from Master Invoice
  app.post("/api/invoices/:id/create-child-invoice", authMiddleware, requirePermission("invoices", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const { items, dueDate, notes, deliveryNotes, milestoneDescription } = req.body;

      const masterInvoice = await storage.getInvoice(req.params.id);
      if (!masterInvoice) {
        return res.status(404).json({ error: "Master invoice not found" });
      }

      if (!masterInvoice.isMaster) {
        return res.status(400).json({ error: "This is not a master invoice" });
      }

      if (masterInvoice.masterInvoiceStatus === "draft") {
        return res.status(400).json({
          error: "Master invoice must be confirmed before creating child invoices"
        });
      }

      // Validate items don't exceed master invoice quantities
      const masterItems = await storage.getInvoiceItems(masterInvoice.id);
      const allChildInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
      const siblingInvoices = allChildInvoices.filter(inv => inv.parentInvoiceId === masterInvoice.id);

      // Calculate already invoiced quantities per item
      const invoicedQuantities: Record<string, number> = {};
      for (const sibling of siblingInvoices) {
        const siblingItems = await storage.getInvoiceItems(sibling.id);
        for (const item of siblingItems) {
          const key = item.description; // Use description as key
          invoicedQuantities[key] = (invoicedQuantities[key] || 0) + item.quantity;
        }
      }

      // Validate new items don't exceed remaining quantities
      for (const newItem of items) {
        const masterItem = masterItems.find(mi => mi.description === newItem.description);
        if (!masterItem) {
          return res.status(400).json({
            error: `Item "${newItem.description}" not found in master invoice`
          });
        }

        const alreadyInvoiced = invoicedQuantities[newItem.description] || 0;
        const remaining = masterItem.quantity - alreadyInvoiced;

        if (newItem.quantity > remaining) {
          return res.status(400).json({
            error: `Item "${newItem.description}" quantity (${newItem.quantity}) exceeds remaining quantity (${remaining})`
          });
        }
      }

      // Calculate totals for child invoice
      let subtotal = 0;
      for (const item of items) {
        subtotal += Number(item.unitPrice) * item.quantity;
      }

      // Apply proportional taxes and charges based on subtotal ratio
      const masterSubtotal = Number(masterInvoice.subtotal);
      const ratio = masterSubtotal > 0 ? subtotal / masterSubtotal : 0;

      const cgst = (Number(masterInvoice.cgst) * ratio).toFixed(2);
      const sgst = (Number(masterInvoice.sgst) * ratio).toFixed(2);
      const igst = (Number(masterInvoice.igst) * ratio).toFixed(2);
      const shippingCharges = (Number(masterInvoice.shippingCharges) * ratio).toFixed(2);
      const discount = (Number(masterInvoice.discount) * ratio).toFixed(2);

      const total = subtotal + Number(cgst) + Number(sgst) + Number(igst) + Number(shippingCharges) - Number(discount);

      // Generate child invoice number using admin child invoice numbering settings
      const invoiceNumber = await NumberingService.generateChildInvoiceNumber();

      // Create child invoice
      const childInvoice = await storage.createInvoice({
        invoiceNumber,
        parentInvoiceId: masterInvoice.id,
        quoteId: masterInvoice.quoteId,
        paymentStatus: "pending",
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paidAmount: "0",
        subtotal: subtotal.toFixed(2),
        discount,
        cgst,
        sgst,
        igst,
        shippingCharges,
        total: total.toFixed(2),
        notes: notes || masterInvoice.notes,
        termsAndConditions: masterInvoice.termsAndConditions,
        isMaster: false,
        deliveryNotes: deliveryNotes || null,
        milestoneDescription: milestoneDescription || null,
        createdBy: req.user!.id,
      });

      // Create child invoice items
      for (const item of items) {
        await storage.createInvoiceItem({
          invoiceId: childInvoice.id,
          productId: (item as any).productId || null,
          description: item.description,
          quantity: item.quantity,
          fulfilledQuantity: 0,
          unitPrice: item.unitPrice,
          subtotal: (Number(item.unitPrice) * item.quantity).toFixed(2),
          status: "pending",
          sortOrder: item.sortOrder || 0,
          hsnSac: (item as any).hsnSac || null,
        });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_child_invoice",
        entityType: "invoice",
        entityId: childInvoice.id,
      });

      return res.json(childInvoice);
    } catch (error: any) {
      console.error("Create child invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to create child invoice" });
    }
  });

  // Get Master Invoice Summary with remaining quantities
  app.get("/api/invoices/:id/master-summary", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const masterInvoice = await storage.getInvoice(req.params.id);
      if (!masterInvoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      if (!masterInvoice.isMaster) {
        return res.status(400).json({ error: "This is not a master invoice" });
      }

      // Get master items
      const masterItems = await storage.getInvoiceItems(masterInvoice.id);

      // Get all child invoices
      const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
      const childInvoices = allInvoices.filter(inv => inv.parentInvoiceId === masterInvoice.id);

      // Calculate invoiced and remaining quantities
      const invoicedQuantities: Record<string, number> = {};
      const invoicedAmounts: Record<string, number> = {};

      for (const child of childInvoices) {
        const childItems = await storage.getInvoiceItems(child.id);
        for (const item of childItems) {
          const key = item.description;
          invoicedQuantities[key] = (invoicedQuantities[key] || 0) + item.quantity;
          invoicedAmounts[key] = (invoicedAmounts[key] || 0) + Number(item.subtotal);
        }
      }

      // Build summary with remaining quantities
      const itemsSummary = masterItems.map(item => ({
        id: item.id,
        description: item.description,
        masterQuantity: item.quantity,
        masterUnitPrice: item.unitPrice,
        masterSubtotal: item.subtotal,
        invoicedQuantity: invoicedQuantities[item.description] || 0,
        invoicedAmount: invoicedAmounts[item.description] || 0,
        remainingQuantity: item.quantity - (invoicedQuantities[item.description] || 0),
        remainingAmount: Number(item.subtotal) - (invoicedAmounts[item.description] || 0),
      }));

      const totalInvoiced = childInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
      const totalRemaining = Number(masterInvoice.total) - totalInvoiced;

      return res.json({
        masterInvoice: {
          id: masterInvoice.id,
          invoiceNumber: masterInvoice.invoiceNumber,
          status: masterInvoice.masterInvoiceStatus || "draft",
          total: masterInvoice.total,
          subtotal: masterInvoice.subtotal,
          discount: masterInvoice.discount,
          cgst: masterInvoice.cgst,
          sgst: masterInvoice.sgst,
          igst: masterInvoice.igst,
          shippingCharges: masterInvoice.shippingCharges,
          createdAt: masterInvoice.createdAt,
        },
        items: itemsSummary,
        childInvoices: childInvoices.map(child => ({
          id: child.id,
          invoiceNumber: child.invoiceNumber,
          total: child.total,
          paymentStatus: child.paymentStatus,
          paidAmount: child.paidAmount,
          createdAt: child.createdAt,
        })),
        totals: {
          masterTotal: masterInvoice.total,
          totalInvoiced: totalInvoiced.toFixed(2),
          totalRemaining: totalRemaining.toFixed(2),
          invoicedPercentage: ((totalInvoiced / Number(masterInvoice.total)) * 100).toFixed(2),
        },
      });
    } catch (error: any) {
      console.error("Get master invoice summary error:", error);
      return res.status(500).json({ error: error.message || "Failed to get master invoice summary" });
    }
  });

  // ============================================
  // END MASTER INVOICE MANAGEMENT ROUTES
  // ============================================

  // PDF Export for Quotes


  // Email Quote
  app.post("/api/quotes/:id/email", authMiddleware, requirePermission("quotes", "view"), async (req: AuthRequest, res: Response) => {
    try {
      const { recipientEmail, message } = req.body;

      if (!recipientEmail) {
        return res.status(400).json({ error: "Recipient email is required" });
      }

      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      const items = await storage.getQuoteItems(quote.id);

      const creator = await storage.getUser(quote.createdBy);

      // Fetch company settings
      const settings = await storage.getAllSettings();
      const companyName = settings.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";
      const companyAddress = settings.find((s) => s.key === "company_address")?.value || "";
      const companyPhone = settings.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings.find((s) => s.key === "company_gstin")?.value || "";
      const companyLogo = settings.find((s) => s.key === "company_logo")?.value;

      // Fetch email templates
      const emailSubjectTemplate = settings.find((s) => s.key === "email_quote_subject")?.value || "Quote {QUOTE_NUMBER} from {COMPANY_NAME}";
      const emailBodyTemplate = settings.find((s) => s.key === "email_quote_body")?.value || "Dear {CLIENT_NAME},\n\nPlease find attached quote {QUOTE_NUMBER} for your review.\n\nTotal Amount: {TOTAL}\nValid Until: {VALIDITY_DATE}\n\nBest regards,\n{COMPANY_NAME}";

      // Calculate validity date
      const quoteDate = new Date(quote.quoteDate);
      const validityDate = new Date(quoteDate);
      validityDate.setDate(validityDate.getDate() + (quote.validityDays || 30));

      // Replace variables in templates
      const variables: Record<string, string> = {
        "{COMPANY_NAME}": companyName,
        "{CLIENT_NAME}": client.name,
        "{QUOTE_NUMBER}": quote.quoteNumber,
        "{TOTAL}": `₹${Number(quote.total).toLocaleString()}`,
        "{VALIDITY_DATE}": validityDate.toLocaleDateString(),
      };

      let emailSubject = emailSubjectTemplate;
      let emailBody = emailBodyTemplate;

      // Replace variables - escape special regex characters in the key
      Object.entries(variables).forEach(([key, value]) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        emailSubject = emailSubject.replace(new RegExp(escapedKey, 'g'), value);
        emailBody = emailBody.replace(new RegExp(escapedKey, 'g'), value);
      });

      // Add custom message if provided
      if (message) {
        emailBody = `${emailBody}\n\n---\nAdditional Note:\n${message}`;
      }

      // Fetch bank details
      const bankDetail = await storage.getActiveBankDetails();
      const bankName = bankDetail?.bankName || "";
      const bankAccountNumber = bankDetail?.accountNumber || "";
      const bankAccountName = bankDetail?.accountName || "";
      const bankIfscCode = bankDetail?.ifscCode || "";
      const bankBranch = bankDetail?.branch || "";
      const bankSwiftCode = bankDetail?.swiftCode || "";

      // Generate PDF for attachment
      const { PassThrough } = await import("stream");
      const pdfStream = new PassThrough();

      const pdfPromise = PDFService.generateQuotePDF({
        quote,
        client,
        items,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
        companyLogo,
        preparedBy: creator?.name,
        preparedByEmail: creator?.email,
        bankDetails: {
          bankName,
          accountNumber: bankAccountNumber,
          accountName: bankAccountName,
          ifsc: bankIfscCode,
          branch: bankBranch,
          swift: bankSwiftCode,
        },
      }, pdfStream);

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      pdfStream.on("data", (chunk: any) => chunks.push(chunk));
      await new Promise<void>((resolve, reject) => {
        pdfStream.on("end", resolve);
        pdfStream.on("error", reject);
      });
      await pdfPromise;
      const pdfBuffer = Buffer.concat(chunks);

      // Send email with PDF attachment using template
      await EmailService.sendQuoteEmail(
        recipientEmail,
        emailSubject,
        emailBody,
        pdfBuffer
      );


      await storage.createActivityLog({
        userId: req.user!.id,
        action: "email_quote",
        entityType: "quote",
        entityId: quote.id,
      });

      return res.json({ success: true, message: "Quote sent successfully" });
    } catch (error: any) {
      console.error("Email quote error:", error);
      return res.status(500).json({ error: error.message || "Failed to send quote email" });
    }
  });

  // Invoices Routes
  app.get("/api/invoices", requireFeature('invoices_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      const invoicesWithDetails = await Promise.all(
        invoices.map(async (invoice) => {
          const quote = await storage.getQuote(invoice.quoteId);
          const client = quote ? await storage.getClient(quote.clientId) : null;
          return {
            ...invoice,
            quoteNumber: quote?.quoteNumber || "",
            clientName: client?.name || "Unknown",
            total: invoice.total, // Use invoice's total, not quote's
            isMaster: invoice.isMaster || false,
            parentInvoiceId: invoice.parentInvoiceId || null,
          };
        })
      );
      return res.json(invoicesWithDetails);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Get Invoice by ID
  app.get("/api/invoices/:id", requireFeature('invoices_module'), authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }

      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Try to get invoice items first, fallback to quote items if none exist
      let items = await storage.getInvoiceItems(invoice.id);
      const isUsingQuoteItems = !items || items.length === 0;
      if (isUsingQuoteItems) {
        const quoteItems = await storage.getQuoteItems(quote.id);
        items = quoteItems as any; // Use quote items directly for backward compatibility
      }

      const creator = await storage.getUser(quote.createdBy);

      // Get child invoices if this is a master invoice
      let childInvoices: any[] = [];
      if (invoice.isMaster) {
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId);
        childInvoices = allInvoices
          .filter(inv => inv.parentInvoiceId === invoice.id)
          .map(child => ({
            id: child.id,
            invoiceNumber: child.invoiceNumber,
            total: child.total,
            paymentStatus: child.paymentStatus,
            createdAt: child.createdAt,
          }));
      }

      const invoiceDetail = {
        ...invoice,
        quoteNumber: quote.quoteNumber,
        status: quote.status,
        isMaster: invoice.isMaster || false,
        parentInvoiceId: invoice.parentInvoiceId || null,
        childInvoices,
        client: {
          name: client.name,
          email: client.email,
          phone: client.phone || "",
          billingAddress: client.billingAddress || "",
          gstin: client.gstin || "",
        },
        items: items.map((item: any) => ({
          id: item.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          fulfilledQuantity: item.fulfilledQuantity || 0,
          serialNumbers: item.serialNumbers || null,
          status: item.status || "pending",
          hsnSac: item.hsnSac || item.hsn_sac || null,
        })),
        subtotal: invoice.subtotal !== null && invoice.subtotal !== undefined ? invoice.subtotal : quote.subtotal,
        discount: invoice.discount !== null && invoice.discount !== undefined ? invoice.discount : quote.discount,
        cgst: invoice.cgst !== null && invoice.cgst !== undefined ? invoice.cgst : quote.cgst,
        sgst: invoice.sgst !== null && invoice.sgst !== undefined ? invoice.sgst : quote.sgst,
        igst: invoice.igst !== null && invoice.igst !== undefined ? invoice.igst : quote.igst,
        shippingCharges: invoice.shippingCharges !== null && invoice.shippingCharges !== undefined ? invoice.shippingCharges : quote.shippingCharges,
        total: invoice.total !== null && invoice.total !== undefined ? invoice.total : quote.total,
        deliveryNotes: invoice.deliveryNotes || null,
        milestoneDescription: invoice.milestoneDescription || null,
        createdByName: creator?.name || "Unknown",
      };

      return res.json(invoiceDetail);
    } catch (error: any) {
      console.error("Get invoice error:", error);
      return res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // Update Invoice Payment Status and Amount
  app.put("/api/invoices/:id/payment-status", authMiddleware, requirePermission("payments", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const { paymentStatus, paidAmount } = req.body;

      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }

      const updateData: Partial<typeof invoice> = {};

      if (paymentStatus !== undefined) {
        updateData.paymentStatus = paymentStatus;
      }

      if (paidAmount !== undefined) {
        const numPaidAmount = Number(paidAmount);
        // Use invoice total if available, otherwise use quote total
        const totalAmount = invoice.total ? Number(invoice.total) : Number(quote.total);

        if (numPaidAmount < 0 || numPaidAmount > totalAmount) {
          return res.status(400).json({ error: "Invalid paid amount" });
        }

        updateData.paidAmount = String(numPaidAmount);

        // Auto-update status based on amount if not explicitly set
        if (paymentStatus === undefined) {
          if (numPaidAmount >= totalAmount) {
            updateData.paymentStatus = "paid";
          } else if (numPaidAmount > 0) {
            updateData.paymentStatus = "partial";
          } else {
            updateData.paymentStatus = "pending";
          }
        }

        }


      const updatedInvoice = await storage.updateInvoice(req.params.id, updateData);

      // If this is a child invoice, update the master invoice payment totals
      if (invoice.parentInvoiceId) {
        const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
        if (masterInvoice) {
          // Get all child invoices of this master
          const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
          const childInvoices = allInvoices.filter(inv => inv.parentInvoiceId === masterInvoice.id);

          // Calculate total paid amount from all children (including the just-updated one)
          const totalChildPaidAmount = childInvoices.reduce((sum, child) => {
            const childPaid = child.id === invoice.id ? Number(updateData.paidAmount || 0) : Number(child.paidAmount || 0);
            return sum + childPaid;
          }, 0);

          // Update master invoice with aggregated payment data
          const masterTotal = Number(masterInvoice.total);
          let masterPaymentStatus: "pending" | "partial" | "paid" | "overdue" = "pending";
          if (totalChildPaidAmount >= masterTotal) {
            masterPaymentStatus = "paid";
          } else if (totalChildPaidAmount > 0) {
            masterPaymentStatus = "partial";
          }

          await storage.updateInvoice(masterInvoice.id, {
            paidAmount: String(totalChildPaidAmount),
            paymentStatus: masterPaymentStatus,
          });

          // Check if we should auto-close the quote
          if (masterPaymentStatus === "paid") {
            const quote = await storage.getQuote(masterInvoice.quoteId);
            if (quote && quote.status === "invoiced") {
              // All invoices are paid, auto-close the quote
              await storage.updateQuote(quote.id, {
                status: "closed_paid",
                closedAt: new Date(),
                closedBy: req.user!.id,
                closureNotes: "Auto-closed: All invoices fully paid",
              });

              await storage.createActivityLog({
                userId: req.user!.id,
                action: "close_quote",
                entityType: "quote",
                entityId: quote.id,
              });
            }
          }
        }
      } else if (updatedInvoice?.paymentStatus === "paid") {
        // For master or standalone invoices, check if we should close the quote
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId);
        const allPaid = allInvoices.every(inv => inv.paymentStatus === "paid");

        if (allPaid) {
          const quote = await storage.getQuote(invoice.quoteId);
          if (quote && quote.status === "invoiced") {
            await storage.updateQuote(quote.id, {
              status: "closed_paid",
              closedAt: new Date(),
              closedBy: req.user!.id,
              closureNotes: "Auto-closed: All invoices fully paid",
            });

            await storage.createActivityLog({
              userId: req.user!.id,
              action: "close_quote",
              entityType: "quote",
              entityId: quote.id,
            });
          }
        }
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_payment_status",
        entityType: "invoice",
        entityId: invoice.id,
      });

      return res.json(updatedInvoice);
    } catch (error: any) {
      console.error("Update payment status error:", error);
      return res.status(500).json({ error: error.message || "Failed to update payment status" });
    }
  });

  // Record Invoice Payment (incremental)
  app.post("/api/invoices/:id/payment", authMiddleware, requirePermission("payments", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const { amount, paymentMethod, transactionId, notes, paymentDate } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid payment amount is required" });
      }

      if (!paymentMethod) {
        return res.status(400).json({ error: "Payment method is required" });
      }

      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }

      // Create payment history record
      await storage.createPaymentHistory({
        invoiceId: req.params.id,
        amount: String(amount),
        paymentMethod,
        transactionId: transactionId || undefined,
        notes: notes || undefined,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        recordedBy: req.user!.id,
      });

      // Update invoice totals
      const newPaidAmount = Number(invoice.paidAmount) + Number(amount);
      // Use invoice.total for child invoices, quote.total for regular invoices
      const totalAmount = Number(invoice.total || quote.total);

      let newPaymentStatus = invoice.paymentStatus;
      if (newPaidAmount >= totalAmount) {
        newPaymentStatus = "paid";
      } else if (newPaidAmount > 0) {
        newPaymentStatus = "partial";
      }

      const updatedInvoice = await storage.updateInvoice(req.params.id, {
        paidAmount: String(newPaidAmount),
        paymentStatus: newPaymentStatus,
        lastPaymentDate: new Date(),
      });

      // If this is a child invoice, update the master invoice payment totals
      if (invoice.parentInvoiceId) {
        const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
        if (masterInvoice) {
          // Get all child invoices of this master
          const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
          const childInvoices = allInvoices.filter(inv => inv.parentInvoiceId === masterInvoice.id);

          // Calculate total paid amount from all children (use updated amount for current invoice)
          const totalChildPaidAmount = childInvoices.reduce((sum, child) => {
            const childPaid = child.id === invoice.id ? newPaidAmount : Number(child.paidAmount || 0);
            return sum + childPaid;
          }, 0);

          // Update master invoice with aggregated payment data
          const masterTotal = Number(masterInvoice.total);
          let masterPaymentStatus: "pending" | "partial" | "paid" | "overdue" = "pending";
          if (totalChildPaidAmount >= masterTotal) {
            masterPaymentStatus = "paid";
          } else if (totalChildPaidAmount > 0) {
            masterPaymentStatus = "partial";
          }

          await storage.updateInvoice(masterInvoice.id, {
            paidAmount: String(totalChildPaidAmount),
            paymentStatus: masterPaymentStatus,
            lastPaymentDate: new Date(),
          });
        }
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "record_payment",
        entityType: "invoice",
        entityId: invoice.id,
      });

      // Update quote status to closed_paid if all invoices are now fully paid
      // Re-fetch quote to get latest status after all invoice updates
      const updatedQuote = await storage.getQuote(invoice.quoteId);
      if (updatedQuote && updatedQuote.status === "invoiced") {
        // Get all invoices for this quote after all updates
        const allInvoicesForQuote = await storage.getInvoicesByQuote(invoice.quoteId);

        // Check if ALL non-child invoices (master or regular) are fully paid
        // Child invoices don't count separately - only their master invoice counts
        const relevantInvoices = allInvoicesForQuote.filter(inv => !inv.parentInvoiceId);
        const allPaid = relevantInvoices.every(inv => inv.paymentStatus === "paid");

        if (allPaid && relevantInvoices.length > 0) {
          await storage.updateQuote(invoice.quoteId, {
            status: "closed_paid",
            closedAt: new Date(),
            closedBy: req.user!.id,
          });

          await storage.createActivityLog({
            userId: req.user!.id,
            action: "close_quote",
            entityType: "quote",
            entityId: updatedQuote.id,
          });
        }
      }

      return res.json(updatedInvoice);
    } catch (error: any) {
      console.error("Record payment error:", error);
      return res.status(500).json({ error: error.message || "Failed to record payment" });
    }
  });

  // Get Invoice Payment History (Detailed with actual payment records)
  app.get("/api/invoices/:id/payment-history-detailed", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      console.log(`[Payment History] Fetching for invoice ${req.params.id}, isMaster: ${invoice.isMaster}`);

      let payments;

      // If this is a master invoice, aggregate payment history from all child invoices
      if (invoice.isMaster) {
        console.log(`[Payment History] Master invoice detected, aggregating child payments`);
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId);
        const childInvoices = allInvoices.filter(inv => inv.parentInvoiceId === invoice.id);
        console.log(`[Payment History] Found ${childInvoices.length} child invoices:`, childInvoices.map(c => c.id));

        // Get payment history for all child invoices
        const childPayments = await Promise.all(
          childInvoices.map(child => storage.getPaymentHistory(child.id))
        );

        // Flatten and sort by date (most recent first)
        payments = childPayments.flat().sort((a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
        console.log(`[Payment History] Aggregated ${payments.length} payments from children`);
      } else {
        // For regular or child invoices, get payment history directly
        payments = await storage.getPaymentHistory(req.params.id);
        console.log(`[Payment History] Regular/child invoice, found ${payments.length} payments`);
      }

      // Enrich with user names
      const enrichedPayments = await Promise.all(
        payments.map(async (payment) => {
          const user = await storage.getUser(payment.recordedBy);
          return {
            ...payment,
            recordedByName: user?.name || "Unknown",
          };
        })
      );

      console.log(`[Payment History] Returning ${enrichedPayments.length} enriched payments`);
      return res.json(enrichedPayments);
    } catch (error) {
      console.error("Fetch payment history error:", error);
      return res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });

  // Get Invoice Payment History (Legacy - for backward compatibility)
  app.get("/api/invoices/:id/payment-history", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Parse payment notes to create history (legacy)
      const history = [];
      if (invoice.paymentNotes) {
        const entries = invoice.paymentNotes.split("\n").filter(e => e.trim());
        for (const entry of entries) {
          const match = entry.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z): (.+)$/);
          if (match) {
            history.push({
              date: match[1],
              note: match[2],
            });
          }
        }
      }

      return res.json({
        invoiceId: invoice.id,
        paidAmount: invoice.paidAmount,
        lastPaymentDate: invoice.lastPaymentDate,

        history,
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });

  // Delete Payment History Record
  app.delete("/api/payment-history/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      // First get the payment record to get invoice details
      const payment = await storage.getPaymentById(req.params.id);

      if (!payment) {
        return res.status(404).json({ error: "Payment record not found" });
      }

      const invoice = await storage.getInvoice(payment.invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }

      // Delete payment record
      await storage.deletePaymentHistory(req.params.id);

      // Recalculate invoice totals
      const allPayments = await storage.getPaymentHistory(payment.invoiceId);
      const newPaidAmount = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      // Use invoice.total for child invoices, quote.total for regular invoices
      const totalAmount = Number(invoice.total || quote.total);

      let newPaymentStatus: "pending" | "partial" | "paid" | "overdue" = "pending";
      if (newPaidAmount >= totalAmount) {
        newPaymentStatus = "paid";
      } else if (newPaidAmount > 0) {
        newPaymentStatus = "partial";
      }

      const lastPayment = allPayments[0]; // Already sorted by date desc
      await storage.updateInvoice(payment.invoiceId, {
        paidAmount: String(newPaidAmount),
        paymentStatus: newPaymentStatus,
        lastPaymentDate: lastPayment?.paymentDate || null,

      });

      // If this is a child invoice, update the master invoice payment totals
      if (invoice.parentInvoiceId) {
        const masterInvoice = await storage.getInvoice(invoice.parentInvoiceId);
        if (masterInvoice) {
          // Get all child invoices of this master
          const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
          const childInvoices = allInvoices.filter(inv => inv.parentInvoiceId === masterInvoice.id);

          // Calculate total paid amount from all children (with updated payment for current invoice)
          const totalChildPaidAmount = childInvoices.reduce((sum, child) => {
            const childPaid = child.id === invoice.id ? newPaidAmount : Number(child.paidAmount || 0);
            return sum + childPaid;
          }, 0);

          // Update master invoice with aggregated payment data
          const masterTotal = Number(masterInvoice.total);
          let masterPaymentStatus: "pending" | "partial" | "paid" | "overdue" = "pending";
          if (totalChildPaidAmount >= masterTotal) {
            masterPaymentStatus = "paid";
          } else if (totalChildPaidAmount > 0) {
            masterPaymentStatus = "partial";
          }

          await storage.updateInvoice(masterInvoice.id, {
            paidAmount: String(totalChildPaidAmount),
            paymentStatus: masterPaymentStatus,
            lastPaymentDate: totalChildPaidAmount > 0 ? new Date() : null,
          });
        }
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_payment",
        entityType: "invoice",
        entityId: invoice.id,
      });

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Delete payment error:", error);
      return res.status(500).json({ error: error.message || "Failed to delete payment" });
    }
  });

  // PDF Export for Quotes
  app.get("/api/quotes/:id/pdf", authMiddleware, async (req: AuthRequest, res: Response) => {
    console.log(`[PDF Export START] Received request for quote: ${req.params.id}`);
    try {
      const quote = await storage.getQuote(req.params.id);
      console.log(`[PDF Export] Found quote: ${quote?.quoteNumber}`);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      const items = await storage.getQuoteItems(quote.id);
      const creator = await storage.getUser(quote.createdBy);

      // Fetch company settings
      const settings = await storage.getAllSettings();
      // Debug logging to see what keys are available
      console.log("Available settings keys:", settings.map(s => s.key));

      const companyName = settings.find((s) => s.key === "company_companyName")?.value || "OPTIVALUE TEK";
      
      const addr = settings.find((s) => s.key === "company_address")?.value || "";
      const city = settings.find((s) => s.key === "company_city")?.value || "";
      const state = settings.find((s) => s.key === "company_state")?.value || "";
      const zip = settings.find((s) => s.key === "company_zipCode")?.value || "";
      const country = settings.find((s) => s.key === "company_country")?.value || "";
      
      // Construct full address
      const companyAddress = [addr, city, state, zip, country].filter(Boolean).join(", ");

      const companyPhone = settings.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings.find((s) => s.key === "company_gstin")?.value || "";
      const companyLogo = settings.find((s) => s.key === "company_logo")?.value;
      
      console.log("Company Logo found:", !!companyLogo, "Length:", companyLogo?.length);

      // Fetch bank details from settings
      const bankName = settings.find((s) => s.key === "bank_bankName")?.value || "";
      const bankAccountNumber = settings.find((s) => s.key === "bank_accountNumber")?.value || "";
      const bankAccountName = settings.find((s) => s.key === "bank_accountName")?.value || "";
      const bankIfscCode = settings.find((s) => s.key === "bank_ifscCode")?.value || "";
      const bankBranch = settings.find((s) => s.key === "bank_branch")?.value || "";
      const bankSwiftCode = settings.find((s) => s.key === "bank_swiftCode")?.value || "";

      console.error("!!! DEBUG BANK DETAILS !!!", {
          bankName,
          bankAccountNumber,
          bankAccountName,
          bankIfscCode
      });

      // Create filename - ensure it's clean and doesn't have problematic characters
      const cleanFilename = `Quote-${quote.quoteNumber}.pdf`.replace(/[^\w\-. ]/g, '_');

      // Set headers BEFORE piping to ensure they're sent first
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", "");  // Let Node calculate length
      // Use RFC 5987 format for filename with UTF-8 encoding
      res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // DEBUG: Log what we're sending
      console.log(`[PDF Export] Quote #${quote.quoteNumber}`);
      console.log(`[PDF Export] Clean filename: ${cleanFilename}`);
      console.log(`[PDF Export] Content-Disposition header: attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);

      // Generate PDF
      console.log(`[PDF Export] About to generate PDF`);
      await PDFService.generateQuotePDF({
        quote,
        client,
        items,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
        companyLogo,
        preparedBy: creator?.name,
        preparedByEmail: creator?.email,
        bankDetails: {
          bankName,
          accountNumber: bankAccountNumber,
          accountName: bankAccountName,
          ifsc: bankIfscCode,
          branch: bankBranch,
          swift: bankSwiftCode,
        },
      }, res);
      console.log(`[PDF Export] PDF stream piped successfully`);

      // Log after headers are sent
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "export_pdf",
        entityType: "quote",
        entityId: quote.id,
      });
      console.log(`[PDF Export COMPLETE] Quote PDF exported successfully: ${quote.quoteNumber}`);
    } catch (error: any) {
      console.error("[PDF Export ERROR]", error);
      return res.status(500).json({ error: error.message || "Failed to generate PDF" });
    }
  });

  // PDF Export for Invoices
  app.get("/api/invoices/:id/pdf", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }

      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Get invoice items (not quote items) for accurate PDF generation
      let items = await storage.getInvoiceItems(invoice.id);

      // Fallback to quote items if no invoice items exist (for backward compatibility)
      if (!items || items.length === 0) {
        const quoteItems = await storage.getQuoteItems(quote.id);
        items = quoteItems as any;
      }

      const creator = await storage.getUser(quote.createdBy);

      // Get parent invoice info if this is a child invoice
      let parentInvoice = null;
      if (invoice.parentInvoiceId) {
        parentInvoice = await storage.getInvoice(invoice.parentInvoiceId);
      }

      // Get child invoices if this is a master invoice
      let childInvoices: any[] = [];
      if (invoice.isMaster) {
        const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId);
        childInvoices = allInvoices
          .filter(inv => inv.parentInvoiceId === invoice.id)
          .map(child => ({
            invoiceNumber: child.invoiceNumber,
            total: child.total,
            paymentStatus: child.paymentStatus,
            createdAt: child.createdAt,
          }));
      }

      // Fetch company settings
      const settings = await storage.getAllSettings();
      const companyName = settings.find((s) => s.key === "company_companyName")?.value || "OPTIVALUE TEK";
      
      const addr = settings.find((s) => s.key === "company_address")?.value || "";
      const city = settings.find((s) => s.key === "company_city")?.value || "";
      const state = settings.find((s) => s.key === "company_state")?.value || "";
      const zip = settings.find((s) => s.key === "company_zipCode")?.value || "";
      const country = settings.find((s) => s.key === "company_country")?.value || "";
      
      // Construct full address
      const companyAddress = [addr, city, state, zip, country].filter(Boolean).join(", ");

      const companyPhone = settings.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings.find((s) => s.key === "company_gstin")?.value || "";
      const companyLogo = settings.find((s) => s.key === "company_logo")?.value;

      // Fetch bank details from settings
      const bankName = settings.find((s) => s.key === "bank_bankName")?.value || "";
      const bankAccountNumber = settings.find((s) => s.key === "bank_accountNumber")?.value || "";
      const bankAccountName = settings.find((s) => s.key === "bank_accountName")?.value || "";
      const bankIfscCode = settings.find((s) => s.key === "bank_ifscCode")?.value || "";
      const bankBranch = settings.find((s) => s.key === "bank_branch")?.value || "";
      const bankSwiftCode = settings.find((s) => s.key === "bank_swiftCode")?.value || "";

      // Create filename - ensure it's clean and doesn't have problematic characters
      const cleanFilename = `Invoice-${invoice.invoiceNumber}.pdf`.replace(/[^\w\-. ]/g, '_');

      // Set headers BEFORE piping to ensure they're sent first
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", "");  // Let Node calculate length
      // Use RFC 5987 format for filename with UTF-8 encoding
      res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // DEBUG: Log what we're sending
      console.log(`[PDF Export] Invoice #${invoice.invoiceNumber}`);
      console.log(`[PDF Export] Clean filename: ${cleanFilename}`);
      console.log(`[PDF Export] Content-Disposition header: attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`);

      // Generate PDF
      await InvoicePDFService.generateInvoicePDF({
        quote,
        client,
        items: items as any, // Type cast to handle both invoice items and quote items
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
        preparedBy: creator?.name,
        companyLogo,
        userEmail: req.user?.email,
        companyDetails: {
          name: companyName,
          address: companyAddress,
          phone: companyPhone,
          email: companyEmail,
          website: companyWebsite,
          gstin: companyGSTIN,
        },
        invoiceNumber: invoice.invoiceNumber,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
        paidAmount: invoice.paidAmount || "0",
        paymentStatus: invoice.paymentStatus || "pending",
        // Master/Child invoice specific fields
        isMaster: invoice.isMaster,
        masterInvoiceStatus: invoice.masterInvoiceStatus || undefined,
        parentInvoiceNumber: parentInvoice?.invoiceNumber,
        childInvoices: childInvoices,
        deliveryNotes: invoice.deliveryNotes || undefined,
        milestoneDescription: invoice.milestoneDescription || undefined,
        // Use invoice totals (not quote totals)
        subtotal: invoice.subtotal || "0",
        discount: invoice.discount || "0",
        cgst: invoice.cgst || "0",
        sgst: invoice.sgst || "0",
        igst: invoice.igst || "0",
        shippingCharges: invoice.shippingCharges || "0",
        total: invoice.total || "0",
        notes: invoice.notes || undefined,
        termsAndConditions: invoice.termsAndConditions,
        // Bank details
        bankName,
        bankAccountNumber,
        bankAccountName,
        bankIfscCode,
        bankBranch,
        bankSwiftCode,
      }, res);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "export_pdf",
        entityType: "invoice",
        entityId: invoice.id,
      });
    } catch (error: any) {
      console.error("PDF export error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate PDF" });
    }
  });

  // Email Invoice
  app.post("/api/invoices/:id/email", authMiddleware, requirePermission("invoices", "view"), async (req: AuthRequest, res: Response) => {
    try {
      const { recipientEmail, message } = req.body;

      if (!recipientEmail) {
        return res.status(400).json({ error: "Recipient email is required" });
      }

      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }

      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      const items = await storage.getQuoteItems(quote.id);

      const creator = await storage.getUser(quote.createdBy);

      // Fetch company settings
      const settings = await storage.getAllSettings();
      const companyName = settings.find((s) => s.key === "company_companyName")?.value || "OPTIVALUE TEK";

      const addr = settings.find((s) => s.key === "company_address")?.value || "";
      const city = settings.find((s) => s.key === "company_city")?.value || "";
      const state = settings.find((s) => s.key === "company_state")?.value || "";
      const zip = settings.find((s) => s.key === "company_zipCode")?.value || "";
      const country = settings.find((s) => s.key === "company_country")?.value || "";

      // Construct full address
      const companyAddress = [addr, city, state, zip, country].filter(Boolean).join(", ");

      const companyPhone = settings.find((s) => s.key === "company_phone")?.value || "";
      const companyEmail = settings.find((s) => s.key === "company_email")?.value || "";
      const companyWebsite = settings.find((s) => s.key === "company_website")?.value || "";
      const companyGSTIN = settings.find((s) => s.key === "company_gstin")?.value || "";
      const companyLogo = settings.find((s) => s.key === "company_logo")?.value;

      // Fetch email templates
      const emailSubjectTemplate = settings.find((s) => s.key === "email_invoice_subject")?.value || "Invoice {INVOICE_NUMBER} from {COMPANY_NAME}";
      const emailBodyTemplate = settings.find((s) => s.key === "email_invoice_body")?.value || "Dear {CLIENT_NAME},\n\nPlease find attached invoice {INVOICE_NUMBER}.\n\nAmount Due: {TOTAL}\nDue Date: {DUE_DATE}\n\nPayment Details:\n{BANK_DETAILS}\n\nBest regards,\n{COMPANY_NAME}";

      // Get bank details from settings
      const bankName = settings.find((s) => s.key === "bank_bankName")?.value || "";
      const bankAccountNumber = settings.find((s) => s.key === "bank_accountNumber")?.value || "";
      const bankAccountName = settings.find((s) => s.key === "bank_accountName")?.value || "";
      const bankIfscCode = settings.find((s) => s.key === "bank_ifscCode")?.value || "";
       
      const bankDetailsForEmail = bankName
        ? `Bank: ${bankName}\nAccount: ${bankAccountName}\nAccount Number: ${bankAccountNumber}\nIFSC: ${bankIfscCode}`
        : "Contact us for payment details";

      // Replace variables in templates
      const variables: Record<string, string> = {
        "{COMPANY_NAME}": companyName,
        "{CLIENT_NAME}": client.name,
        "{INVOICE_NUMBER}": invoice.invoiceNumber,
        "{TOTAL}": `₹${Number(invoice.total).toLocaleString()}`,
        "{OUTSTANDING}": `₹${(Number(invoice.total) - Number(invoice.paidAmount)).toLocaleString()}`,
        "{DUE_DATE}": invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : new Date().toLocaleDateString(),
        "{BANK_DETAILS}": bankDetailsForEmail,
      };

      let emailSubject = emailSubjectTemplate;
      let emailBody = emailBodyTemplate;

      Object.entries(variables).forEach(([key, value]) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        emailSubject = emailSubject.replace(new RegExp(escapedKey, 'g'), value);
        emailBody = emailBody.replace(new RegExp(escapedKey, 'g'), value);
      });

      // Add custom message if provided
      if (message) {
        emailBody = `${emailBody}\n\n---\nAdditional Note:\n${message}`;
      }

      // Generate PDF for attachment
      // Generate PDF for attachment
      const { PassThrough } = await import("stream");
      const pdfStream = new PassThrough();

      const pdfPromise = InvoicePDFService.generateInvoicePDF({
        quote,
        client,
        items,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyWebsite,
        companyGSTIN,
        preparedBy: creator?.name,
        companyLogo,
        userEmail: req.user?.email,
        companyDetails: {
          name: companyName,
          address: companyAddress,
          phone: companyPhone,
          email: companyEmail,
          website: companyWebsite,
          gstin: companyGSTIN,
        },
        invoiceNumber: invoice.invoiceNumber,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
        paidAmount: invoice.paidAmount || "0",
        paymentStatus: invoice.paymentStatus || "pending",
        // Add missing invoice fields
        isMaster: invoice.isMaster,
        masterInvoiceStatus: invoice.masterInvoiceStatus || undefined,
        deliveryNotes: invoice.deliveryNotes || undefined,
        milestoneDescription: invoice.milestoneDescription || undefined,
        // Use invoice totals (not quote totals)
        subtotal: invoice.subtotal || "0",
        discount: invoice.discount || "0",
        cgst: invoice.cgst || "0",
        sgst: invoice.sgst || "0",
        igst: invoice.igst || "0",
        shippingCharges: invoice.shippingCharges || "0",
        total: invoice.total || "0",
        notes: invoice.notes || undefined,
        termsAndConditions: invoice.termsAndConditions,
        // Bank details from dedicated table
        // Bank details from settings
        bankName: bankName || undefined,
        bankAccountNumber: bankAccountNumber || undefined,
        bankAccountName: bankAccountName || undefined,
        bankIfscCode: bankIfscCode || undefined,
        bankBranch: settings.find((s) => s.key === "bank_branch")?.value || undefined,
        bankSwiftCode: settings.find((s) => s.key === "bank_swiftCode")?.value || undefined,
      }, pdfStream);

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      pdfStream.on("data", (chunk: any) => chunks.push(chunk));
      await new Promise<void>((resolve, reject) => {
        pdfStream.on("end", resolve);
        pdfStream.on("error", reject);
      });
      await pdfPromise;
      const pdfBuffer = Buffer.concat(chunks);

      // Send email with PDF attachment using template
      await EmailService.sendInvoiceEmail(
        recipientEmail,
        emailSubject,
        emailBody,
        pdfBuffer
      );

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "email_invoice",
        entityType: "invoice",
        entityId: invoice.id,
      });

      return res.json({ success: true, message: "Invoice sent successfully" });
    } catch (error: any) {
      console.error("Email invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to send invoice email" });
    }
  });

  // Send Payment Reminder
  app.post("/api/invoices/:id/payment-reminder", authMiddleware, requirePermission("invoices", "view"), async (req: AuthRequest, res: Response) => {
    try {
      const { recipientEmail, message } = req.body;

      if (!recipientEmail) {
        return res.status(400).json({ error: "Recipient email is required" });
      }

      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const quote = await storage.getQuote(invoice.quoteId);
      if (!quote) {
        return res.status(404).json({ error: "Related quote not found" });
      }

      const client = await storage.getClient(quote.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Fetch company settings
      const settings = await storage.getAllSettings();
      const companyName = settings.find((s) => s.key === "company_name")?.value || "OPTIVALUE TEK";

      // Fetch email template
      const emailSubjectTemplate = settings.find((s) => s.key === "email_payment_reminder_subject")?.value || "Payment Reminder: Invoice {INVOICE_NUMBER}";
      const emailBodyTemplate = settings.find((s) => s.key === "email_payment_reminder_body")?.value || "Dear {CLIENT_NAME},\n\nThis is a friendly reminder that invoice {INVOICE_NUMBER} is due for payment.\n\nAmount Due: {OUTSTANDING}\nDue Date: {DUE_DATE}\nDays Overdue: {DAYS_OVERDUE}\n\nPlease arrange payment at your earliest convenience.\n\nBest regards,\n{COMPANY_NAME}";

      // Calculate days overdue
      const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date();
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysOverdueText = daysOverdue > 0 ? `${daysOverdue} days` : "Not overdue";

      // Calculate outstanding amount
      const outstanding = Number(invoice.total) - Number(invoice.paidAmount);

      // Replace variables in templates
      const variables: Record<string, string> = {
        "{COMPANY_NAME}": companyName,
        "{CLIENT_NAME}": client.name,
        "{INVOICE_NUMBER}": invoice.invoiceNumber,
        "{OUTSTANDING}": `₹${outstanding.toLocaleString()}`,
        "{TOTAL}": `₹${Number(invoice.total).toLocaleString()}`,
        "{DUE_DATE}": dueDate.toLocaleDateString(),
        "{DAYS_OVERDUE}": daysOverdueText,
      };

      let emailSubject = emailSubjectTemplate;
      let emailBody = emailBodyTemplate;

      Object.entries(variables).forEach(([key, value]) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        emailSubject = emailSubject.replace(new RegExp(escapedKey, 'g'), value);
        emailBody = emailBody.replace(new RegExp(escapedKey, 'g'), value);
      });

      // Add custom message if provided
      if (message) {
        emailBody = `${emailBody}\n\n---\nAdditional Note:\n${message}`;
      }

      // Send payment reminder email
      await EmailService.sendPaymentReminderEmail(
        recipientEmail,
        emailSubject,
        emailBody
      );

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "send_payment_reminder",
        entityType: "invoice",
        entityId: invoice.id,
      });

      return res.json({ success: true, message: "Payment reminder sent successfully" });
    } catch (error: any) {
      console.error("Payment reminder error:", error);
      return res.status(500).json({ error: error.message || "Failed to send payment reminder" });
    }
  });

  // Templates Routes
  app.get("/api/templates", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const type = req.query.type as string | undefined;
      const style = req.query.style as string | undefined;

      let templates;
      if (type) {
        templates = await storage.getTemplatesByType(type);
      } else if (style) {
        templates = await storage.getTemplatesByStyle(style);
      } else {
        templates = await storage.getAllTemplates();
      }

      return res.json(templates);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/type/:type", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const templates = await storage.getTemplatesByType(req.params.type);
      return res.json(templates);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch templates by type" });
    }
  });

  app.get("/api/templates/default/:type", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const template = await storage.getDefaultTemplate(req.params.type);
      if (!template) {
        return res.status(404).json({ error: "Default template not found" });
      }
      return res.json(template);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch default template" });
    }
  });

  app.get("/api/templates/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      return res.json(template);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const template = await storage.createTemplate({
        ...req.body,
        createdBy: req.user!.id,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_template",
        entityType: "template",
        entityId: template.id,
      });

      return res.json(template);
    } catch (error: any) {
      console.error("Create template error:", error);
      return res.status(500).json({ error: error.message || "Failed to create template" });
    }
  });

  app.patch("/api/templates/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const template = await storage.updateTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_template",
        entityType: "template",
        entityId: template.id,
      });

      return res.json(template);
    } catch (error: any) {
      console.error("Update template error:", error);
      return res.status(500).json({ error: error.message || "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteTemplate(req.params.id);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_template",
        entityType: "template",
        entityId: req.params.id,
      });

      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // Settings/Pricing Routes
  app.get("/api/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can access settings" });
      }
      const settingsArray = await storage.getAllSettings();
      // Convert array to key-value object for easier frontend consumption
      const settingsObject = settingsArray.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      return res.json(settingsObject);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can update settings" });
      }

      const body = req.body;

      // Check if it's a single key-value pair or bulk update
      if (body.key && body.value !== undefined) {
        // Single setting update
        const setting = await storage.upsertSetting({
          key: body.key,
          value: body.value,
          updatedBy: req.user!.id,
        });
        await storage.createActivityLog({
          userId: req.user!.id,
          action: "update_setting",
          entityType: "setting",
          entityId: body.key,
        });
        return res.json(setting);
      } else {
        // Bulk settings update
        const results = [];
        for (const [key, value] of Object.entries(body)) {
          if (value !== undefined && value !== null) {
            const setting = await storage.upsertSetting({
              key,
              value: String(value),
              updatedBy: req.user!.id,
            });
            results.push(setting);
          }
        }

        await storage.createActivityLog({
          userId: req.user!.id,
          action: "update_settings",
          entityType: "settings",
          entityId: "bulk",
        });

        return res.json(results);
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update setting" });
    }
  });

  // ==================== DOCUMENT NUMBER MIGRATION ROUTES ====================

  app.post("/api/settings/migrate-document-numbers", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can migrate document numbers" });
      }

      const { DocumentNumberMigrationService } = await import("./services/document-number-migration.service");

      // Options allow selective migration - if not specified, all are migrated
      const options = {
        migrateQuotes: req.body.migrateQuotes !== false,
        migrateVendorPos: req.body.migrateVendorPos !== false,
        migrateMasterInvoices: req.body.migrateMasterInvoices !== false,
        migrateChildInvoices: req.body.migrateChildInvoices !== false,
        migrateGrns: req.body.migrateGrns !== false,
      };

      const result = await DocumentNumberMigrationService.migrateAllDocumentNumbers(options);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "migrate_document_numbers",
        entityType: "settings",
        entityId: "document_numbering",
      });

      return res.json({
        success: result.success,
        message: result.success ? "Document numbers migrated successfully" : "Some migrations failed",
        migrated: result.migrated,
        errors: result.errors,
      });
    } catch (error: any) {
      console.error("Document number migration error:", error);
      return res.status(500).json({
        error: error.message || "Failed to migrate document numbers",
        success: false,
      });
    }
  });

  // ==================== NUMBERING COUNTER MANAGEMENT ROUTES ====================

  // Get current counter values for all document types
  app.get("/api/numbering/counters", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can access counter values" });
      }

      const { NumberingService } = await import("./services/numbering.service");
      const { featureFlags } = await import("../shared/feature-flags");
      const year = new Date().getFullYear();

      const counters: any = { year };

      // Only include counters for enabled features
      if (featureFlags.quotes_module) {
        counters.quote = await NumberingService.getCounter("quote", year);
      }
      if (featureFlags.vendorPO_module) {
        counters.vendor_po = await NumberingService.getCounter("vendor_po", year);
      }
      if (featureFlags.invoices_module) {
        counters.invoice = await NumberingService.getCounter("invoice", year);
      }
      if (featureFlags.grn_module) {
        counters.grn = await NumberingService.getCounter("grn", year);
      }
      if (featureFlags.sales_orders_module) {
        counters.sales_order = await NumberingService.getCounter("sales_order", year);
      }

      return res.json(counters);
    } catch (error: any) {
      console.error("Get counters error:", error);
      return res.status(500).json({ error: error.message || "Failed to get counters" });
    }
  });

  // Reset a counter to 0
  app.post("/api/numbering/reset-counter", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can reset counters" });
      }

      const { type, year } = req.body;

      if (!type) {
        return res.status(400).json({ error: "Counter type is required" });
      }

      const validTypes = ["quote", "vendor_po", "invoice", "grn", "sales_order"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid counter type" });
      }

      // Check if feature is enabled
      const { featureFlags } = await import("../shared/feature-flags");
      const featureMap: Record<string, boolean> = {
        quote: featureFlags.quotes_module,
        vendor_po: featureFlags.vendorPO_module,
        invoice: featureFlags.invoices_module,
        grn: featureFlags.grn_module,
        sales_order: featureFlags.sales_orders_module,
      };

      if (!featureMap[type]) {
        return res.status(403).json({ error: `Feature for ${type} is not enabled` });
      }

      const { NumberingService } = await import("./services/numbering.service");
      const targetYear = year || new Date().getFullYear();

      await NumberingService.resetCounter(type, targetYear);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "reset_counter",
        entityType: "numbering",
        entityId: `${type}_${targetYear}`,
      });

      return res.json({
        success: true,
        message: `Counter for ${type} (${targetYear}) reset to 0`,
        currentValue: 0,
      });
    } catch (error: any) {
      console.error("Reset counter error:", error);
      return res.status(500).json({ error: error.message || "Failed to reset counter" });
    }
  });

  // Set a counter to a custom value
  app.post("/api/numbering/set-counter", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can set counters" });
      }

      const { type, year, value } = req.body;

      if (!type || value === undefined) {
        return res.status(400).json({ error: "Counter type and value are required" });
      }

      const validTypes = ["quote", "vendor_po", "invoice", "grn", "sales_order"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid counter type" });
      }

      const numericValue = parseInt(value, 10);
      if (isNaN(numericValue) || numericValue < 0) {
        return res.status(400).json({ error: "Value must be a non-negative number" });
      }

      // Check if feature is enabled
      const { featureFlags } = await import("../shared/feature-flags");
      const featureMap: Record<string, boolean> = {
        quote: featureFlags.quotes_module,
        vendor_po: featureFlags.vendorPO_module,
        invoice: featureFlags.invoices_module,
        grn: featureFlags.grn_module,
        sales_order: featureFlags.sales_orders_module,
      };

      if (!featureMap[type]) {
        return res.status(403).json({ error: `Feature for ${type} is not enabled` });
      }

      const { NumberingService } = await import("./services/numbering.service");
      const targetYear = year || new Date().getFullYear();

      await NumberingService.setCounter(type, targetYear, numericValue);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "set_counter",
        entityType: "numbering",
        entityId: `${type}_${targetYear}`,
      });

      return res.json({
        success: true,
        message: `Counter for ${type} (${targetYear}) set to ${numericValue}`,
        currentValue: numericValue,
      });
    } catch (error: any) {
      console.error("Set counter error:", error);
      return res.status(500).json({ error: error.message || "Failed to set counter" });
    }
  });

  // ==================== BANK DETAILS ROUTES ====================

  app.get("/api/bank-details", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can access bank details" });
      }
      const details = await storage.getAllBankDetails();
      return res.json(details);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch bank details" });
    }
  });

  app.get("/api/bank-details/active", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const detail = await storage.getActiveBankDetails();
      return res.json(detail || null);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch active bank details" });
    }
  });

  app.post("/api/bank-details", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can create bank details" });
      }

      const { bankName, accountNumber, accountName, ifscCode, branch, swiftCode } = req.body;

      if (!bankName || !accountNumber || !accountName || !ifscCode) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const detail = await storage.createBankDetails({
        bankName,
        accountNumber,
        accountName,
        ifscCode,
        branch: branch || null,
        swiftCode: swiftCode || null,
        isActive: true,
        updatedBy: req.user!.id,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_bank_details",
        entityType: "bank_details",
        entityId: detail.id,
      });

      return res.json(detail);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to create bank details" });
    }
  });

  app.put("/api/bank-details/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can update bank details" });
      }

      const { bankName, accountNumber, accountName, ifscCode, branch, swiftCode, isActive } = req.body;

      const detail = await storage.updateBankDetails(
        req.params.id,
        {
          ...(bankName && { bankName }),
          ...(accountNumber && { accountNumber }),
          ...(accountName && { accountName }),
          ...(ifscCode && { ifscCode }),
          ...(branch !== undefined && { branch }),
          ...(swiftCode !== undefined && { swiftCode }),
          ...(isActive !== undefined && { isActive }),
          updatedBy: req.user!.id,
        }
      );

      if (!detail) {
        return res.status(404).json({ error: "Bank details not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_bank_details",
        entityType: "bank_details",
        entityId: detail.id,
      });

      return res.json(detail);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update bank details" });
    }
  });

  app.delete("/api/bank-details/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only admins can delete bank details" });
      }

      await storage.deleteBankDetails(req.params.id);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_bank_details",
        entityType: "bank_details",
        entityId: req.params.id,
      });

      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to delete bank details" });
    }
  });

  // ==================== VENDORS ROUTES ====================
  app.get("/api/vendors", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ error: "Failed to fetch vendor" });
    }
  });

  app.post("/api/vendors", authMiddleware, requirePermission("vendors", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const vendor = await storage.createVendor({
        ...req.body,
        createdBy: req.user!.id,
      });
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ error: "Failed to create vendor" });
    }
  });

  app.patch("/api/vendors/:id", authMiddleware, requirePermission("vendors", "edit"), async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateVendor(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ error: "Failed to update vendor" });
    }
  });

  app.delete("/api/vendors/:id", authMiddleware, requirePermission("vendors", "delete"), async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteVendor(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ error: "Failed to delete vendor" });
    }
  });

  // ==================== VENDOR PURCHASE ORDERS ROUTES ====================
  app.get("/api/vendor-pos", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const pos = await storage.getAllVendorPos();

      const enrichedPos = await Promise.all(
        pos.map(async (po) => {
          const vendor = await storage.getVendor(po.vendorId);
          const quote = po.quoteId ? await storage.getQuote(po.quoteId) : null;
          return {
            ...po,
            vendorName: vendor?.name || "Unknown",
            quoteNumber: quote?.quoteNumber || "N/A",
          };
        })
      );

      res.json(enrichedPos);
    } catch (error) {
      console.error("Error fetching vendor POs:", error);
      res.status(500).json({ error: "Failed to fetch vendor POs" });
    }
  });

  app.get("/api/vendor-pos/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const po = await storage.getVendorPo(req.params.id);
      if (!po) {
        return res.status(404).json({ error: "Vendor PO not found" });
      }

      const vendor = await storage.getVendor(po.vendorId);
      const quote = po.quoteId ? await storage.getQuote(po.quoteId) : null;
      const items = await storage.getVendorPoItems(po.id);

      res.json({
        ...po,
        vendor: vendor || {},
        quote: quote ? { id: quote.id, quoteNumber: quote.quoteNumber } : undefined,
        items,
      });
    } catch (error) {
      console.error("Error fetching vendor PO:", error);
      res.status(500).json({ error: "Failed to fetch vendor PO" });
    }
  });

  app.post("/api/quotes/:id/create-vendor-po", authMiddleware, requirePermission("vendor_pos", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const quoteItems = await storage.getQuoteItems(quote.id);
      const poNumber = await NumberingService.generateVendorPoNumber();

      const po = await storage.createVendorPo({
        poNumber,
        quoteId: quote.id,
        vendorId: req.body.vendorId,
        status: "draft",
        orderDate: new Date(),
        expectedDeliveryDate: req.body.expectedDeliveryDate ? new Date(req.body.expectedDeliveryDate) : null,
        subtotal: quote.subtotal,
        discount: quote.discount,
        cgst: quote.cgst,
        sgst: quote.sgst,
        igst: quote.igst,
        shippingCharges: quote.shippingCharges,
        total: quote.total,
        notes: req.body.notes || null,
        termsAndConditions: quote.termsAndConditions,
        createdBy: req.user!.id,
      });

      for (const item of quoteItems) {
        await storage.createVendorPoItem({
          vendorPoId: po.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          receivedQuantity: 0,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          sortOrder: item.sortOrder,
        });
      }

      res.json(po);
    } catch (error) {
      console.error("Error creating vendor PO:", error);
      res.status(500).json({ error: "Failed to create vendor PO" });
    }
  });

  app.post("/api/vendor-pos", authMiddleware, requirePermission("vendor_pos", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const { 
        vendorId, 
        expectedDeliveryDate, 
        items, 
        subtotal, 
        discount, 
        cgst, 
        sgst, 
        igst, 
        shippingCharges, 
        total, 
        notes, 
        termsAndConditions 
      } = req.body;

      if (!vendorId) {
        return res.status(400).json({ error: "Vendor ID is required" });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ error: "At least one item is required" });
      }

      // Generate PO number
      const poNumber = await NumberingService.generateVendorPoNumber();

      // Create Vendor PO
      const po = await storage.createVendorPo({
        poNumber,
        quoteId: null, // Standalone PO
        vendorId,
        status: "draft",
        orderDate: new Date(),
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        subtotal: subtotal.toString(),
        discount: discount.toString(),
        cgst: cgst.toString(),
        sgst: sgst.toString(),
        igst: igst.toString(),
        shippingCharges: shippingCharges.toString(),
        total: total.toString(),
        notes: notes || null,
        termsAndConditions: termsAndConditions || null,
        createdBy: req.user!.id,
      });

      // Create PO Items
      let sortOrder = 0;
      for (const item of items) {
        await storage.createVendorPoItem({
          vendorPoId: po.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          receivedQuantity: 0,
          unitPrice: item.unitPrice.toString(),
          subtotal: item.subtotal.toString(),
          sortOrder: sortOrder++,
        });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_vendor_po",
        entityType: "vendor_po",
        entityId: po.id,
      });

      res.json(po);
    } catch (error: any) {
      console.error("Error creating vendor PO:", error);
      res.status(500).json({ error: error.message || "Failed to create vendor PO" });
    }
  });

  app.patch("/api/vendor-pos/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const updated = await storage.updateVendorPo(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Vendor PO not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor PO:", error);
      res.status(500).json({ error: "Failed to update vendor PO" });
    }
  });

  app.patch("/api/vendor-pos/:id/items/:itemId/serials", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { serialNumbers } = req.body;
      const updated = await storage.updateVendorPoItem(req.params.itemId, {
        serialNumbers: JSON.stringify(serialNumbers),
        receivedQuantity: serialNumbers.length,
      });

      if (!updated) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating serial numbers:", error);
      res.status(500).json({ error: "Failed to update serial numbers" });
    }
  });

  // ==================== MULTIPLE INVOICES ROUTES ====================
  app.get("/api/quotes/:id/invoices", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const invoices = await storage.getInvoicesByQuote(req.params.id);
      const enrichedInvoices = await Promise.all(
        invoices.map(async (invoice) => {
          const items = await storage.getInvoiceItems(invoice.id);
          return { ...invoice, items };
        })
      );
      res.json(enrichedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.post("/api/quotes/:id/create-invoice", authMiddleware, requirePermission("invoices", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const { parentInvoiceId, isMaster = false } = req.body;

      let invoiceNumber: string;

      // Generate hierarchical invoice numbers
      if (parentInvoiceId) {
        // This is a child invoice
        const parentInvoice = await storage.getInvoice(parentInvoiceId);
        if (!parentInvoice) {
          return res.status(404).json({ error: "Parent invoice not found" });
        }

        // Get all child invoices of this parent
        const allInvoices = await storage.getInvoicesByQuote(quote.id);
        const siblings = allInvoices.filter(inv => inv.parentInvoiceId === parentInvoiceId);
        const childNumber = siblings.length + 1;

        // Generate child invoice number: INV-001-1, INV-001-2, etc.
        invoiceNumber = `${parentInvoice.invoiceNumber}-${childNumber}`;
      } else if (isMaster) {
        // This is a master invoice
        invoiceNumber = await NumberingService.generateMasterInvoiceNumber();
      } else {
        // This is a standalone/child invoice
        invoiceNumber = await NumberingService.generateChildInvoiceNumber();
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = await storage.createInvoice({
        invoiceNumber,
        quoteId: quote.id,
        parentInvoiceId: parentInvoiceId || null,
        isMaster: parentInvoiceId ? false : (isMaster || false),
        paymentStatus: "pending",
        dueDate,
        paidAmount: "0",
        clientId: quote.clientId,
        subtotal: String(quote.subtotal || 0),
        discount: String(quote.discount || 0),
        cgst: String(quote.cgst || 0),
        sgst: String(quote.sgst || 0),
        igst: String(quote.igst || 0),
        total: String(quote.total || 0),
        remainingAmount: String(quote.total || 0),
        status: "draft",
        createdBy: req.user!.id,
      });

      // Create invoice items
      const quoteItems = await storage.getQuoteItems(quote.id);
      for (const item of quoteItems) {
        await storage.createInvoiceItem({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          hsnSac: item.hsnSac
        });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_invoice",
        entityType: "invoice",
        entityId: invoice.id,
      });

      return res.json(invoice);
    } catch (error: any) {
      console.error("Create invoice error:", error);
      return res.status(500).json({ error: error.message || "Failed to create invoice" });
    }
  });
  app.get("/api/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      const settingsMap: Record<string, string> = {};
      settings.forEach(s => {
        settingsMap[s.key] = s.value;
      });
      return res.json(settingsMap);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const settingsData = req.body;

      for (const [key, value] of Object.entries(settingsData)) {
        await storage.upsertSetting({
          key,
          value: String(value),
          updatedBy: req.user!.id,
        });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_settings",
        entityType: "settings",
      });

      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update settings" });
    }
  });

  // PDF Theme Routes
  app.get("/api/themes", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { getAllThemes } = await import("./services/pdf-themes");
      const themes = getAllThemes();
      return res.json(themes);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to get themes" });
    }
  });

  app.get("/api/themes/segment/:segment", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { getSuggestedTheme } = await import("./services/pdf-themes");
      const theme = getSuggestedTheme(req.params.segment);
      return res.json(theme);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to get suggested theme" });
    }
  });

  app.patch("/api/clients/:id/theme", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { preferredTheme, segment } = req.body;

      const updateData: any = {};
      if (preferredTheme !== undefined) updateData.preferredTheme = preferredTheme;
      if (segment !== undefined) updateData.segment = segment;

      const client = await storage.updateClient(req.params.id, updateData);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_client_theme",
        entityType: "client",
        entityId: req.params.id,
      });

      return res.json(client);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update client theme" });
    }
  });

  // Governance & Activity Log Routes (Admin only)
  app.get("/api/governance/stats", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      // Get total and active users
      const allUsers = await storage.getAllUsers();
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter((u: any) => u.status === "active").length;

      // Get activity logs count
      const activityLogs = await db.select().from(schema.activityLogs);
      const totalActivities = activityLogs.length;
      const criticalActivities = activityLogs.filter(log =>
        log.action.includes("delete") ||
        log.action.includes("approve") ||
        log.action.includes("lock") ||
        log.action.includes("finalize")
      ).length;

      // Count unauthorized attempts (from activity logs)
      const unauthorizedAttempts = activityLogs.filter(log =>
        log.action.includes("unauthorized")
      ).length;

      // Recent approvals (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentApprovals = activityLogs.filter(log =>
        log.action.includes("approve") &&
        log.timestamp &&
        new Date(log.timestamp) > thirtyDaysAgo
      ).length;

      return res.json({
        totalUsers,
        activeUsers,
        totalActivities,
        criticalActivities,
        unauthorizedAttempts,
        recentApprovals,
      });
    } catch (error: any) {
      console.error("Error fetching governance stats:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch governance stats" });
    }
  });

  app.get("/api/activity-logs/recent", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      // Get recent activity logs (last 100)
      const logs = await db
        .select()
        .from(schema.activityLogs)
        .orderBy(desc(schema.activityLogs.timestamp))
        .limit(100);

      // Enrich with user information
      const enrichedLogs = await Promise.all(
        logs.map(async (log) => {
          const user = log.userId ? await storage.getUser(log.userId) : null;
          return {
            ...log,
            userName: user?.name || "Unknown User",
            userEmail: user?.email || "unknown@example.com",
          };
        })
      );

      return res.json(enrichedLogs);
    } catch (error: any) {
      console.error("Error fetching activity logs:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch activity logs" });
    }
  });

  // ==================== TAX RATES & PAYMENT TERMS ROUTES ====================

  // Get all tax rates
  app.get("/api/tax-rates", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const rates = await db.select().from(schema.taxRates).where(eq(schema.taxRates.isActive, true));
      // Transform to simpler format for frontend
      const simplifiedRates = rates.map(rate => ({
        id: rate.id,
        name: `${rate.taxType} ${rate.region}`,
        percentage: parseFloat(rate.igstRate), // Use IGST as the main rate
        sgstRate: parseFloat(rate.sgstRate),
        cgstRate: parseFloat(rate.cgstRate),
        igstRate: parseFloat(rate.igstRate),
        region: rate.region,
        taxType: rate.taxType,
        isActive: rate.isActive,
        effectiveFrom: rate.effectiveFrom,
        effectiveTo: rate.effectiveTo,
      }));
      return res.json(simplifiedRates);
    } catch (error: any) {
      console.error("Error fetching tax rates:", error);
      return res.status(500).json({ error: "Failed to fetch tax rates" });
    }
  });

  // Create tax rate
  app.post("/api/tax-rates", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!["admin", "finance_accounts"].includes(req.user!.role)) {
        return res.status(403).json({ error: "Forbidden: Only admin and finance can manage tax rates" });
      }

      const { region, taxType, sgstRate, cgstRate, igstRate, description } = req.body;

      if (!region || !taxType) {
        return res.status(400).json({ error: "Region and taxType are required" });
      }

      // Use the rates provided by the client, default to 0 if not provided
      const sgst = sgstRate !== undefined && sgstRate !== null ? String(sgstRate) : "0";
      const cgst = cgstRate !== undefined && cgstRate !== null ? String(cgstRate) : "0";
      const igst = igstRate !== undefined && igstRate !== null ? String(igstRate) : "0";

      const newRate = await db.insert(schema.taxRates).values({
        region,
        taxType,
        sgstRate: sgst,
        cgstRate: cgst,
        igstRate: igst,
      }).returning();

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_tax_rate",
        entityType: "tax_rate",
        entityId: newRate[0].id,
      });

      return res.json({
        id: newRate[0].id,
        region,
        taxType,
        sgstRate: parseFloat(sgst),
        cgstRate: parseFloat(cgst),
        igstRate: parseFloat(igst),
      });
    } catch (error: any) {
      console.error("Error creating tax rate:", error);
      return res.status(500).json({ error: error.message || "Failed to create tax rate" });
    }
  });

  // Delete tax rate
  app.delete("/api/tax-rates/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!["admin", "finance_accounts"].includes(req.user!.role)) {
        return res.status(403).json({ error: "Forbidden: Only admin and finance can manage tax rates" });
      }

      await db.delete(schema.taxRates).where(eq(schema.taxRates.id, req.params.id));

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_tax_rate",
        entityType: "tax_rate",
        entityId: req.params.id,
      });

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting tax rate:", error);
      return res.status(500).json({ error: error.message || "Failed to delete tax rate" });
    }
  });

  // Get all payment terms
  app.get("/api/payment-terms", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const terms = await db.select().from(schema.paymentTerms).where(eq(schema.paymentTerms.isActive, true));
      return res.json(terms);
    } catch (error: any) {
      console.error("Error fetching payment terms:", error);
      return res.status(500).json({ error: "Failed to fetch payment terms" });
    }
  });

  // Create payment term
  app.post("/api/payment-terms", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!["admin", "finance_accounts"].includes(req.user!.role)) {
        return res.status(403).json({ error: "Forbidden: Only admin and finance can manage payment terms" });
      }

      const { name, days, description, isDefault } = req.body;

      if (!name || days === undefined) {
        return res.status(400).json({ error: "Name and days are required" });
      }

      // If this is set as default, remove default from others
      if (isDefault) {
        await db.update(schema.paymentTerms).set({ isDefault: false }).where(eq(schema.paymentTerms.isDefault, true));
      }

      const newTerm = await db.insert(schema.paymentTerms).values({
        name,
        days,
        description: description || null,
        isDefault: isDefault || false,
        createdBy: req.user!.id,
      }).returning();

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_payment_term",
        entityType: "payment_term",
        entityId: newTerm[0].id,
      });

      return res.json(newTerm[0]);
    } catch (error: any) {
      console.error("Error creating payment term:", error);
      return res.status(500).json({ error: error.message || "Failed to create payment term" });
    }
  });

  // Delete payment term
  app.delete("/api/payment-terms/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!["admin", "finance_accounts"].includes(req.user!.role)) {
        return res.status(403).json({ error: "Forbidden: Only admin and finance can manage payment terms" });
      }

      await db.delete(schema.paymentTerms).where(eq(schema.paymentTerms.id, req.params.id));

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_payment_term",
        entityType: "payment_term",
        entityId: req.params.id,
      });

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting payment term:", error);
      return res.status(500).json({ error: error.message || "Failed to delete payment term" });
    }
  });

  // ==================== DEBUG ENDPOINTS ====================
  // These are public endpoints for debugging numbering system
  // Admin should protect these endpoints at reverse proxy level if needed

  app.get("/api/debug/counters", async (req: Request, res: Response) => {
    try {
      const year = new Date().getFullYear();
      const types = ["quote", "master_invoice", "child_invoice", "vendor_po", "grn"];
      const counters: Record<string, any> = {};

      for (const type of types) {
        const counterKey = `${type}_counter_${year}`;
        const setting = await storage.getSetting(counterKey);
        const currentValue = setting?.value || "0";
        const nextValue = parseInt(String(currentValue), 10) + 1;
        counters[counterKey] = {
          current: currentValue,
          next: String(nextValue).padStart(4, "0"),
          exists: !!setting,
        };
      }

      return res.json({
        year,
        counters,
        message: "Next value shows what will be generated next"
      });
    } catch (error: any) {
      console.error("Error fetching counters:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch counters" });
    }
  });

  app.post("/api/debug/reset-counter/:type", async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const year = new Date().getFullYear();

      console.log(`[DEBUG] Resetting counter for ${type} in year ${year}`);

      await NumberingService.resetCounter(type, year);

      return res.json({
        success: true,
        message: `Counter ${type}_counter_${year} has been reset to 0`,
        nextNumber: "0001"
      });
    } catch (error: any) {
      console.error("Error resetting counter:", error);
      return res.status(500).json({ error: error.message || "Failed to reset counter" });
    }
  });

  app.post("/api/debug/set-counter/:type/:value", async (req: Request, res: Response) => {
    try {
      const { type, value } = req.params;
      const year = new Date().getFullYear();
      const numValue = parseInt(value, 10);

      if (isNaN(numValue) || numValue < 0) {
        return res.status(400).json({ error: "Value must be a non-negative integer" });
      }

      console.log(`[DEBUG] Setting ${type}_counter_${year} to ${numValue}`);

      await NumberingService.setCounter(type, year, numValue);

      const nextValue = numValue + 1;
      return res.json({
        success: true,
        message: `Counter ${type}_counter_${year} set to ${numValue}`,
        nextNumber: String(nextValue).padStart(4, "0")
      });
    } catch (error: any) {
      console.error("Error setting counter:", error);
      return res.status(500).json({ error: error.message || "Failed to set counter" });
    }
  });



  app.patch("/api/invoices/:id/items/:itemId/serials", authMiddleware, requirePermission("serial_numbers", "edit"), async (req: AuthRequest, res: Response) => {
    try {
      const { serialNumbers } = req.body;

      console.log(`Updating serial numbers for item ${req.params.itemId} in invoice ${req.params.id}`);
      console.log(`Serial numbers count: ${serialNumbers?.length || 0}`);

      // Get the invoice item being updated
      const invoiceItem = await storage.getInvoiceItem(req.params.itemId);
      if (!invoiceItem) {
        return res.status(404).json({ error: "Invoice item not found" });
      }

      // Update the child/current invoice item
      const updated = await storage.updateInvoiceItem(req.params.itemId, {
        serialNumbers: JSON.stringify(serialNumbers),
        fulfilledQuantity: serialNumbers.length,
        status: serialNumbers.length > 0 ? "fulfilled" : "pending",
      });

      if (!updated) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Get the invoice to check if it's a child invoice
      const invoice = await storage.getInvoice(req.params.id);

      // If this is a child invoice, update the corresponding master item
      if (invoice && invoice.parentInvoiceId) {
        console.log(`This is a child invoice. Parent: ${invoice.parentInvoiceId}`);
        console.log(`Syncing with master invoice...`);

        // Get master invoice items
        const masterItems = await storage.getInvoiceItems(invoice.parentInvoiceId);

        console.log(`Searching for master item with:`);
        console.log(`  Description: "${invoiceItem.description}"`);
        console.log(`  Unit Price: ${invoiceItem.unitPrice}`);
        console.log(`\nAvailable master items:`);
        masterItems.forEach((mi: any, index: number) => {
          console.log(`  [${index}] Description: "${mi.description}", Unit Price: ${mi.unitPrice}`);
        });

        // Find the corresponding master item by matching description and unitPrice
        const masterItem = masterItems.find((mi: any) =>
          mi.description === invoiceItem.description &&
          Number(mi.unitPrice) === Number(invoiceItem.unitPrice)
        );

        if (masterItem) {
          console.log(`Found master item: ${masterItem.description} (ID: ${masterItem.id})`);

          // Get all child invoices of this master
          const allInvoices = await storage.getInvoicesByQuote(invoice.quoteId);
          const childInvoices = allInvoices.filter(inv => inv.parentInvoiceId === invoice.parentInvoiceId);

          console.log(`Found ${childInvoices.length} child invoices for this master`);

          // Aggregate serial numbers from all child invoices for this item
          const allChildSerialNumbers = [];
          for (const childInvoice of childInvoices) {
            const childItems = await storage.getInvoiceItems(childInvoice.id);
            const matchingChildItem = childItems.find((ci: any) =>
              ci.description === masterItem.description &&
              Number(ci.unitPrice) === Number(masterItem.unitPrice)
            );

            if (matchingChildItem && matchingChildItem.serialNumbers) {
              try {
                const serials = JSON.parse(matchingChildItem.serialNumbers);
                allChildSerialNumbers.push(...serials);
                console.log(`  Child ${childInvoice.invoiceNumber}: ${serials.length} serial numbers`);
              } catch (e) {
                console.error("Error parsing serial numbers:", e);
              }
            }
          }

          console.log(`Total aggregated serial numbers: ${allChildSerialNumbers.length}`);

          // Update master item with aggregated serial numbers
          await storage.updateInvoiceItem(masterItem.id, {
            serialNumbers: allChildSerialNumbers.length > 0
              ? JSON.stringify(allChildSerialNumbers)
              : null,
            status: masterItem.fulfilledQuantity >= masterItem.quantity ? "fulfilled" : "pending",
          });

          console.log(`✓ Master item updated successfully with ${allChildSerialNumbers.length} serial numbers`);
        } else {
          console.log(`⚠ No matching master item found for: ${invoiceItem.description}`);
        }
      } else {
        console.log(`This is not a child invoice or is a master invoice itself`);
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating serial numbers:", error);
      res.status(500).json({ error: "Failed to update serial numbers" });
    }
  });

  // Serial Number Validation Route
  app.post("/api/invoices/:id/items/:itemId/serials/validate", authMiddleware, requirePermission("serial_numbers", "view"), async (req: AuthRequest, res: Response) => {
    try {
      const { validateSerialNumbers } = await import("./serial-number-service");
      const { serials, expectedQuantity } = req.body;
      const { id: invoiceId, itemId } = req.params;

      if (!serials || !Array.isArray(serials)) {
        return res.status(400).json({ error: "Invalid serials array" });
      }

      if (typeof expectedQuantity !== 'number') {
        return res.status(400).json({ error: "Expected quantity must be a number" });
      }

      const validation = await validateSerialNumbers(
        invoiceId,
        itemId,
        serials,
        expectedQuantity,
        {
          checkInvoiceScope: true,
          checkQuoteScope: true,
          checkSystemWide: true,
        }
      );

      return res.json(validation);
    } catch (error: any) {
      console.error("Error validating serial numbers:", error);
      return res.status(500).json({ error: error.message || "Failed to validate serial numbers" });
    }
  });

  // Check serial edit permissions
  app.get("/api/invoices/:id/serials/permissions", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { canEditSerialNumbers } = await import("./serial-number-service");
      const { id: invoiceId } = req.params;

      const permissions = await canEditSerialNumbers(req.user!.id, invoiceId);

      return res.json(permissions);
    } catch (error: any) {
      console.error("Error checking serial edit permissions:", error);
      return res.status(500).json({ error: error.message || "Failed to check permissions" });
    }
  });

  // Serial Number Search/Traceability Route
  app.get("/api/serial-numbers/search", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { getSerialTraceability } = await import("./serial-number-service");
      const serialNumber = req.query.q as string;

      if (!serialNumber || serialNumber.trim().length === 0) {
        return res.status(400).json({ error: "Serial number query is required" });
      }

      const traceability = await getSerialTraceability(serialNumber.trim());

      if (!traceability) {
        return res.status(404).json({ error: "Serial number not found" });
      }

      return res.json(traceability);
    } catch (error: any) {
      console.error("Error searching serial number:", error);
      return res.status(500).json({ error: error.message || "Failed to search serial number" });
    }
  });

  // Batch validate serial numbers
  app.post("/api/serial-numbers/batch-validate", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { getSerialTraceability } = await import("./serial-number-service");
      const { serials } = req.body;

      if (!serials || !Array.isArray(serials)) {
        return res.status(400).json({ error: "Invalid serials array" });
      }

      // Check each serial for system-wide existence
      const results = await Promise.all(
        serials.map(async (serial) => {
          const traceability = await getSerialTraceability(serial);
          return {
            serial,
            exists: !!traceability,
            info: traceability,
          };
        })
      );

      return res.json({ results });
    } catch (error: any) {
      console.error("Error batch validating serials:", error);
      return res.status(500).json({ error: error.message || "Failed to validate serials" });
    }
  });

  // Create child invoice from master invoice
  app.post("/api/invoices/:masterId/create-child", authMiddleware, requirePermission("invoices", "create"), async (req: AuthRequest, res: Response) => {
    try {
      const { masterId } = req.params;
      const { items, milestoneDescription, deliveryNotes, notes } = req.body;

      console.log("Creating child invoice for master:", masterId);
      console.log("Request body:", JSON.stringify(req.body, null, 2));

      // 1. Verify master invoice exists and is actually a master
      const masterInvoice = await storage.getInvoice(masterId);
      if (!masterInvoice) {
        console.error("Master invoice not found:", masterId);
        return res.status(404).json({ error: "Master invoice not found" });
      }

      if (!masterInvoice.isMaster) {
        console.error("Invoice is not a master invoice:", masterId);
        return res.status(400).json({ error: "Invoice is not a master invoice" });
      }

      // 2. Get master invoice items
      const masterItems = await storage.getInvoiceItems(masterId);
      console.log("Master items count:", masterItems?.length || 0);

      if (!masterItems || masterItems.length === 0) {
        console.error("Master invoice has no items");
        return res.status(400).json({ error: "Master invoice has no items" });
      }

      // 3. Validate items array
      if (!items || !Array.isArray(items) || items.length === 0) {
        console.error("Invalid items array:", items);
        return res.status(400).json({ error: "Items array is required and must not be empty" });
      }

      // 4. Validate quantities - ensure we're not over-invoicing
      for (const item of items) {
        const masterItem = masterItems.find((mi: any) => mi.id === item.itemId);
        if (!masterItem) {
          console.error("Item not found in master:", item.itemId);
          return res.status(400).json({ error: `Item ${item.itemId} not found in master invoice` });
        }

        const remaining = masterItem.quantity - masterItem.fulfilledQuantity;
        console.log(`Item ${masterItem.description}: qty=${item.quantity}, remaining=${remaining}`);

        if (item.quantity > remaining) {
          console.error(`Over-invoicing detected: requested=${item.quantity}, remaining=${remaining}`);
          return res.status(400).json({
            error: `Cannot invoice ${item.quantity} of "${masterItem.description}". Only ${remaining} remaining.`
          });
        }
      }

      // 4. Generate child invoice number (INV-001-1, INV-001-2, etc.)
      const allInvoices = await storage.getInvoicesByQuote(masterInvoice.quoteId);
      const siblings = allInvoices.filter(inv => inv.parentInvoiceId === masterId);
      // Generate child invoice number using admin child invoice numbering settings
      const childInvoiceNumber = await NumberingService.generateChildInvoiceNumber();

      // 5. Calculate totals based on selected items
      let subtotal = 0;
      console.log("Calculating subtotal for child invoice...");
      for (const item of items) {
        const masterItem = masterItems.find((mi: any) => mi.id === item.itemId);
        if (!masterItem) {
          console.error("Master item not found during calculation:", item.itemId);
          continue; // Skip if not found (already validated, but safety check)
        }
        const itemSubtotal = Number(masterItem.unitPrice) * item.quantity;
        console.log(`  Item: ${masterItem.description}, unitPrice: ${masterItem.unitPrice}, qty: ${item.quantity}, subtotal: ${itemSubtotal}`);
        subtotal += itemSubtotal;
      }
      console.log("Total subtotal:", subtotal);

      // 6. Pro-rate taxes and discounts proportionally
      const masterSubtotal = Number(masterInvoice.subtotal);
      console.log("Master subtotal:", masterSubtotal);
      const ratio = masterSubtotal > 0 ? subtotal / masterSubtotal : 0;
      console.log("Ratio:", ratio);

      const discount = Number(masterInvoice.discount) * ratio;
      const cgst = Number(masterInvoice.cgst) * ratio;
      const sgst = Number(masterInvoice.sgst) * ratio;
      const igst = Number(masterInvoice.igst) * ratio;
      const shippingCharges = Number(masterInvoice.shippingCharges) * ratio;

      console.log("Calculated amounts - discount:", discount, "cgst:", cgst, "sgst:", sgst, "igst:", igst, "shipping:", shippingCharges);

      const total = subtotal - discount + cgst + sgst + igst + shippingCharges;
      console.log("Final total:", total);

      // 7. Create child invoice
      const childInvoice = await storage.createInvoice({
        invoiceNumber: childInvoiceNumber,
        parentInvoiceId: masterId,
        quoteId: masterInvoice.quoteId,
        paymentStatus: "pending",
        dueDate: masterInvoice.dueDate ? new Date(masterInvoice.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2),
        shippingCharges: shippingCharges.toFixed(2),
        total: total.toFixed(2),
        paidAmount: "0",
        isMaster: false,
        milestoneDescription: milestoneDescription || null,
        deliveryNotes: deliveryNotes || null,
        notes: notes || masterInvoice.notes || null,
        termsAndConditions: masterInvoice.termsAndConditions || null,
        createdBy: req.user!.id,
      });

      // 8. Create invoice items and update master item quantities
      for (const item of items) {
        const masterItem = masterItems.find((mi: any) => mi.id === item.itemId);
        if (!masterItem) continue; // Skip if not found

        // Create child invoice item
        await storage.createInvoiceItem({
          invoiceId: childInvoice.id,
          description: masterItem.description,
          quantity: item.quantity,
          fulfilledQuantity: 0,
          unitPrice: masterItem.unitPrice,
          subtotal: (Number(masterItem.unitPrice) * item.quantity).toFixed(2),
          serialNumbers: item.serialNumbers ? JSON.stringify(item.serialNumbers) : null,
          status: "pending",
          sortOrder: masterItem.sortOrder,
          hsnSac: (masterItem as any).hsnSac || null,
        });

        // Update master item's fulfilledQuantity
        await db
          .update(schema.invoiceItems)
          .set({
            fulfilledQuantity: sql`${schema.invoiceItems.fulfilledQuantity} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(schema.invoiceItems.id, masterItem.id));
      }

      // 9. Log activity
      await db.insert(schema.activityLogs).values({
        userId: req.user!.id,
        action: "child_invoice_created",
        entityType: "invoice",
        entityId: childInvoice.id,
      });

      res.json(childInvoice);
    } catch (error) {
      console.error("Error creating child invoice:", error);
      res.status(500).json({ error: "Failed to create child invoice" });
    }
  });

  // ==================== PRODUCTS ROUTES ====================
  app.get("/api/products", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const products = await db.select().from(schema.products).orderBy(schema.products.name);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const [product] = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, req.params.id));

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const [product] = await db
        .insert(schema.products)
        .values({
          ...req.body,
          createdBy: req.user!.id,
        })
        .returning();

      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const [updated] = await db
        .update(schema.products)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(schema.products.id, req.params.id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // ==================== GRN ROUTES ====================
  app.get("/api/grns", authMiddleware, requireFeature('grn_module'), async (req: AuthRequest, res: Response) => {
    try {
      const grns = await db
        .select({
          id: schema.goodsReceivedNotes.id,
          grnNumber: schema.goodsReceivedNotes.grnNumber,
          vendorPoId: schema.goodsReceivedNotes.vendorPoId,
          receivedDate: schema.goodsReceivedNotes.receivedDate,
          quantityOrdered: schema.goodsReceivedNotes.quantityOrdered,
          quantityReceived: schema.goodsReceivedNotes.quantityReceived,
          quantityRejected: schema.goodsReceivedNotes.quantityRejected,
          inspectionStatus: schema.goodsReceivedNotes.inspectionStatus,
          deliveryNoteNumber: schema.goodsReceivedNotes.deliveryNoteNumber,
          batchNumber: schema.goodsReceivedNotes.batchNumber,
          poNumber: schema.vendorPurchaseOrders.poNumber,
          vendorName: schema.vendors.name,
        })
        .from(schema.goodsReceivedNotes)
        .leftJoin(
          schema.vendorPurchaseOrders,
          eq(schema.goodsReceivedNotes.vendorPoId, schema.vendorPurchaseOrders.id)
        )
        .leftJoin(
          schema.vendors,
          eq(schema.vendorPurchaseOrders.vendorId, schema.vendors.id)
        )
        .orderBy(desc(schema.goodsReceivedNotes.receivedDate));

      res.json(grns);
    } catch (error) {
      console.error("Error fetching GRNs:", error);
      res.status(500).json({ error: "Failed to fetch GRNs" });
    }
  });

  app.get("/api/grns/:id", authMiddleware, requireFeature('grn_module'), async (req: AuthRequest, res: Response) => {
    try {
      const [grn] = await db
        .select({
          id: schema.goodsReceivedNotes.id,
          grnNumber: schema.goodsReceivedNotes.grnNumber,
          vendorPoId: schema.goodsReceivedNotes.vendorPoId,
          vendorPoItemId: schema.goodsReceivedNotes.vendorPoItemId,
          receivedDate: schema.goodsReceivedNotes.receivedDate,
          quantityOrdered: schema.goodsReceivedNotes.quantityOrdered,
          quantityReceived: schema.goodsReceivedNotes.quantityReceived,
          quantityRejected: schema.goodsReceivedNotes.quantityRejected,
          inspectionStatus: schema.goodsReceivedNotes.inspectionStatus,
          inspectedBy: schema.goodsReceivedNotes.inspectedBy,
          inspectionNotes: schema.goodsReceivedNotes.inspectionNotes,
          deliveryNoteNumber: schema.goodsReceivedNotes.deliveryNoteNumber,
          batchNumber: schema.goodsReceivedNotes.batchNumber,
          attachments: schema.goodsReceivedNotes.attachments,
        })
        .from(schema.goodsReceivedNotes)
        .where(eq(schema.goodsReceivedNotes.id, req.params.id));

      if (!grn) {
        return res.status(404).json({ error: "GRN not found" });
      }

      // Fetch related data
      const [po] = await db
        .select()
        .from(schema.vendorPurchaseOrders)
        .where(eq(schema.vendorPurchaseOrders.id, grn.vendorPoId));

      const [vendor] = await db
        .select()
        .from(schema.vendors)
        .where(eq(schema.vendors.id, po.vendorId));

      const [poItem] = await db
        .select()
        .from(schema.vendorPoItems)
        .where(eq(schema.vendorPoItems.id, grn.vendorPoItemId));

      let inspector = null;
      if (grn.inspectedBy) {
        [inspector] = await db
          .select({ id: schema.users.id, name: schema.users.name })
          .from(schema.users)
          .where(eq(schema.users.id, grn.inspectedBy));
      }

      res.json({
        ...grn,
        vendorPo: {
          id: po.id,
          poNumber: po.poNumber,
          vendor: {
            name: vendor.name,
            email: vendor.email,
            phone: vendor.phone,
          },
        },
        vendorPoItem: poItem,
        inspectedBy: inspector,
      });
    } catch (error) {
      console.error("Error fetching GRN:", error);
      res.status(500).json({ error: "Failed to fetch GRN" });
    }
  });

  app.post("/api/grns", authMiddleware, requireFeature('grn_module'), async (req: AuthRequest, res: Response) => {
    try {
      const {
        vendorPoId,
        vendorPoItemId,
        quantityOrdered,
        quantityReceived,
        quantityRejected,
        inspectionStatus,
        inspectionNotes,
        deliveryNoteNumber,
        batchNumber,
        serialNumbers,
      } = req.body;

      // Generate GRN number using NumberingService
      const grnNumber = await NumberingService.generateGrnNumber();

      // Create GRN
      const [grn] = await db
        .insert(schema.goodsReceivedNotes)
        .values({
          grnNumber,
          vendorPoId,
          vendorPoItemId,
          quantityOrdered,
          quantityReceived,
          quantityRejected: quantityRejected || 0,
          inspectionStatus: inspectionStatus || "pending",
          inspectionNotes,
          deliveryNoteNumber,
          batchNumber,
          createdBy: req.user!.id,
        })
        .returning();

      // Update vendor PO item received quantity
      const [poItem] = await db
        .select()
        .from(schema.vendorPoItems)
        .where(eq(schema.vendorPoItems.id, vendorPoItemId));

      await db
        .update(schema.vendorPoItems)
        .set({
          receivedQuantity: (poItem.receivedQuantity || 0) + quantityReceived,
          updatedAt: new Date(),
        })
        .where(eq(schema.vendorPoItems.id, vendorPoItemId));

      // Update product stock if productId is linked to the PO item (only if stock tracking is enabled)
      if (poItem.productId && isFeatureEnabled('products_stock_tracking')) {
        const quantityAccepted = quantityReceived - (quantityRejected || 0);
        if (quantityAccepted > 0) {
          await db
            .update(schema.products)
            .set({
              stockQuantity: sql`${schema.products.stockQuantity} + ${quantityAccepted}`,
              availableQuantity: sql`${schema.products.availableQuantity} + ${quantityAccepted}`,
              updatedAt: new Date(),
            })
            .where(eq(schema.products.id, poItem.productId));
          
          console.log(`[GRN] Updated product ${poItem.productId} stock: +${quantityAccepted}`);
        }
      } else if (poItem.productId && !isFeatureEnabled('products_stock_tracking')) {
        console.log(`[GRN] Stock update skipped for product ${poItem.productId}: Stock tracking is disabled`);
      }

      // Create serial numbers if provided
      if (serialNumbers && Array.isArray(serialNumbers) && serialNumbers.length > 0) {
        const serialRecords = serialNumbers.map((sn: string) => ({
          serialNumber: sn,
          productId: poItem.productId || null, // Link serial to product
          vendorPoId,
          vendorPoItemId,
          grnId: grn.id,
          status: "in_stock",
          createdBy: req.user!.id,
        }));

        await db.insert(schema.serialNumbers).values(serialRecords);
      }

      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_grn",
        entityType: "grn",
        entityId: grn.id,
      });

      res.json(grn);
    } catch (error: any) {
      console.error("Error creating GRN:", error);
      res.status(500).json({ error: error.message || "Failed to create GRN" });
    }
  });

  app.patch("/api/grns/:id", authMiddleware, requireFeature('grn_module'), async (req: AuthRequest, res: Response) => {
    try {
      const {
        quantityReceived,
        quantityRejected,
        inspectionStatus,
        inspectionNotes,
        deliveryNoteNumber,
        batchNumber,
      } = req.body;

      const [grn] = await db
        .update(schema.goodsReceivedNotes)
        .set({
          quantityReceived,
          quantityRejected: quantityRejected || 0,
          inspectionStatus,
          inspectedBy: req.user!.id,
          inspectionNotes,
          deliveryNoteNumber,
          batchNumber,
          updatedAt: new Date(),
        })
        .where(eq(schema.goodsReceivedNotes.id, req.params.id))
        .returning();

      if (!grn) {
        return res.status(404).json({ error: "GRN not found" });
      }

      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_grn",
        entityType: "grn",
        entityId: grn.id,
      });

      res.json(grn);
    } catch (error: any) {
      console.error("Error updating GRN:", error);
      res.status(500).json({ error: error.message || "Failed to update GRN" });
    }
  });

  // ==================== SERIAL NUMBER ROUTES ====================
  app.post("/api/serial-numbers/bulk", authMiddleware, requireFeature('serialNumber_tracking'), async (req: AuthRequest, res: Response) => {
    try {
      const {
        serialNumbers,
        invoiceItemId,
        productId,
        vendorPoItemId,
        grnId,
      } = req.body;

      if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
        return res.status(400).json({ error: "Serial numbers array is required" });
      }

      // Check for duplicates in the system
      const existing = await db
        .select()
        .from(schema.serialNumbers)
        .where(sql`${schema.serialNumbers.serialNumber} = ANY(${serialNumbers})`);

      if (existing.length > 0) {
        return res.status(400).json({
          error: "Duplicate serial numbers found",
          duplicates: existing.map(s => s.serialNumber),
        });
      }

      // Create serial number records
      const records = serialNumbers.map((sn: string) => ({
        serialNumber: sn,
        productId: productId || null,
        vendorPoItemId: vendorPoItemId || null,
        grnId: grnId || null,
        invoiceItemId: invoiceItemId || null,
        status: invoiceItemId ? "reserved" : "in_stock",
        createdBy: req.user!.id,
      }));

      const created = await db
        .insert(schema.serialNumbers)
        .values(records)
        .returning();

      // Log activity
      await storage.createActivityLog({
        userId: req.user!.id,
        action: "bulk_import_serials",
        entityType: "serial_numbers",
        entityId: created[0].id,
      });

      res.json({ count: created.length, serialNumbers: created });
    } catch (error: any) {
      console.error("Error importing serial numbers:", error);
      res.status(500).json({ error: error.message || "Failed to import serial numbers" });
    }
  });

  app.get("/api/serial-numbers/:serialNumber", authMiddleware, requireFeature('serialNumber_tracking'), async (req: AuthRequest, res: Response) => {
    try {
      const [serial] = await db
        .select()
        .from(schema.serialNumbers)
        .where(eq(schema.serialNumbers.serialNumber, req.params.serialNumber));

      if (!serial) {
        return res.status(404).json({ error: "Serial number not found" });
      }

      // Fetch related data
      let product = null;
      if (serial.productId) {
        [product] = await db
          .select({ id: schema.products.id, name: schema.products.name, sku: schema.products.sku })
          .from(schema.products)
          .where(eq(schema.products.id, serial.productId));
      }

      let vendor = null;
      if (serial.vendorId) {
        [vendor] = await db
          .select({ id: schema.vendors.id, name: schema.vendors.name })
          .from(schema.vendors)
          .where(eq(schema.vendors.id, serial.vendorId));
      }

      let vendorPo = null;
      if (serial.vendorPoId) {
        [vendorPo] = await db
          .select({
            id: schema.vendorPurchaseOrders.id,
            poNumber: schema.vendorPurchaseOrders.poNumber,
            orderDate: schema.vendorPurchaseOrders.orderDate,
          })
          .from(schema.vendorPurchaseOrders)
          .where(eq(schema.vendorPurchaseOrders.id, serial.vendorPoId));
      }

      let grn = null;
      if (serial.grnId) {
        [grn] = await db
          .select({
            id: schema.goodsReceivedNotes.id,
            grnNumber: schema.goodsReceivedNotes.grnNumber,
            receivedDate: schema.goodsReceivedNotes.receivedDate,
            inspectionStatus: schema.goodsReceivedNotes.inspectionStatus,
          })
          .from(schema.goodsReceivedNotes)
          .where(eq(schema.goodsReceivedNotes.id, serial.grnId));
      }

      let invoice = null;
      if (serial.invoiceId) {
        [invoice] = await db
          .select({
            id: schema.invoices.id,
            invoiceNumber: schema.invoices.invoiceNumber,
            createdAt: schema.invoices.createdAt,
          })
          .from(schema.invoices)
          .where(eq(schema.invoices.id, serial.invoiceId));
      }

      res.json({
        ...serial,
        product,
        vendor,
        vendorPo,
        grn,
        invoice,
      });
    } catch (error) {
      console.error("Error fetching serial number:", error);
      res.status(500).json({ error: "Failed to fetch serial number" });
    }
  });

  // Analytics Routes
  app.get("/api/analytics/dashboard", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const quotes = await storage.getAllQuotes();
      const clients = await storage.getAllClients();
      const invoices = await storage.getAllInvoices();

      const totalQuotes = quotes.length;
      const totalClients = clients.length;

      const approvedQuotes = quotes.filter(q => q.status === "approved" || q.status === "invoiced");
      const totalRevenue = approvedQuotes.reduce((sum, q) => sum + Number(q.total), 0);

      const conversionRate = totalQuotes > 0
        ? ((approvedQuotes.length / totalQuotes) * 100).toFixed(1)
        : "0";

      const recentQuotes = await Promise.all(
        quotes.slice(0, 5).map(async (quote) => {
          const client = await storage.getClient(quote.clientId);
          return {
            id: quote.id,
            quoteNumber: quote.quoteNumber,
            clientName: client?.name || "Unknown",
            total: quote.total,
            status: quote.status,
            createdAt: quote.createdAt,
          };
        })
      );

      const quotesByStatus = quotes.reduce((acc: any[], quote) => {
        const existing = acc.find(item => item.status === quote.status);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ status: quote.status, count: 1 });
        }
        return acc;
      }, []);

      // Monthly revenue (simplified - last 6 months)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const monthQuotes = approvedQuotes.filter(q => {
          const qDate = new Date(q.createdAt);
          return qDate.getMonth() === date.getMonth() && qDate.getFullYear() === date.getFullYear();
        });
        const revenue = monthQuotes.reduce((sum, q) => sum + Number(q.total), 0);
        monthlyRevenue.push({ month, revenue });
      }

      return res.json({
        totalQuotes,
        totalClients,
        totalRevenue: totalRevenue.toFixed(2),
        conversionRate,
        recentQuotes,
        quotesByStatus,
        monthlyRevenue,
      });
    } catch (error) {
      console.error("Analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/:timeRange(\\d+)", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const timeRange = req.params.timeRange ? Number(req.params.timeRange) : 12;
      
      const quotes = await storage.getAllQuotes();
      const clients = await storage.getAllClients();

      // Filter by time range
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - timeRange);
      const filteredQuotes = quotes.filter(q => new Date(q.createdAt) >= cutoffDate);

      const approvedQuotes = filteredQuotes.filter(q => q.status === "approved" || q.status === "invoiced");
      const totalRevenue = approvedQuotes.reduce((sum, q) => sum + Number(q.total), 0);
      const avgQuoteValue = filteredQuotes.length > 0
        ? (filteredQuotes.reduce((sum, q) => sum + Number(q.total), 0) / filteredQuotes.length).toFixed(2)
        : "0";

      const conversionRate = filteredQuotes.length > 0
        ? ((approvedQuotes.length / filteredQuotes.length) * 100).toFixed(1)
        : "0";

      // Monthly data
      const monthlyData = [];
      for (let i = timeRange - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        
        const monthQuotes = filteredQuotes.filter(q => {
          const qDate = new Date(q.createdAt);
          return qDate.getMonth() === date.getMonth() && qDate.getFullYear() === date.getFullYear();
        });
        
        const monthApproved = monthQuotes.filter(q => q.status === "approved" || q.status === "invoiced");
        const revenue = monthApproved.reduce((sum, q) => sum + Number(q.total), 0);
        
        monthlyData.push({
          month,
          quotes: monthQuotes.length,
          revenue,
          conversions: monthApproved.length,
        });
      }

      // Top clients
      const clientRevenue = new Map<string, { name: string; totalRevenue: number; quoteCount: number }>();
      
      for (const quote of approvedQuotes) {
        const client = await storage.getClient(quote.clientId);
        if (!client) continue;
        
        const existing = clientRevenue.get(client.id);
        if (existing) {
          existing.totalRevenue += Number(quote.total);
          existing.quoteCount += 1;
        } else {
          clientRevenue.set(client.id, {
            name: client.name,
            totalRevenue: Number(quote.total),
            quoteCount: 1,
          });
        }
      }

      const topClients = Array.from(clientRevenue.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10)
        .map(c => ({
          name: c.name,
          totalRevenue: c.totalRevenue.toFixed(2),
          quoteCount: c.quoteCount,
        }));

      // Status breakdown
      const statusBreakdown = filteredQuotes.reduce((acc: any[], quote) => {
        const existing = acc.find(item => item.status === quote.status);
        const value = Number(quote.total);
        if (existing) {
          existing.count += 1;
          existing.value += value;
        } else {
          acc.push({ status: quote.status, count: 1, value });
        }
        return acc;
      }, []);

      return res.json({
        overview: {
          totalQuotes: filteredQuotes.length,
          totalRevenue: totalRevenue.toFixed(2),
          avgQuoteValue,
          conversionRate,
        },
        monthlyData,
        topClients,
        statusBreakdown,
      });
    } catch (error) {
      console.error("Analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // PHASE 3 - ADVANCED ANALYTICS ENDPOINTS
  app.get("/api/analytics/forecast", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const monthsAhead = req.query.months ? Number(req.query.months) : 3;
      const forecast = await analyticsService.getRevenueForecast(monthsAhead);
      return res.json(forecast);
    } catch (error) {
      console.error("Forecast error:", error);
      return res.status(500).json({ error: "Failed to fetch forecast" });
    }
  });

  app.get("/api/analytics/deal-distribution", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const distribution = await analyticsService.getDealDistribution();
      return res.json(distribution);
    } catch (error) {
      console.error("Deal distribution error:", error);
      return res.status(500).json({ error: "Failed to fetch deal distribution" });
    }
  });

  app.get("/api/analytics/regional", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const regionalData = await analyticsService.getRegionalDistribution();
      return res.json(regionalData);
    } catch (error) {
      console.error("Regional data error:", error);
      return res.status(500).json({ error: "Failed to fetch regional data" });
    }
  });

  app.post("/api/analytics/custom-report", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { startDate, endDate, status, minAmount, maxAmount } = req.body;
      const report = await analyticsService.getCustomReport({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        minAmount,
        maxAmount,
      });
      return res.json(report);
    } catch (error) {
      console.error("Custom report error:", error);
      return res.status(500).json({ error: "Failed to generate custom report" });
    }
  });

  app.get("/api/analytics/pipeline", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const pipeline = await analyticsService.getSalesPipeline();
      return res.json(pipeline);
    } catch (error) {
      console.error("Pipeline error:", error);
      return res.status(500).json({ error: "Failed to fetch pipeline data" });
    }
  });

  app.get("/api/analytics/client/:clientId/ltv", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const ltv = await analyticsService.getClientLifetimeValue(req.params.clientId);
      return res.json(ltv);
    } catch (error) {
      console.error("LTV error:", error);
      return res.status(500).json({ error: "Failed to fetch client LTV" });
    }
  });

  app.get("/api/analytics/competitor-insights", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const insights = await analyticsService.getCompetitorInsights();
      return res.json(insights);
    } catch (error) {
      console.error("Competitor insights error:", error);
      return res.status(500).json({ error: "Failed to fetch competitor insights" });
    }
  });

  // VENDOR ANALYTICS ENDPOINTS
  app.get("/api/analytics/vendor-spend", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const timeRange = req.query.timeRange ? Number(req.query.timeRange) : 12;
      const vendors = await storage.getAllVendors();
      const vendorPos = await storage.getAllVendorPos();

      // Filter by time range
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - timeRange);
      const filteredPos = vendorPos.filter(po => new Date(po.createdAt) >= cutoffDate);

      // Calculate vendor spend
      const vendorSpend = new Map();
      for (const po of filteredPos) {
        const vendor = vendors.find(v => v.id === po.vendorId);
        if (vendor) {
          const existing = vendorSpend.get(po.vendorId);
          const poTotal = Number(po.total);
          if (existing) {
            existing.totalSpend += poTotal;
            existing.poCount += 1;
          } else {
            vendorSpend.set(po.vendorId, {
              vendorId: po.vendorId,
              vendorName: vendor.name,
              totalSpend: poTotal,
              poCount: 1,
              status: po.status,
            });
          }
        }
      }

      // Top vendors by spend
      const topVendors = Array.from(vendorSpend.values())
        .sort((a, b) => b.totalSpend - a.totalSpend)
        .slice(0, 10)
        .map(v => ({
          vendorId: v.vendorId,
          vendorName: v.vendorName,
          totalSpend: v.totalSpend.toFixed(2),
          poCount: v.poCount,
          avgPoValue: (v.totalSpend / v.poCount).toFixed(2),
        }));

      // Total procurement spend
      const totalSpend = filteredPos.reduce((sum, po) => sum + Number(po.total), 0);

      // Procurement delays (POs not fulfilled on time)
      const delayedPos = filteredPos.filter(po => {
        if (po.status === "fulfilled" && po.expectedDeliveryDate && po.actualDeliveryDate) {
          return new Date(po.actualDeliveryDate) > new Date(po.expectedDeliveryDate);
        }
        if (po.status !== "fulfilled" && po.expectedDeliveryDate) {
          return new Date() > new Date(po.expectedDeliveryDate);
        }
        return false;
      });

      // Vendor performance metrics
      const vendorPerformance = Array.from(vendorSpend.values()).map(v => {
        const vendorPOs = filteredPos.filter(po => po.vendorId === v.vendorId);
        const onTimePOs = vendorPOs.filter(po => {
          if (po.status === "fulfilled" && po.expectedDeliveryDate && po.actualDeliveryDate) {
            return new Date(po.actualDeliveryDate) <= new Date(po.expectedDeliveryDate);
          }
          return false;
        });

        const fulfilledCount = vendorPOs.filter(po => po.status === "fulfilled").length;
        const onTimeRate = fulfilledCount > 0 ? ((onTimePOs.length / fulfilledCount) * 100).toFixed(1) : "0";

        return {
          vendorName: v.vendorName,
          totalPOs: vendorPOs.length,
          fulfilledPOs: fulfilledCount,
          onTimeDeliveryRate: onTimeRate + "%",
          totalSpend: v.totalSpend.toFixed(2),
        };
      }).sort((a, b) => Number(b.totalSpend) - Number(a.totalSpend));

      return res.json({
        overview: {
          totalSpend: totalSpend.toFixed(2),
          totalPOs: filteredPos.length,
          activeVendors: vendorSpend.size,
          delayedPOs: delayedPos.length,
          avgPoValue: filteredPos.length > 0 ? (totalSpend / filteredPos.length).toFixed(2) : "0",
        },
        topVendors,
        vendorPerformance,
        procurementDelays: {
          count: delayedPos.length,
          percentage: filteredPos.length > 0 ? ((delayedPos.length / filteredPos.length) * 100).toFixed(1) : "0",
        },
      });
    } catch (error) {
      console.error("Vendor analytics error:", error);
      return res.status(500).json({ error: "Failed to fetch vendor analytics" });
    }
  });

  // PHASE 3 - CLIENT MANAGEMENT ENDPOINTS (Tags & Communications)
  app.get("/api/clients/:clientId/tags", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const tags = await storage.getClientTags(req.params.clientId);
      return res.json(tags);
    } catch (error) {
      console.error("Get tags error:", error);
      return res.status(500).json({ error: "Failed to fetch client tags" });
    }
  });

  app.post("/api/clients/:clientId/tags", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { tag } = req.body;
      if (!tag) {
        return res.status(400).json({ error: "Tag is required" });
      }

      const clientTag = await storage.addClientTag({
        clientId: req.params.clientId,
        tag,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "add_client_tag",
        entityType: "client",
        entityId: req.params.clientId,
      });

      return res.json(clientTag);
    } catch (error) {
      console.error("Add tag error:", error);
      return res.status(500).json({ error: "Failed to add tag" });
    }
  });

  app.delete("/api/clients/tags/:tagId", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.removeClientTag(req.params.tagId);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "remove_client_tag",
        entityType: "client_tag",
        entityId: req.params.tagId,
      });

      return res.json({ success: true });
    } catch (error) {
      console.error("Remove tag error:", error);
      return res.status(500).json({ error: "Failed to remove tag" });
    }
  });

  app.get("/api/clients/:clientId/communications", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const communications = await storage.getClientCommunications(req.params.clientId);
      return res.json(communications);
    } catch (error) {
      console.error("Get communications error:", error);
      return res.status(500).json({ error: "Failed to fetch communications" });
    }
  });

  app.post("/api/clients/:clientId/communications", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { type, subject, message, attachments } = req.body;

      if (!type || !["email", "call", "meeting", "note"].includes(type)) {
        return res.status(400).json({ error: "Valid communication type is required" });
      }

      const communication = await storage.createClientCommunication({
        clientId: req.params.clientId,
        type,
        subject,
        message,
        date: new Date(),
        communicatedBy: req.user!.id,
        attachments: attachments ? JSON.stringify(attachments) : undefined,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_communication",
        entityType: "client",
        entityId: req.params.clientId,
      });

      return res.json(communication);
    } catch (error: any) {
      console.error("Create communication error:", error);
      return res.status(500).json({ error: error.message || "Failed to create communication" });
    }
  });

  app.delete("/api/clients/communications/:commId", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await storage.deleteClientCommunication(req.params.commId);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_communication",
        entityType: "client_communication",
        entityId: req.params.commId,
      });

      return res.json({ success: true });
    } catch (error) {
      console.error("Delete communication error:", error);
      return res.status(500).json({ error: "Failed to delete communication" });
    }
  });


  // PHASE 3 - PRICING TIERS ENDPOINTS
  app.get("/api/pricing-tiers", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const tiers = await storage.getAllPricingTiers();
      return res.json(tiers);
    } catch (error) {
      console.error("Get pricing tiers error:", error);
      return res.status(500).json({ error: "Failed to fetch pricing tiers" });
    }
  });

  app.post("/api/pricing-tiers", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { name, minAmount, maxAmount, discountPercent, description, isActive } = req.body;

      if (!name || minAmount === undefined || discountPercent === undefined) {
        return res.status(400).json({ error: "Name, minAmount, and discountPercent are required" });
      }

      const tier = await storage.createPricingTier({
        name,
        minAmount,
        maxAmount,
        discountPercent,
        description,
        isActive: isActive !== false,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_pricing_tier",
        entityType: "pricing_tier",
        entityId: tier.id,
      });

      return res.json(tier);
    } catch (error: any) {
      console.error("Create pricing tier error:", error);
      return res.status(500).json({ error: error.message || "Failed to create pricing tier" });
    }
  });

  app.patch("/api/pricing-tiers/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updated = await storage.updatePricingTier(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Pricing tier not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_pricing_tier",
        entityType: "pricing_tier",
        entityId: req.params.id,
      });

      return res.json(updated);
    } catch (error: any) {
      console.error("Update pricing tier error:", error);
      return res.status(500).json({ error: error.message || "Failed to update pricing tier" });
    }
  });

  app.delete("/api/pricing-tiers/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deletePricingTier(req.params.id);

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_pricing_tier",
        entityType: "pricing_tier",
        entityId: req.params.id,
      });

      return res.json({ success: true });
    } catch (error) {
      console.error("Delete pricing tier error:", error);
      return res.status(500).json({ error: "Failed to delete pricing tier" });
    }
  });

  // PHASE 3 - PRICING CALCULATION ENDPOINTS
  app.post("/api/pricing/calculate-discount", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { subtotal } = req.body;

      if (!subtotal || subtotal <= 0) {
        return res.status(400).json({ error: "Valid subtotal is required" });
      }

      const result = await pricingService.calculateDiscount(subtotal);
      return res.json(result);
    } catch (error: any) {
      console.error("Calculate discount error:", error);
      return res.status(500).json({ error: error.message || "Failed to calculate discount" });
    }
  });

  app.post("/api/pricing/calculate-taxes", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { amount, region, useIGST } = req.body;

      if (!amount || !region) {
        return res.status(400).json({ error: "Amount and region are required" });
      }

      const taxes = await pricingService.calculateTaxes(amount, region, useIGST);
      return res.json(taxes);
    } catch (error: any) {
      console.error("Calculate taxes error:", error);
      return res.status(500).json({ error: error.message || "Failed to calculate taxes" });
    }
  });

  app.post("/api/pricing/calculate-total", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { subtotal, region, useIGST, shippingCharges, customDiscount } = req.body;

      if (!subtotal || !region) {
        return res.status(400).json({ error: "Subtotal and region are required" });
      }

      const total = await pricingService.calculateQuoteTotal({
        subtotal,
        region,
        useIGST,
        shippingCharges,
        customDiscount,
      });

      return res.json(total);
    } catch (error: any) {
      console.error("Calculate total error:", error);
      return res.status(500).json({ error: error.message || "Failed to calculate total" });
    }
  });

  app.post("/api/pricing/convert-currency", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;

      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({ error: "Amount, fromCurrency, and toCurrency are required" });
      }

      const converted = await pricingService.convertCurrency(amount, fromCurrency, toCurrency);
      return res.json({ original: amount, converted, fromCurrency, toCurrency });
    } catch (error: any) {
      console.error("Convert currency error:", error);
      return res.status(500).json({ error: error.message || "Failed to convert currency" });
    }
  });

  // PHASE 3 - CURRENCY SETTINGS ENDPOINTS
  app.get("/api/currency-settings", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const settings = await storage.getCurrencySettings();
      if (!settings) {
        return res.json({ baseCurrency: "INR", supportedCurrencies: "[]", exchangeRates: "{}" });
      }
      return res.json(settings);
    } catch (error) {
      console.error("Get currency settings error:", error);
      return res.status(500).json({ error: "Failed to fetch currency settings" });
    }
  });

  app.post("/api/currency-settings", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { baseCurrency, supportedCurrencies, exchangeRates } = req.body;

      const settings = await storage.upsertCurrencySettings({
        baseCurrency: baseCurrency || "INR",
        supportedCurrencies: typeof supportedCurrencies === "string" ? supportedCurrencies : JSON.stringify(supportedCurrencies),
        exchangeRates: typeof exchangeRates === "string" ? exchangeRates : JSON.stringify(exchangeRates),
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_currency_settings",
        entityType: "settings",
      });

      return res.json(settings);
    } catch (error: any) {
      console.error("Update currency settings error:", error);
      return res.status(500).json({ error: error.message || "Failed to update currency settings" });
    }
  });

  // Settings Routes
  // Enhanced Admin Settings
  app.get("/api/admin/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const settings = await storage.getAllSettings();
      const settingsMap: Record<string, string> = {};
      settings.forEach(s => {
        settingsMap[s.key] = s.value;
      });

      // Organize settings by category
      const categories = {
        company: {
          companyName: settingsMap["companyName"] || "",
          companyEmail: settingsMap["companyEmail"] || "",
          companyPhone: settingsMap["companyPhone"] || "",
          companyWebsite: settingsMap["companyWebsite"] || "",
          companyAddress: settingsMap["companyAddress"] || "",
          companyLogo: settingsMap["companyLogo"] || "",
        },
        taxation: {
          gstin: settingsMap["gstin"] || "",
          taxType: settingsMap["taxType"] || "GST", // GST, VAT, etc.
          defaultTaxRate: settingsMap["defaultTaxRate"] || "18",
          enableIGST: settingsMap["enableIGST"] === "true",
          enableCGST: settingsMap["enableCGST"] === "true",
          enableSGST: settingsMap["enableSGST"] === "true",
        },
        documents: {
          quotePrefix: settingsMap["quotePrefix"] || "QT",
          invoicePrefix: settingsMap["invoicePrefix"] || "INV",
          nextQuoteNumber: settingsMap["nextQuoteNumber"] || "1001",
          nextInvoiceNumber: settingsMap["nextInvoiceNumber"] || "1001",
        },
        email: {
          smtpHost: settingsMap["smtpHost"] || "",
          smtpPort: settingsMap["smtpPort"] || "",
          smtpEmail: settingsMap["smtpEmail"] || "",
          emailTemplateQuote: settingsMap["emailTemplateQuote"] || "",
          emailTemplateInvoice: settingsMap["emailTemplateInvoice"] || "",
          emailTemplatePaymentReminder: settingsMap["emailTemplatePaymentReminder"] || "",
        },
        general: {
          quotaValidityDays: settingsMap["quotaValidityDays"] || "30",
          invoiceDueDays: settingsMap["invoiceDueDays"] || "30",
          enableAutoReminders: settingsMap["enableAutoReminders"] === "true",
          reminderDaysBeforeDue: settingsMap["reminderDaysBeforeDue"] || "3",
        },
      };

      return res.json(categories);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch admin settings" });
    }
  });

  app.post("/api/admin/settings/company", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const companySettings = req.body;
      for (const [key, value] of Object.entries(companySettings)) {
        await storage.upsertSetting({
          key,
          value: String(value),
          updatedBy: req.user!.id,
        });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_company_settings",
        entityType: "settings",
      });

      return res.json({ success: true, message: "Company settings updated" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update company settings" });
    }
  });

  app.post("/api/admin/settings/taxation", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const taxSettings = req.body;
      for (const [key, value] of Object.entries(taxSettings)) {
        await storage.upsertSetting({
          key,
          value: String(value),
          updatedBy: req.user!.id,
        });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_tax_settings",
        entityType: "settings",
      });

      return res.json({ success: true, message: "Tax settings updated" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update tax settings" });
    }
  });

  app.post("/api/admin/settings/email", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const emailSettings = req.body;
      for (const [key, value] of Object.entries(emailSettings)) {
        await storage.upsertSetting({
          key,
          value: String(value),
          updatedBy: req.user!.id,
        });
      }

      // Reinitialize email service with new SMTP settings
      if (emailSettings.smtpHost) {
        EmailService.initialize({
          host: emailSettings.smtpHost,
          port: Number(emailSettings.smtpPort),
          secure: emailSettings.smtpSecure === "true",
          auth: {
            user: emailSettings.smtpEmail,
            pass: process.env.SMTP_PASSWORD || "",
          },
          from: emailSettings.smtpEmail || "noreply@quoteprogen.com",
        });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_email_settings",
        entityType: "settings",
      });

      return res.json({ success: true, message: "Email settings updated" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update email settings" });
    }
  });

  // User Management (Admin Panel)
  app.get("/api/admin/users", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const users = await storage.getAllUsers();
      const sanitized = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
      }));

      return res.json(sanitized);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:userId/role", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { role } = req.body;
      if (!["admin", "manager", "user", "viewer"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const updated = await storage.updateUser(req.params.userId, { role });
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "change_user_role",
        entityType: "user",
        entityId: req.params.userId,
      });

      return res.json({ success: true, message: `User role changed to ${role}` });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update user role" });
    }
  });

  app.patch("/api/admin/users/:userId/status", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { status } = req.body;
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updated = await storage.updateUser(req.params.userId, { status });
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "change_user_status",
        entityType: "user",
        entityId: req.params.userId,
      });

      return res.json({ success: true, message: `User status changed to ${status}` });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update user status" });
    }
  });

  app.get("/api/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      const settingsMap: Record<string, string> = {};
      settings.forEach(s => {
        settingsMap[s.key] = s.value;
      });
      return res.json(settingsMap);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const settingsData = req.body;

      for (const [key, value] of Object.entries(settingsData)) {
        await storage.upsertSetting({
          key,
          value: String(value),
          updatedBy: req.user!.id,
        });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_settings",
        entityType: "settings",
      });

      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update settings" });
    }
  });

  // PDF Theme Routes
  app.get("/api/themes", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { getAllThemes } = await import("./services/pdf-themes");
      const themes = getAllThemes();
      return res.json(themes);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to get themes" });
    }
  });

  app.get("/api/themes/segment/:segment", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { getSuggestedTheme } = await import("./services/pdf-themes");
      const theme = getSuggestedTheme(req.params.segment);
      return res.json(theme);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to get suggested theme" });
    }
  });

  app.patch("/api/clients/:id/theme", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { preferredTheme, segment } = req.body;

      const updateData: any = {};
      if (preferredTheme !== undefined) updateData.preferredTheme = preferredTheme;
      if (segment !== undefined) updateData.segment = segment;

      const client = await storage.updateClient(req.params.id, updateData);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "update_client_theme",
        entityType: "client",
        entityId: req.params.id,
      });

      return res.json(client);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update client theme" });
    }
  });

  // Governance & Activity Log Routes (Admin only)
  app.get("/api/governance/stats", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      // Get total and active users
      const allUsers = await storage.getAllUsers();
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter((u: any) => u.status === "active").length;

      // Get activity logs count
      const activityLogs = await db.select().from(schema.activityLogs);
      const totalActivities = activityLogs.length;
      const criticalActivities = activityLogs.filter(log =>
        log.action.includes("delete") ||
        log.action.includes("approve") ||
        log.action.includes("lock") ||
        log.action.includes("finalize")
      ).length;

      // Count unauthorized attempts (from activity logs)
      const unauthorizedAttempts = activityLogs.filter(log =>
        log.action.includes("unauthorized")
      ).length;

      // Recent approvals (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentApprovals = activityLogs.filter(log =>
        log.action.includes("approve") &&
        log.timestamp &&
        new Date(log.timestamp) > thirtyDaysAgo
      ).length;

      return res.json({
        totalUsers,
        activeUsers,
        totalActivities,
        criticalActivities,
        unauthorizedAttempts,
        recentApprovals,
      });
    } catch (error: any) {
      console.error("Error fetching governance stats:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch governance stats" });
    }
  });

  app.get("/api/activity-logs/recent", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      // Get recent activity logs (last 100)
      const logs = await db
        .select()
        .from(schema.activityLogs)
        .orderBy(desc(schema.activityLogs.timestamp))
        .limit(100);

      // Enrich with user information
      const enrichedLogs = await Promise.all(
        logs.map(async (log) => {
          const user = log.userId ? await storage.getUser(log.userId) : null;
          return {
            ...log,
            userName: user?.name || "Unknown User",
            userEmail: user?.email || "unknown@example.com",
          };
        })
      );

      return res.json(enrichedLogs);
    } catch (error: any) {
      console.error("Error fetching activity logs:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch activity logs" });
    }
  });

  // ==================== TAX RATES & PAYMENT TERMS ROUTES ====================

  // Get all tax rates
  app.get("/api/tax-rates", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const rates = await db.select().from(schema.taxRates).where(eq(schema.taxRates.isActive, true));
      // Transform to simpler format for frontend
      const simplifiedRates = rates.map(rate => ({
        id: rate.id,
        name: `${rate.taxType} ${rate.region}`,
        percentage: parseFloat(rate.igstRate), // Use IGST as the main rate
        sgstRate: parseFloat(rate.sgstRate),
        cgstRate: parseFloat(rate.cgstRate),
        igstRate: parseFloat(rate.igstRate),
        region: rate.region,
        taxType: rate.taxType,
        isActive: rate.isActive,
        effectiveFrom: rate.effectiveFrom,
        effectiveTo: rate.effectiveTo,
      }));
      return res.json(simplifiedRates);
    } catch (error: any) {
      console.error("Error fetching tax rates:", error);
      return res.status(500).json({ error: "Failed to fetch tax rates" });
    }
  });

  // Create tax rate
  app.post("/api/tax-rates", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!["admin", "finance_accounts"].includes(req.user!.role)) {
        return res.status(403).json({ error: "Forbidden: Only admin and finance can manage tax rates" });
      }

      const { region, taxType, sgstRate, cgstRate, igstRate, description } = req.body;

      if (!region || !taxType) {
        return res.status(400).json({ error: "Region and taxType are required" });
      }

      // Use the rates provided by the client, default to 0 if not provided
      const sgst = sgstRate !== undefined && sgstRate !== null ? String(sgstRate) : "0";
      const cgst = cgstRate !== undefined && cgstRate !== null ? String(cgstRate) : "0";
      const igst = igstRate !== undefined && igstRate !== null ? String(igstRate) : "0";

      const newRate = await db.insert(schema.taxRates).values({
        region,
        taxType,
        sgstRate: sgst,
        cgstRate: cgst,
        igstRate: igst,
      }).returning();

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_tax_rate",
        entityType: "tax_rate",
        entityId: newRate[0].id,
      });

      return res.json({
        id: newRate[0].id,
        region,
        taxType,
        sgstRate: parseFloat(sgst),
        cgstRate: parseFloat(cgst),
        igstRate: parseFloat(igst),
      });
    } catch (error: any) {
      console.error("Error creating tax rate:", error);
      return res.status(500).json({ error: error.message || "Failed to create tax rate" });
    }
  });

  // Delete tax rate
  app.delete("/api/tax-rates/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!["admin", "finance_accounts"].includes(req.user!.role)) {
        return res.status(403).json({ error: "Forbidden: Only admin and finance can manage tax rates" });
      }

      await db.delete(schema.taxRates).where(eq(schema.taxRates.id, req.params.id));

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_tax_rate",
        entityType: "tax_rate",
        entityId: req.params.id,
      });

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting tax rate:", error);
      return res.status(500).json({ error: error.message || "Failed to delete tax rate" });
    }
  });

  // Get all payment terms
  app.get("/api/payment-terms", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const terms = await db.select().from(schema.paymentTerms).where(eq(schema.paymentTerms.isActive, true));
      return res.json(terms);
    } catch (error: any) {
      console.error("Error fetching payment terms:", error);
      return res.status(500).json({ error: "Failed to fetch payment terms" });
    }
  });

  // Create payment term
  app.post("/api/payment-terms", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!["admin", "finance_accounts"].includes(req.user!.role)) {
        return res.status(403).json({ error: "Forbidden: Only admin and finance can manage payment terms" });
      }

      const { name, days, description, isDefault } = req.body;

      if (!name || days === undefined) {
        return res.status(400).json({ error: "Name and days are required" });
      }

      // If this is set as default, remove default from others
      if (isDefault) {
        await db.update(schema.paymentTerms).set({ isDefault: false }).where(eq(schema.paymentTerms.isDefault, true));
      }

      const newTerm = await db.insert(schema.paymentTerms).values({
        name,
        days,
        description: description || null,
        isDefault: isDefault || false,
        createdBy: req.user!.id,
      }).returning();

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "create_payment_term",
        entityType: "payment_term",
        entityId: newTerm[0].id,
      });

      return res.json(newTerm[0]);
    } catch (error: any) {
      console.error("Error creating payment term:", error);
      return res.status(500).json({ error: error.message || "Failed to create payment term" });
    }
  });

  // Delete payment term
  app.delete("/api/payment-terms/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!["admin", "finance_accounts"].includes(req.user!.role)) {
        return res.status(403).json({ error: "Forbidden: Only admin and finance can manage payment terms" });
      }

      await db.delete(schema.paymentTerms).where(eq(schema.paymentTerms.id, req.params.id));

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "delete_payment_term",
        entityType: "payment_term",
        entityId: req.params.id,
      });

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting payment term:", error);
      return res.status(500).json({ error: error.message || "Failed to delete payment term" });
    }
  });

  // ==================== DEBUG ENDPOINTS ====================
  // These are public endpoints for debugging numbering system
  // Admin should protect these endpoints at reverse proxy level if needed

  app.get("/api/debug/counters", async (req: Request, res: Response) => {
    try {
      const year = new Date().getFullYear();
      const types = ["quote", "master_invoice", "child_invoice", "vendor_po", "grn"];
      const counters: Record<string, any> = {};

      for (const type of types) {
        const counterKey = `${type}_counter_${year}`;
        const setting = await storage.getSetting(counterKey);
        const currentValue = setting?.value || "0";
        const nextValue = parseInt(String(currentValue), 10) + 1;
        counters[counterKey] = {
          current: currentValue,
          next: String(nextValue).padStart(4, "0"),
          exists: !!setting,
        };
      }

      return res.json({
        year,
        counters,
        message: "Next value shows what will be generated next"
      });
    } catch (error: any) {
      console.error("Error fetching counters:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch counters" });
    }
  });

  app.post("/api/debug/reset-counter/:type", async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const year = new Date().getFullYear();

      console.log(`[DEBUG] Resetting counter for ${type} in year ${year}`);

      await NumberingService.resetCounter(type, year);

      return res.json({
        success: true,
        message: `Counter ${type}_counter_${year} has been reset to 0`,
        nextNumber: "0001"
      });
    } catch (error: any) {
      console.error("Error resetting counter:", error);
      return res.status(500).json({ error: error.message || "Failed to reset counter" });
    }
  });

  app.post("/api/debug/set-counter/:type/:value", async (req: Request, res: Response) => {
    try {
      const { type, value } = req.params;
      const year = new Date().getFullYear();
      const numValue = parseInt(value, 10);

      if (isNaN(numValue) || numValue < 0) {
        return res.status(400).json({ error: "Value must be a non-negative integer" });
      }

      console.log(`[DEBUG] Setting ${type}_counter_${year} to ${numValue}`);

      await NumberingService.setCounter(type, year, numValue);

      const nextValue = numValue + 1;
      return res.json({
        success: true,
        message: `Counter ${type}_counter_${year} set to ${numValue}`,
        nextNumber: String(nextValue).padStart(4, "0")
      });
    } catch (error: any) {
      console.error("Error setting counter:", error);
      return res.status(500).json({ error: error.message || "Failed to set counter" });
    }
  });

  // ...existing code...

  // Settings API Routes
  app.get("/api/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const allSettings = await storage.getAllSettings();

      // Convert array of settings to object for easier access in frontend
      const settingsObj: Record<string, any> = {};
      for (const setting of allSettings) {
        settingsObj[setting.key] = setting.value;
      }

      res.json(settingsObj);
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: error.message || "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { key, value } = req.body;

      if (!key) {
        return res.status(400).json({ error: "Setting key is required" });
      }

      // Upsert the setting (update if exists, create if doesn't)
      const setting = await storage.upsertSetting({
        key,
        value: value !== undefined ? String(value) : "",
      });

      res.json(setting);
    } catch (error: any) {
      console.error("Error saving setting:", error);
      res.status(500).json({ error: error.message || "Failed to save setting" });
    }
  });

  // Analytics & Dashboard Routes
  app.use("/api", authMiddleware, analyticsRoutes);
  app.use("/api", authMiddleware, quoteWorkflowRoutes);

  const httpServer = createServer(app);
  return httpServer;
}

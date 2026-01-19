import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users, collaborationSessions } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { getJWTSecret } from "../middleware";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
  userRole?: string;
}

interface UserConnection {
  socketId: string;
  userId: string;
  userName: string;
  userRole: string;
  connectedAt: Date;
}

/**
 * WebSocket Service for real-time communication
 * Handles:
 * - User authentication via JWT
 * - Room-based collaboration (for quote/invoice editing)
 * - Real-time notifications
 * - Presence tracking
 */
class WebSocketServiceClass {
  private io: Server | null = null;
  private userConnections: Map<string, UserConnection[]> = new Map(); // userId -> connections

  /**
   * Initialize WebSocket server with authentication middleware
   */
  initialize(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === "production" 
          ? process.env.CLIENT_URL 
          : ["http://localhost:3000", "http://localhost:5000", "http://127.0.0.1:5000"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
        
        if (!token) {
          return next(new Error("Authentication required"));
        }

        const decoded = jwt.verify(token, getJWTSecret()) as { id: string; email: string };
        
        // Verify user exists
        const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
        
        if (!user) {
          return next(new Error("User not found"));
        }

        socket.userId = user.id;
        socket.userName = user.name;
        socket.userRole = user.role;
        
        next();
      } catch (error) {
        console.error("WebSocket auth error:", error);
        next(new Error("Invalid token"));
      }
    });

    // Connection handler
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      console.log(`[WebSocket] User ${socket.userName} (${socket.userId}) connected - Socket: ${socket.id}`);
      
      // Track connection
      this.addConnection(socket);

      // Join user's personal room for targeted notifications
      if (socket.userId) {
        socket.join(`user:${socket.userId}`);
      }

      // Handle collaboration room join
      socket.on("join:collaboration", async (data: { entityType: string; entityId: string }) => {
        await this.handleJoinCollaboration(socket, data);
      });

      // Handle collaboration room leave
      socket.on("leave:collaboration", async (data: { entityType: string; entityId: string }) => {
        await this.handleLeaveCollaboration(socket, data);
      });

      // Handle cursor position updates
      socket.on("cursor:update", (data: { entityType: string; entityId: string; position: any }) => {
        this.handleCursorUpdate(socket, data);
      });

      // Handle editing state changes
      socket.on("editing:start", (data: { entityType: string; entityId: string; field: string }) => {
        this.handleEditingState(socket, data, true);
      });

      socket.on("editing:stop", (data: { entityType: string; entityId: string }) => {
        this.handleEditingState(socket, data, false);
      });

      // Handle document changes broadcast
      socket.on("document:change", (data: { entityType: string; entityId: string; changes: any }) => {
        this.handleDocumentChange(socket, data);
      });

      // Handle disconnect
      socket.on("disconnect", async (reason) => {
        console.log(`[WebSocket] User ${socket.userName} disconnected - Reason: ${reason}`);
        await this.handleDisconnect(socket);
      });

      // Send initial connection success event
      socket.emit("connected", {
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id,
      });
    });

    console.log("✓ WebSocket service initialized");
    return this.io;
  }

  /**
   * Track user connection
   */
  private addConnection(socket: AuthenticatedSocket): void {
    if (!socket.userId) return;

    const connection: UserConnection = {
      socketId: socket.id,
      userId: socket.userId,
      userName: socket.userName || "Unknown",
      userRole: socket.userRole || "viewer",
      connectedAt: new Date(),
    };

    const existing = this.userConnections.get(socket.userId) || [];
    existing.push(connection);
    this.userConnections.set(socket.userId, existing);
  }

  /**
   * Remove user connection on disconnect
   */
  private removeConnection(socket: AuthenticatedSocket): void {
    if (!socket.userId) return;

    const connections = this.userConnections.get(socket.userId) || [];
    const updated = connections.filter((c) => c.socketId !== socket.id);
    
    if (updated.length === 0) {
      this.userConnections.delete(socket.userId);
    } else {
      this.userConnections.set(socket.userId, updated);
    }
  }

  /**
   * Handle joining a collaboration room
   */
  private async handleJoinCollaboration(
    socket: AuthenticatedSocket,
    data: { entityType: string; entityId: string }
  ): Promise<void> {
    if (!socket.userId) return;

    const roomName = `collab:${data.entityType}:${data.entityId}`;
    socket.join(roomName);

    // Store session in database - delete existing first, then insert to avoid unique index issues
    try {
      // Remove any existing session for this user on this entity
      await db.delete(collaborationSessions).where(
        and(
          eq(collaborationSessions.entityType, data.entityType),
          eq(collaborationSessions.entityId, data.entityId),
          eq(collaborationSessions.userId, socket.userId)
        )
      );
      
      // Insert new session
      await db.insert(collaborationSessions).values({
        entityType: data.entityType,
        entityId: data.entityId,
        userId: socket.userId,
        socketId: socket.id,
        isEditing: false,
      });
    } catch (error) {
      console.error("[WebSocket] Failed to store collaboration session:", error);
    }

    // Notify others in the room
    socket.to(roomName).emit("collaborator:joined", {
      userId: socket.userId,
      userName: socket.userName,
      entityType: data.entityType,
      entityId: data.entityId,
    });

    // Send current collaborators to the joining user
    const collaborators = await this.getCollaborators(data.entityType, data.entityId);
    socket.emit("collaborators:list", {
      entityType: data.entityType,
      entityId: data.entityId,
      collaborators,
    });

    console.log(`[WebSocket] User ${socket.userName} joined room ${roomName}`);
  }

  /**
   * Handle leaving a collaboration room
   */
  private async handleLeaveCollaboration(
    socket: AuthenticatedSocket,
    data: { entityType: string; entityId: string }
  ): Promise<void> {
    if (!socket.userId) return;

    const roomName = `collab:${data.entityType}:${data.entityId}`;
    socket.leave(roomName);

    // Remove session from database
    try {
      await db.delete(collaborationSessions).where(
        and(
          eq(collaborationSessions.socketId, socket.id),
          eq(collaborationSessions.entityType, data.entityType),
          eq(collaborationSessions.entityId, data.entityId)
        )
      );
    } catch (error) {
      console.error("[WebSocket] Failed to remove collaboration session:", error);
    }

    // Notify others
    socket.to(roomName).emit("collaborator:left", {
      userId: socket.userId,
      userName: socket.userName,
      entityType: data.entityType,
      entityId: data.entityId,
    });

    console.log(`[WebSocket] User ${socket.userName} left room ${roomName}`);
  }

  /**
   * Handle cursor position updates
   */
  private handleCursorUpdate(
    socket: AuthenticatedSocket,
    data: { entityType: string; entityId: string; position: any }
  ): void {
    if (!socket.userId) return;

    const roomName = `collab:${data.entityType}:${data.entityId}`;
    socket.to(roomName).emit("cursor:moved", {
      userId: socket.userId,
      userName: socket.userName,
      position: data.position,
    });
  }

  /**
   * Handle editing state changes
   */
  private async handleEditingState(
    socket: AuthenticatedSocket,
    data: { entityType: string; entityId: string; field?: string },
    isEditing: boolean
  ): Promise<void> {
    if (!socket.userId) return;

    const roomName = `collab:${data.entityType}:${data.entityId}`;
    
    // Update database
    try {
      await db.update(collaborationSessions)
        .set({ 
          isEditing, 
          lastActivity: new Date(),
          cursorPosition: data.field ? { field: data.field } : null,
        })
        .where(eq(collaborationSessions.socketId, socket.id));
    } catch (error) {
      console.error("[WebSocket] Failed to update editing state:", error);
    }

    // Notify others
    socket.to(roomName).emit("editing:changed", {
      userId: socket.userId,
      userName: socket.userName,
      isEditing,
      field: data.field,
    });
  }

  /**
   * Handle document changes broadcast
   */
  private handleDocumentChange(
    socket: AuthenticatedSocket,
    data: { entityType: string; entityId: string; changes: any }
  ): void {
    if (!socket.userId) return;

    const roomName = `collab:${data.entityType}:${data.entityId}`;
    socket.to(roomName).emit("document:updated", {
      userId: socket.userId,
      userName: socket.userName,
      changes: data.changes,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle socket disconnect
   */
  private async handleDisconnect(socket: AuthenticatedSocket): Promise<void> {
    this.removeConnection(socket);

    // Clean up all collaboration sessions for this socket
    try {
      const sessions = await db.select()
        .from(collaborationSessions)
        .where(eq(collaborationSessions.socketId, socket.id));

      for (const session of sessions) {
        const roomName = `collab:${session.entityType}:${session.entityId}`;
        this.io?.to(roomName).emit("collaborator:left", {
          userId: socket.userId,
          userName: socket.userName,
          entityType: session.entityType,
          entityId: session.entityId,
        });
      }

      await db.delete(collaborationSessions).where(eq(collaborationSessions.socketId, socket.id));
    } catch (error) {
      console.error("[WebSocket] Failed to clean up sessions on disconnect:", error);
    }
  }

  /**
   * Get active collaborators for an entity
   */
  async getCollaborators(entityType: string, entityId: string): Promise<any[]> {
    try {
      const sessions = await db
        .select({
          userId: collaborationSessions.userId,
          socketId: collaborationSessions.socketId,
          isEditing: collaborationSessions.isEditing,
          cursorPosition: collaborationSessions.cursorPosition,
          joinedAt: collaborationSessions.joinedAt,
          userName: users.name,
        })
        .from(collaborationSessions)
        .innerJoin(users, eq(collaborationSessions.userId, users.id))
        .where(
          and(
            eq(collaborationSessions.entityType, entityType),
            eq(collaborationSessions.entityId, entityId)
          )
        );

      return sessions;
    } catch (error) {
      console.error("[WebSocket] Failed to get collaborators:", error);
      return [];
    }
  }

  /**
   * Send notification to specific user(s)
   */
  sendNotification(userId: string, notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    metadata?: any;
    createdAt: Date;
  }): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit("notification:new", notification);
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToMany(userIds: string[], notification: any): void {
    userIds.forEach((userId) => this.sendNotification(userId, notification));
  }

  /**
   * Broadcast to all connected users (e.g., system announcements)
   */
  broadcast(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  /**
   * Get connection count for a user
   */
  getUserConnectionCount(userId: string): number {
    return this.userConnections.get(userId)?.length || 0;
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId: string): boolean {
    return this.getUserConnectionCount(userId) > 0;
  }

  /**
   * Get the Socket.io server instance
   */
  getIO(): Server | null {
    return this.io;
  }
}

// Singleton instance
export const WebSocketService = new WebSocketServiceClass();

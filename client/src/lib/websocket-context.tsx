import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

interface Collaborator {
  userId: string;
  userName: string;
  isEditing: boolean;
  cursorPosition?: { field: string };
  joinedAt: Date;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
  // Collaboration
  collaborators: Collaborator[];
  joinCollaboration: (entityType: string, entityId: string) => void;
  leaveCollaboration: (entityType: string, entityId: string) => void;
  broadcastChange: (entityType: string, entityId: string, changes: any) => void;
  setEditingState: (entityType: string, entityId: string, isEditing: boolean, field?: string) => void;
  // Event subscription
  on: (event: string, handler: (...args: any[]) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const currentCollabRef = useRef<{ entityType: string; entityId: string } | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get the JWT token from cookies (same as API calls)
    const connectSocket = async () => {
      try {
        // Fetch a token for WebSocket authentication
        const response = await fetch("/api/auth/ws-token", { credentials: "include" });
        if (!response.ok) {
          console.warn("Could not get WebSocket token");
          return;
        }
        const { token } = await response.json();

        const socketInstance = io(window.location.origin, {
          auth: { token },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
        });

        socketInstance.on("connect", () => {
          console.log("[WebSocket] Connected:", socketInstance.id);
          setIsConnected(true);
          
          // Re-join collaboration room if we were in one before reconnecting
          if (currentCollabRef.current) {
            console.log("[WebSocket] Re-joining collaboration room after reconnect");
            socketInstance.emit("join:collaboration", currentCollabRef.current);
          }
        });

        socketInstance.on("disconnect", (reason) => {
          console.log("[WebSocket] Disconnected:", reason);
          setIsConnected(false);
        });

        socketInstance.on("connect_error", async (error) => {
          console.error("[WebSocket] Connection error:", error.message);
          
          // If token expired, fetch a new one and retry
          if (error.message.includes("jwt expired") || error.message.includes("Invalid token") || error.message.includes("Authentication required")) {
            console.log("[WebSocket] Token expired, refreshing...");
            try {
              const response = await fetch("/api/auth/ws-token", { credentials: "include" });
              if (response.ok) {
                const { token } = await response.json();
                socketInstance.auth = { token };
                // Determine if we should manually reconnect or let the manager handle it
                // Updating auth payload is enough for the next attempt
              }
            } catch (err) {
              console.error("[WebSocket] Failed to refresh token:", err);
            }
          }
        });

        // Handle incoming notifications
        socketInstance.on("notification:new", (notification: Notification) => {
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });

        // Handle collaboration events
        socketInstance.on("collaborator:joined", (data: { userId: string; userName: string }) => {
          console.log("[WebSocket] Collaborator joined:", data);
          setCollaborators((prev) => {
            if (prev.find((c) => c.userId === data.userId)) return prev;
            return [...prev, { ...data, isEditing: false, joinedAt: new Date() }];
          });
        });

        socketInstance.on("collaborator:left", (data: { userId: string }) => {
          console.log("[WebSocket] Collaborator left:", data);
          setCollaborators((prev) => prev.filter((c) => c.userId !== data.userId));
        });

        socketInstance.on("collaborators:list", (data: { collaborators: Collaborator[] }) => {
          console.log("[WebSocket] Received collaborators list:", data.collaborators);
          setCollaborators(data.collaborators);
        });

        socketInstance.on("editing:changed", (data: { userId: string; isEditing: boolean; field?: string }) => {
          setCollaborators((prev) =>
            prev.map((c) =>
              c.userId === data.userId
                ? { ...c, isEditing: data.isEditing, cursorPosition: data.field ? { field: data.field } : undefined }
                : c
            )
          );
        });

        socketRef.current = socketInstance;
        setSocket(socketInstance);
      } catch (error) {
        console.error("[WebSocket] Failed to connect:", error);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id]);

  // Fetch notifications on mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.id]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=50", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("[WebSocket] Failed to fetch notifications:", error);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/unread-count", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error("[WebSocket] Failed to fetch unread count:", error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("[WebSocket] Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("[WebSocket] Failed to mark all as read:", error);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Collaboration methods - use ref to avoid stale closures
  const joinCollaboration = useCallback((entityType: string, entityId: string) => {
    currentCollabRef.current = { entityType, entityId };
    if (socketRef.current?.connected) {
      console.log("[WebSocket] Joining collaboration:", entityType, entityId);
      socketRef.current.emit("join:collaboration", { entityType, entityId });
    } else {
      console.log("[WebSocket] Socket not connected yet, will join on connect");
    }
  }, []);

  const leaveCollaboration = useCallback((entityType: string, entityId: string) => {
    currentCollabRef.current = null;
    setCollaborators([]);
    if (socketRef.current?.connected) {
      console.log("[WebSocket] Leaving collaboration:", entityType, entityId);
      socketRef.current.emit("leave:collaboration", { entityType, entityId });
    }
  }, []);

  const broadcastChange = useCallback((entityType: string, entityId: string, changes: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("document:change", { entityType, entityId, changes });
    }
  }, []);

  const setEditingState = useCallback((entityType: string, entityId: string, isEditing: boolean, field?: string) => {
    if (socketRef.current?.connected) {
      if (isEditing) {
        socketRef.current.emit("editing:start", { entityType, entityId, field });
      } else {
        socketRef.current.emit("editing:stop", { entityType, entityId });
      }
    }
  }, []);

  // Generic event subscription
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
      return () => {
        socketRef.current?.off(event, handler);
      };
    }
    return () => {};
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        collaborators,
        joinCollaboration,
        leaveCollaboration,
        broadcastChange,
        setEditingState,
        on,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}

// Convenience hook for notifications only
export function useNotifications() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useWebSocket();
  return { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead };
}

// Convenience hook for collaboration
export function useCollaboration(entityType: string, entityId: string) {
  const { collaborators, joinCollaboration, leaveCollaboration, broadcastChange, setEditingState, on, isConnected } = useWebSocket();
  const hasJoinedRef = useRef(false);
  
  // Join on mount and when connection is established
  useEffect(() => {
    if (!entityId) return;
    
    // Join immediately if connected, and also when connection state changes
    if (isConnected && !hasJoinedRef.current) {
      console.log("[useCollaboration] Joining room:", entityType, entityId);
      joinCollaboration(entityType, entityId);
      hasJoinedRef.current = true;
    }
    
    return () => {
      if (hasJoinedRef.current) {
        console.log("[useCollaboration] Leaving room:", entityType, entityId);
        leaveCollaboration(entityType, entityId);
        hasJoinedRef.current = false;
      }
    };
  }, [entityType, entityId, isConnected, joinCollaboration, leaveCollaboration]);

  // Also try to join immediately on mount (in case we're already connected)
  useEffect(() => {
    if (entityId && !hasJoinedRef.current) {
      joinCollaboration(entityType, entityId);
    }
  }, [entityType, entityId, joinCollaboration]);

  const broadcast = useCallback((changes: any) => {
    broadcastChange(entityType, entityId, changes);
  }, [entityType, entityId, broadcastChange]);

  const startEditing = useCallback((field?: string) => {
    setEditingState(entityType, entityId, true, field);
  }, [entityType, entityId, setEditingState]);

  const stopEditing = useCallback(() => {
    setEditingState(entityType, entityId, false);
  }, [entityType, entityId, setEditingState]);

  return {
    collaborators,
    broadcast,
    startEditing,
    stopEditing,
    onDocumentUpdate: (handler: (data: any) => void) => on("document:updated", handler),
  };
}

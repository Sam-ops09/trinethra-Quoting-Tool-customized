import { useAuth } from "@/lib/auth-context";
import { hasPermission, canAccessRoute, type UserRole, type Resource } from "@/lib/permissions-new";
import type { Permission } from "@/lib/permissions-new";

/**
 * Hook for checking user permissions
 * Use this in components to conditionally render UI elements
 */
export function usePermissions() {
  const { user } = useAuth();

  return {
    /**
     * Check if user has a specific permission
     * @example canUser("quotes", "create")
     */
    canUser: (resource: Resource, action: Permission["action"]) => {
      return hasPermission(user?.role as UserRole, resource, action);
    },

    /**
     * Check if user can access a specific route
     * @example canAccessPath("/admin/users")
     */
    canAccessPath: (path: string) => {
      return canAccessRoute(user?.role as UserRole, path);
    },

    /**
     * Check if user is admin
     */
    isAdmin: user?.role === "admin",

    /**
     * Check if user is sales manager
     */
    isSalesManager: user?.role === "sales_manager",

    /**
     * Current user role
     */
    role: user?.role as UserRole | undefined,
  };
}


/**
 * Role-based permissions and authorization utilities
 * Server-side enforcement is primary - this is for UX only
 *
 * NOTE: This file is for backward compatibility.
 * Use permissions-new.ts for new code with updated role names.
 */

export type UserRole =
  | "admin"
  | "sales_executive"
  | "sales_manager"
  | "purchase_operations"
  | "finance_accounts"
  | "viewer"
  // Legacy roles (mapped to new roles)
  | "manager"
  | "user";

export interface Permission {
  resource: string;
  action: "view" | "create" | "edit" | "delete" | "manage";
}

/**
 * Map legacy roles to new roles
 */
function normalizeRole(role: UserRole): UserRole {
  switch (role) {
    case "manager":
      return "sales_manager";
    case "user":
      return "sales_executive";
    default:
      return role;
  }
}

/**
 * Permission definitions by role
 */
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    // Full access to everything
    { resource: "dashboard", action: "view" },
    { resource: "quotes", action: "view" },
    { resource: "quotes", action: "create" },
    { resource: "quotes", action: "edit" },
    { resource: "quotes", action: "delete" },
    { resource: "clients", action: "view" },
    { resource: "clients", action: "create" },
    { resource: "clients", action: "edit" },
    { resource: "clients", action: "delete" },
    { resource: "invoices", action: "view" },
    { resource: "invoices", action: "create" },
    { resource: "invoices", action: "edit" },
    { resource: "invoices", action: "delete" },
    { resource: "analytics", action: "view" },
    { resource: "vendors", action: "view" },
    { resource: "vendors", action: "create" },
    { resource: "vendors", action: "edit" },
    { resource: "vendors", action: "delete" },
    { resource: "vendor-pos", action: "view" },
    { resource: "vendor-pos", action: "create" },
    { resource: "vendor-pos", action: "edit" },
    { resource: "vendor-pos", action: "delete" },
    { resource: "products", action: "view" },
    { resource: "products", action: "create" },
    { resource: "products", action: "edit" },
    { resource: "products", action: "delete" },
    { resource: "grn", action: "view" },
    { resource: "grn", action: "create" },
    { resource: "grn", action: "edit" },
    { resource: "grn", action: "delete" },
    { resource: "users", action: "view" },
    { resource: "users", action: "create" },
    { resource: "users", action: "edit" },
    { resource: "users", action: "delete" },
    { resource: "settings", action: "view" },
    { resource: "settings", action: "manage" },
    { resource: "dashboards", action: "view" },
    { resource: "dashboards/sales-quotes", action: "view" },
    { resource: "dashboards/vendor-po", action: "view" },
    { resource: "dashboards/invoice-collections", action: "view" },
    { resource: "dashboards/serial-tracking", action: "view" },
    { resource: "serial-search", action: "view" },
    { resource: "admin/users", action: "view" },
    { resource: "admin/settings", action: "view" },
    { resource: "admin/configuration", action: "view" },
    { resource: "admin/governance", action: "view" },
  ],
  sales_manager: [
    { resource: "dashboard", action: "view" },
    { resource: "quotes", action: "view" },
    { resource: "quotes", action: "create" },
    { resource: "quotes", action: "edit" },
    { resource: "quotes", action: "delete" },
    { resource: "clients", action: "view" },
    { resource: "clients", action: "create" },
    { resource: "clients", action: "edit" },
    { resource: "clients", action: "delete" },
    { resource: "invoices", action: "view" },
    { resource: "invoices", action: "create" },
    { resource: "invoices", action: "edit" },
    { resource: "analytics", action: "view" },
    { resource: "vendors", action: "view" },
    { resource: "vendor-pos", action: "view" },
    { resource: "products", action: "view" },
    { resource: "grn", action: "view" },
    { resource: "dashboards", action: "view" },
    { resource: "dashboards/sales-quotes", action: "view" },
    { resource: "dashboards/invoice-collections", action: "view" },
    { resource: "serial-search", action: "view" },
  ],
  sales_executive: [
    { resource: "dashboard", action: "view" },
    { resource: "quotes", action: "view" },
    { resource: "quotes", action: "create" },
    { resource: "quotes", action: "edit" },
    { resource: "clients", action: "view" },
    { resource: "clients", action: "create" },
    { resource: "clients", action: "edit" },
    { resource: "invoices", action: "view" },
    { resource: "vendors", action: "view" },
    { resource: "vendor-pos", action: "view" },
    { resource: "products", action: "view" },
    { resource: "grn", action: "view" },
    { resource: "dashboards", action: "view" },
    { resource: "dashboards/sales-quotes", action: "view" },
    { resource: "serial-search", action: "view" },
  ],
  purchase_operations: [
    { resource: "dashboard", action: "view" },
    { resource: "quotes", action: "view" },
    { resource: "invoices", action: "view" },
    { resource: "vendors", action: "view" },
    { resource: "vendors", action: "create" },
    { resource: "vendors", action: "edit" },
    { resource: "vendor-pos", action: "view" },
    { resource: "vendor-pos", action: "create" },
    { resource: "vendor-pos", action: "edit" },
    { resource: "vendor-pos", action: "delete" },
    { resource: "products", action: "view" },
    { resource: "products", action: "create" },
    { resource: "products", action: "edit" },
    { resource: "grn", action: "view" },
    { resource: "grn", action: "create" },
    { resource: "grn", action: "edit" },
    { resource: "grn", action: "delete" },
    { resource: "dashboards", action: "view" },
    { resource: "dashboards/vendor-po", action: "view" },
    { resource: "dashboards/serial-tracking", action: "view" },
    { resource: "serial-search", action: "view" },
  ],
  finance_accounts: [
    { resource: "dashboard", action: "view" },
    { resource: "quotes", action: "view" },
    { resource: "clients", action: "view" },
    { resource: "invoices", action: "view" },
    { resource: "invoices", action: "create" },
    { resource: "invoices", action: "edit" },
    { resource: "invoices", action: "delete" },
    { resource: "analytics", action: "view" },
    { resource: "dashboards", action: "view" },
    { resource: "dashboards/invoice-collections", action: "view" },
    { resource: "serial-search", action: "view" },
  ],
  viewer: [
    { resource: "dashboard", action: "view" },
    { resource: "quotes", action: "view" },
    { resource: "clients", action: "view" },
    { resource: "invoices", action: "view" },
    { resource: "vendors", action: "view" },
    { resource: "vendor-pos", action: "view" },
    { resource: "products", action: "view" },
    { resource: "grn", action: "view" },
    { resource: "dashboards", action: "view" },
    { resource: "serial-search", action: "view" },
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole | undefined,
  resource: string,
  action: Permission["action"]
): boolean {
  if (!role) return false;

  const normalizedRole = normalizeRole(role);
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.some(
    (p) => p.resource === resource && p.action === action
  );
}

/**
 * Check if a role can access a route
 */
export function canAccessRoute(role: UserRole | undefined, path: string): boolean {
  if (!role) return false;

  const normalizedRole = normalizeRole(role);

  // Remove leading slash and get base path
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  // Handle root path (dashboard)
  if (normalizedPath === "" || normalizedPath === "/") {
    return hasPermission(normalizedRole, "dashboard", "view");
  }

  // Check direct resource access
  if (hasPermission(normalizedRole, normalizedPath, "view")) {
    return true;
  }

  // Check if it's an admin route
  if (normalizedPath.startsWith("admin/")) {
    return normalizedRole === "admin";
  }

  // For dashboard routes (e.g., dashboards/sales-quotes)
  if (normalizedPath.startsWith("dashboards")) {
    // Anyone who can view dashboard can access dashboard sub-pages
    return hasPermission(normalizedRole, "dashboard", "view");
  }

  // For paths with IDs (e.g., /quotes/123), check the base resource
  const basePath = normalizedPath.split("/")[0];
  return hasPermission(normalizedRole, basePath, "view");
}

/**
 * Check if a role is at least a certain level
 */
export function isRoleAtLeast(role: UserRole | undefined, minRole: UserRole): boolean {
  if (!role) return false;

  const normalizedRole = normalizeRole(role);
  const normalizedMinRole = normalizeRole(minRole);

  const roleHierarchy: Record<string, number> = {
    admin: 5,
    sales_manager: 4,
    sales_executive: 3,
    purchase_operations: 3,
    finance_accounts: 3,
    viewer: 1,
  };

  return (roleHierarchy[normalizedRole] || 0) >= (roleHierarchy[normalizedMinRole] || 0);
}


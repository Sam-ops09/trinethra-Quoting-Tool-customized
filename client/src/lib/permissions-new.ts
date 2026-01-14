/**
 * CLIENT-SIDE PERMISSIONS
 * Role-based permissions for UI display
 * NOTE: Server-side enforcement is primary - this is for UX only
 */

export type UserRole =
  | "admin"
  | "sales_executive"
  | "sales_manager"
  | "purchase_operations"
  | "finance_accounts"
  | "viewer";

export type Resource =
  | "dashboard"
  | "quotes"
  | "clients"
  | "invoices"
  | "vendors"
  | "vendor-pos"
  | "products"
  | "grn"
  | "payments"
  | "sales-orders"
  | "serial-search"
  | "analytics"
  | "admin/users"
  | "admin/settings"
  | "admin/configuration"
  | "admin/governance"
  | "admin/analytics"
  | "dashboards"
  | "dashboards/sales-quotes"
  | "dashboards/vendor-po"
  | "dashboards/invoice-collections"
  | "dashboards/serial-tracking";

export interface Permission {
  resource: Resource;
  action: "view" | "create" | "edit" | "delete" | "approve" | "cancel" | "finalize" | "lock" | "manage";
}

/**
 * Role display names and descriptions
 */
export const ROLE_INFO: Record<UserRole, { name: string; description: string; badge: string }> = {
  admin: {
    name: "Administrator",
    description: "Full system access",
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  },
  sales_executive: {
    name: "Sales Executive",
    description: "Create & edit draft quotes",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  },
  sales_manager: {
    name: "Sales Manager",
    description: "Approve quotes & manage sales",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  },
  purchase_operations: {
    name: "Purchase / Operations",
    description: "Manage vendor POs & GRNs",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  },
  finance_accounts: {
    name: "Finance / Accounts",
    description: "Manage invoices & payments",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  },
  viewer: {
    name: "Viewer",
    description: "Read-only access",
    badge: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }
};

/**
 * Permission definitions by role
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access to everything
    { resource: "dashboard", action: "view" },
    { resource: "quotes", action: "view" },
    { resource: "quotes", action: "create" },
    { resource: "quotes", action: "edit" },
    { resource: "quotes", action: "delete" },
    { resource: "quotes", action: "approve" },
    { resource: "quotes", action: "cancel" },
    { resource: "clients", action: "view" },
    { resource: "clients", action: "create" },
    { resource: "clients", action: "edit" },
    { resource: "clients", action: "delete" },
    { resource: "invoices", action: "view" },
    { resource: "invoices", action: "create" },
    { resource: "invoices", action: "edit" },
    { resource: "invoices", action: "delete" },
    { resource: "invoices", action: "finalize" },
    { resource: "invoices", action: "lock" },
    { resource: "sales-orders", action: "view" },
    { resource: "sales-orders", action: "create" },
    { resource: "sales-orders", action: "edit" },
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
    { resource: "payments", action: "view" },
    { resource: "payments", action: "create" },
    { resource: "payments", action: "delete" },
    { resource: "serial-search", action: "view" },
    { resource: "analytics", action: "view" },
    { resource: "admin/users", action: "view" },
    { resource: "admin/users", action: "manage" },
    { resource: "admin/settings", action: "view" },
    { resource: "admin/settings", action: "manage" },
    { resource: "admin/configuration", action: "view" },
    { resource: "admin/configuration", action: "manage" },
    { resource: "admin/governance", action: "view" },
    { resource: "admin/governance", action: "manage" },
    { resource: "admin/analytics", action: "view" },
    { resource: "dashboards", action: "view" },
    { resource: "dashboards/sales-quotes", action: "view" },
    { resource: "dashboards/vendor-po", action: "view" },
    { resource: "dashboards/invoice-collections", action: "view" },
    { resource: "dashboards/serial-tracking", action: "view" },
  ],
  sales_executive: [
    { resource: "dashboard", action: "view" },
    { resource: "quotes", action: "view" },
    { resource: "quotes", action: "create" },
    { resource: "quotes", action: "edit" }, // Limited to draft/sent
    { resource: "clients", action: "view" },
    { resource: "clients", action: "create" },
    { resource: "clients", action: "edit" },
    { resource: "invoices", action: "view" },
    { resource: "invoices", action: "create" },
    { resource: "invoices", action: "edit" },
    { resource: "invoices", action: "finalize" },
    { resource: "sales-orders", action: "view" },
    { resource: "sales-orders", action: "create" },
    { resource: "vendor-pos", action: "view" },
    { resource: "products", action: "view" },
    { resource: "serial-search", action: "view" },
    { resource: "dashboards", action: "view" },
    { resource: "dashboards/sales-quotes", action: "view" },
  ],
  sales_manager: [
    { resource: "dashboard", action: "view" },
    { resource: "quotes", action: "view" },
    { resource: "quotes", action: "create" },
    { resource: "quotes", action: "edit" },
    { resource: "quotes", action: "approve" },
    { resource: "quotes", action: "cancel" },
    { resource: "clients", action: "view" },
    { resource: "clients", action: "create" },
    { resource: "clients", action: "edit" },
    { resource: "invoices", action: "view" },
    { resource: "invoices", action: "create" },
    { resource: "invoices", action: "edit" },
    { resource: "sales-orders", action: "view" },
    { resource: "sales-orders", action: "create" },
    { resource: "sales-orders", action: "edit" },
    { resource: "sales-orders", action: "approve" },
    { resource: "vendor-pos", action: "view" },
    { resource: "grn", action: "view" },
    { resource: "products", action: "view" },
    { resource: "payments", action: "view" },
    { resource: "serial-search", action: "view" },
    { resource: "analytics", action: "view" },
    { resource: "dashboards", action: "view" },
    { resource: "dashboards/sales-quotes", action: "view" },
    { resource: "dashboards/invoice-collections", action: "view" },
  ],
  purchase_operations: [
    { resource: "dashboard", action: "view" },
    { resource: "quotes", action: "view" },
    { resource: "invoices", action: "view" },
    { resource: "sales-orders", action: "view" },
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
    { resource: "serial-search", action: "view" },
    { resource: "dashboards", action: "view" },
    { resource: "dashboards/vendor-po", action: "view" },
    { resource: "dashboards/serial-tracking", action: "view" },
  ],
  finance_accounts: [
    { resource: "dashboard", action: "view" },
    { resource: "quotes", action: "view" },
    { resource: "clients", action: "view" },
    { resource: "invoices", action: "view" },
    { resource: "invoices", action: "create" },
    { resource: "invoices", action: "edit" },
    { resource: "invoices", action: "finalize" },
    { resource: "invoices", action: "lock" },
    { resource: "invoices", action: "cancel" },
    { resource: "sales-orders", action: "view" },
    { resource: "payments", action: "view" },
    { resource: "payments", action: "create" },
    { resource: "payments", action: "delete" },
    { resource: "serial-search", action: "view" },
    { resource: "analytics", action: "view" },
    { resource: "dashboards", action: "view" },
    { resource: "dashboards/invoice-collections", action: "view" },
  ],
  viewer: [
    { resource: "dashboard", action: "view" },
    { resource: "quotes", action: "view" },
    { resource: "clients", action: "view" },
    { resource: "invoices", action: "view" },
    { resource: "sales-orders", action: "view" },
    { resource: "vendors", action: "view" },
    { resource: "vendor-pos", action: "view" },
    { resource: "products", action: "view" },
    { resource: "grn", action: "view" },
    { resource: "payments", action: "view" },
    { resource: "serial-search", action: "view" },
    { resource: "dashboards", action: "view" },
  ]
};

/**
 * Check if a user has permission
 */
export function hasPermission(role: UserRole, resource: Resource, action: Permission["action"]): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  return permissions.some(p => p.resource === resource && p.action === action);
}

/**
 * Check if user can access a route
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
  // Remove leading slash
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  // Handle root path
  if (normalizedPath === '' || normalizedPath === '/') {
    return hasPermission(role, 'dashboard', 'view');
  }

  // Helper to check if a string is a valid Resource
  const isValidResource = (str: string): str is Resource => {
    const validResources: Resource[] = [
      "dashboard", "quotes", "clients", "invoices", "vendors", "vendor-pos",
      "products", "grn", "payments", "serial-search", "analytics", "sales-orders",
      "admin/users", "admin/settings", "admin/configuration", "admin/governance", "admin/analytics",
      "dashboards", "dashboards/sales-quotes", "dashboards/vendor-po",
      "dashboards/invoice-collections", "dashboards/serial-tracking"
    ];
    return validResources.includes(str as Resource);
  };

  // Check direct resource access (e.g., "admin/users", "serial-search")
  if (isValidResource(normalizedPath) && hasPermission(role, normalizedPath, 'view')) {
    return true;
  }

  // For paths with IDs or sub-paths (e.g., /quotes/123, /dashboards/sales-quotes)
  // Extract the base resource
  const parts = normalizedPath.split('/');

  // Try checking the first part (e.g., "quotes" from "/quotes/123")
  if (parts.length > 0 && isValidResource(parts[0]) && hasPermission(role, parts[0], 'view')) {
    return true;
  }

  // Try checking first two parts (e.g., "admin/users" from "/admin/users/123")
  if (parts.length > 1) {
    const combined = `${parts[0]}/${parts[1]}`;
    if (isValidResource(combined) && hasPermission(role, combined, 'view')) {
      return true;
    }
  }

  // For dashboard routes (e.g., /dashboards/sales-quotes)
  if (parts[0] === 'dashboards') {
    // Check if user can view dashboards in general
    return hasPermission(role, 'dashboard', 'view');
  }

  return false;
}

/**
 * Get role display name
 */
export function getRoleName(role: UserRole): string {
  return ROLE_INFO[role]?.name || role;
}

/**
 * Get role badge classes
 */
export function getRoleBadgeClasses(role: UserRole): string {
  return ROLE_INFO[role]?.badge || ROLE_INFO.viewer.badge;
}

/**
 * Check if role can approve quotes
 */
export function canApproveQuotes(role: UserRole): boolean {
  return ["sales_manager", "admin"].includes(role);
}

/**
 * Check if role can manage invoices
 */
export function canManageInvoices(role: UserRole): boolean {
  return ["finance_accounts", "admin"].includes(role);
}

/**
 * Check if role can manage payments
 */
export function canManagePayments(role: UserRole): boolean {
  return ["finance_accounts", "admin"].includes(role);
}

/**
 * Check if role can manage vendor operations
 */
export function canManageVendorOps(role: UserRole): boolean {
  return ["purchase_operations", "admin"].includes(role);
}

/**
 * Get available actions for a resource based on role
 */
export function getAvailableActions(role: UserRole, resource: Resource): Permission["action"][] {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return [];

  return permissions
    .filter(p => p.resource === resource)
    .map(p => p.action);
}


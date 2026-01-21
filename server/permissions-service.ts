/**
 * COMPREHENSIVE PERMISSIONS & GOVERNANCE SYSTEM
 *
 * This module defines role-based permissions and governance controls
 * for the quoting and invoicing system.
 */

export type UserRole =
  | "admin"
  | "sales_executive"
  | "sales_manager"
  | "purchase_operations"
  | "finance_accounts"
  | "viewer";

export type ResourceType =
  | "quotes"
  | "invoices"
  | "credit_notes"
  | "debit_notes"
  | "vendor_pos"
  | "grns"
  | "clients"
  | "vendors"
  | "products"
  | "payments"
  | "serial_numbers"
  | "users"
  | "settings"
  | "settings"
  | "sales_orders"
  | "subscriptions";

export type ActionType =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "cancel"
  | "finalize"
  | "lock"
  | "manage";

export interface Permission {
  resource: ResourceType;
  action: ActionType;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: "equals" | "not_equals" | "in" | "not_in";
  value: any;
}

export interface GovernanceCheck {
  allowed: boolean;
  reason?: string;
  requiredRole?: UserRole;
}

/**
 * Role Descriptions and Permissions
 */
export const ROLE_DEFINITIONS: Record<UserRole, {
  name: string;
  description: string;
  permissions: Permission[];
}> = {
  admin: {
    name: "Administrator",
    description: "Full system access - Configure settings, manage users, all operations",
    permissions: [
      // All resources with all actions
      { resource: "quotes", action: "view" },
      { resource: "quotes", action: "create" },
      { resource: "quotes", action: "edit" },
      { resource: "quotes", action: "delete" },
      { resource: "quotes", action: "approve" },
      { resource: "quotes", action: "cancel" },
      { resource: "invoices", action: "view" },
      { resource: "invoices", action: "create" },
      { resource: "invoices", action: "edit" },
      { resource: "invoices", action: "delete" },
      { resource: "invoices", action: "finalize" },
      { resource: "invoices", action: "lock" },
      { resource: "invoices", action: "cancel" },
      { resource: "sales_orders", action: "view" },
      { resource: "sales_orders", action: "create" },
      { resource: "sales_orders", action: "edit" },
      { resource: "sales_orders", action: "delete" },
      { resource: "sales_orders", action: "approve" },
      { resource: "sales_orders", action: "cancel" },
      { resource: "credit_notes", action: "view" },
      { resource: "credit_notes", action: "create" },
      { resource: "credit_notes", action: "edit" },
      { resource: "credit_notes", action: "delete" },
      { resource: "debit_notes", action: "view" },
      { resource: "debit_notes", action: "create" },
      { resource: "debit_notes", action: "edit" },
      { resource: "debit_notes", action: "delete" },
      { resource: "vendor_pos", action: "view" },
      { resource: "vendor_pos", action: "create" },
      { resource: "vendor_pos", action: "edit" },
      { resource: "vendor_pos", action: "delete" },
      { resource: "grns", action: "view" },
      { resource: "grns", action: "create" },
      { resource: "grns", action: "edit" },
      { resource: "grns", action: "delete" },
      { resource: "clients", action: "view" },
      { resource: "clients", action: "create" },
      { resource: "clients", action: "edit" },
      { resource: "clients", action: "delete" },
      { resource: "vendors", action: "view" },
      { resource: "vendors", action: "create" },
      { resource: "vendors", action: "edit" },
      { resource: "vendors", action: "delete" },
      { resource: "products", action: "view" },
      { resource: "products", action: "create" },
      { resource: "products", action: "edit" },
      { resource: "products", action: "delete" },
      { resource: "payments", action: "view" },
      { resource: "payments", action: "create" },
      { resource: "payments", action: "edit" },
      { resource: "payments", action: "delete" },
      { resource: "serial_numbers", action: "view" },
      { resource: "serial_numbers", action: "edit" },
      { resource: "users", action: "view" },
      { resource: "users", action: "create" },
      { resource: "users", action: "edit" },
      { resource: "users", action: "delete" },
      { resource: "settings", action: "view" },
      { resource: "settings", action: "create" },
      { resource: "settings", action: "edit" },
      { resource: "settings", action: "delete" },
      { resource: "settings", action: "manage" },
      { resource: "subscriptions", action: "view" },
      { resource: "subscriptions", action: "create" },
      { resource: "subscriptions", action: "edit" },
      { resource: "subscriptions", action: "delete" },
      { resource: "subscriptions", action: "cancel" },
    ]
  },
  sales_executive: {
    name: "Sales Executive",
    description: "Create and edit draft quotes, view related POs and invoices",
    permissions: [
      { resource: "quotes", action: "view" },
      { resource: "quotes", action: "create" },
      {
        resource: "quotes",
        action: "edit",
        conditions: [
          { field: "status", operator: "in", value: ["draft", "sent"] }
        ]
      },
      { resource: "invoices", action: "view" },
      { resource: "invoices", action: "create" },
      { resource: "invoices", action: "edit" },
      { resource: "invoices", action: "finalize" },
      { resource: "sales_orders", action: "view" },
      { resource: "sales_orders", action: "create" },
      { resource: "sales_orders", action: "edit" },
      { resource: "vendor_pos", action: "view" },
      { resource: "clients", action: "view" },
      { resource: "clients", action: "create" },
      { resource: "clients", action: "edit" },
      { resource: "products", action: "view" },
      { resource: "serial_numbers", action: "view" },
      { resource: "subscriptions", action: "view" },
    ]
  },
  sales_manager: {
    name: "Sales Manager",
    description: "Approve quotes, edit certain fields after approval",
    permissions: [
      { resource: "quotes", action: "view" },
      { resource: "quotes", action: "create" },
      { resource: "quotes", action: "edit" },
      { resource: "quotes", action: "approve" },
      { resource: "quotes", action: "cancel" },
      { resource: "invoices", action: "view" },
      { resource: "invoices", action: "create" },
      { resource: "invoices", action: "edit" },
      { resource: "sales_orders", action: "view" },
      { resource: "sales_orders", action: "create" },
      { resource: "sales_orders", action: "edit" },
      { resource: "sales_orders", action: "approve" },
      { resource: "sales_orders", action: "cancel" },
      { resource: "vendor_pos", action: "view" },
      { resource: "grns", action: "view" },
      { resource: "clients", action: "view" },
      { resource: "clients", action: "create" },
      { resource: "clients", action: "edit" },
      { resource: "products", action: "view" },
      { resource: "payments", action: "view" },
      { resource: "serial_numbers", action: "edit" },
      { resource: "subscriptions", action: "view" },
      { resource: "subscriptions", action: "create" },
      { resource: "subscriptions", action: "edit" },
      { resource: "subscriptions", action: "cancel" },
    ]
  },
  purchase_operations: {
    name: "Purchase / Operations",
    description: "Create and manage Vendor POs and GRNs, view relevant quotes and invoices",
    permissions: [
      { resource: "vendor_pos", action: "view" },
      { resource: "vendor_pos", action: "create" },
      { resource: "vendor_pos", action: "edit" },
      { resource: "vendor_pos", action: "delete" },
      { resource: "grns", action: "view" },
      { resource: "grns", action: "create" },
      { resource: "grns", action: "edit" },
      { resource: "grns", action: "delete" },
      { resource: "sales_orders", action: "view" },
      { resource: "quotes", action: "view" },
      { resource: "invoices", action: "view" },
      { resource: "vendors", action: "view" },
      { resource: "vendors", action: "create" },
      { resource: "vendors", action: "edit" },
      { resource: "products", action: "view" },
      { resource: "products", action: "create" },
      { resource: "products", action: "edit" },
      { resource: "serial_numbers", action: "view" },
      { resource: "serial_numbers", action: "edit" },
    ]
  },
  finance_accounts: {
    name: "Finance / Accounts",
    description: "Create and finalize invoices, record payments, view receivables",
    permissions: [
      { resource: "invoices", action: "view" },
      { resource: "invoices", action: "create" },
      { resource: "invoices", action: "edit" },
      { resource: "invoices", action: "finalize" },
      { resource: "invoices", action: "lock" },
      { resource: "invoices", action: "cancel" },
      { resource: "credit_notes", action: "view" },
      { resource: "credit_notes", action: "create" },
      { resource: "credit_notes", action: "edit" },
      { resource: "credit_notes", action: "delete" },
      { resource: "debit_notes", action: "view" },
      { resource: "debit_notes", action: "create" },
      { resource: "debit_notes", action: "edit" },
      { resource: "debit_notes", action: "delete" },
      { resource: "payments", action: "view" },
      { resource: "payments", action: "create" },
      { resource: "payments", action: "edit" },
      { resource: "payments", action: "delete" },
      { resource: "sales_orders", action: "view" },
      { resource: "quotes", action: "view" },
      { resource: "clients", action: "view" },
      { resource: "serial_numbers", action: "view" },
      { resource: "subscriptions", action: "view" },
      { resource: "subscriptions", action: "create" },
      { resource: "subscriptions", action: "edit" },
      { resource: "subscriptions", action: "cancel" },
    ]
  },
  viewer: {
    name: "Viewer",
    description: "Read-only access to most resources",
    permissions: [
      { resource: "quotes", action: "view" },
      { resource: "invoices", action: "view" },
      { resource: "sales_orders", action: "view" },
      { resource: "vendor_pos", action: "view" },
      { resource: "grns", action: "view" },
      { resource: "clients", action: "view" },
      { resource: "vendors", action: "view" },
      { resource: "products", action: "view" },
      { resource: "payments", action: "view" },
      { resource: "serial_numbers", action: "view" },
    ]
  }
};

/**
 * Check if a user with given role has permission for an action
 */
export function hasPermission(
  userRole: UserRole,
  resource: ResourceType,
  action: ActionType,
  context?: Record<string, any>
): boolean {
  const roleDef = ROLE_DEFINITIONS[userRole];
  if (!roleDef) return false;

  const permission = roleDef.permissions.find(
    p => p.resource === resource && p.action === action
  );

  if (!permission) return false;

  // Check conditions if any
  if (permission.conditions && context) {
    return permission.conditions.every(condition => {
      const contextValue = context[condition.field];

      switch (condition.operator) {
        case "equals":
          return contextValue === condition.value;
        case "not_equals":
          return contextValue !== condition.value;
        case "in":
          return Array.isArray(condition.value) && condition.value.includes(contextValue);
        case "not_in":
          return Array.isArray(condition.value) && !condition.value.includes(contextValue);
        default:
          return false;
      }
    });
  }

  return true;
}

/**
 * Governance Control: Can user approve quotes?
 */
export function canApproveQuote(userRole: UserRole, quoteStatus: string): GovernanceCheck {
  // Only Sales Manager and Admin can approve
  if (!["sales_manager", "admin"].includes(userRole)) {
    return {
      allowed: false,
      reason: "Only Sales Managers and Administrators can approve quotes",
      requiredRole: "sales_manager"
    };
  }

  // Can only approve quotes that are in "sent" status
  if (quoteStatus !== "sent") {
    return {
      allowed: false,
      reason: `Quote must be in "sent" status to approve. Current status: ${quoteStatus}`
    };
  }

  return { allowed: true };
}

/**
 * Governance Control: Can user cancel quotes?
 */
export function canCancelQuote(userRole: UserRole, quoteStatus: string): GovernanceCheck {
  // Only Sales Manager and Admin can cancel
  if (!["sales_manager", "admin"].includes(userRole)) {
    return {
      allowed: false,
      reason: "Only Sales Managers and Administrators can cancel quotes",
      requiredRole: "sales_manager"
    };
  }

  // Cannot cancel already invoiced or closed quotes
  if (["invoiced", "closed_paid", "closed_cancelled"].includes(quoteStatus)) {
    return {
      allowed: false,
      reason: `Cannot cancel quote in ${quoteStatus} status`
    };
  }

  return { allowed: true };
}

/**
 * Governance Control: Can user confirm master invoice?
 */
export function canConfirmMasterInvoice(userRole: UserRole, invoiceStatus: string): GovernanceCheck {
  // Sales Executive, Finance and Admin can confirm
  if (!["sales_executive", "finance_accounts", "admin"].includes(userRole)) {
    return {
      allowed: false,
      reason: "Only Sales Executives, Finance/Accounts and Administrators can confirm master invoices",
      requiredRole: "sales_executive"
    };
  }

  // Can only confirm if in draft status
  if (invoiceStatus !== "draft") {
    return {
      allowed: false,
      reason: `Master invoice must be in "draft" status. Current status: ${invoiceStatus}`
    };
  }

  return { allowed: true };
}

/**
 * Governance Control: Can user lock master invoice?
 */
export function canLockMasterInvoice(userRole: UserRole, invoiceStatus: string): GovernanceCheck {
  // Only Finance and Admin can lock
  if (!["finance_accounts", "admin"].includes(userRole)) {
    return {
      allowed: false,
      reason: "Only Finance/Accounts and Administrators can lock master invoices",
      requiredRole: "finance_accounts"
    };
  }

  // Can only lock if confirmed
  if (invoiceStatus !== "confirmed") {
    return {
      allowed: false,
      reason: `Master invoice must be in "confirmed" status. Current status: ${invoiceStatus}`
    };
  }

  return { allowed: true };
}

/**
 * Governance Control: Can user finalize/cancel customer invoice?
 */
export function canFinalizeInvoice(userRole: UserRole, paymentStatus: string): GovernanceCheck {
  // Only Finance and Admin can finalize
  if (!["finance_accounts", "admin"].includes(userRole)) {
    return {
      allowed: false,
      reason: "Only Finance/Accounts and Administrators can finalize invoices",
      requiredRole: "finance_accounts"
    };
  }

  // Cannot finalize already paid invoices
  if (paymentStatus === "paid") {
    return {
      allowed: false,
      reason: "Cannot modify paid invoices"
    };
  }

  return { allowed: true };
}

/**
 * Governance Control: Can user edit serial numbers after invoice is sent?
 */
export function canEditSerialNumbersAfterSent(
  userRole: UserRole,
  invoiceStatus: string,
  paymentStatus: string
): GovernanceCheck {
  // Admin can always edit
  if (userRole === "admin") {
    return { allowed: true };
  }

  // Sales Manager and Finance can edit if not paid
  if (["sales_manager", "finance_accounts"].includes(userRole)) {
    if (paymentStatus === "paid") {
      return {
        allowed: false,
        reason: "Cannot edit serial numbers for paid invoices. Contact administrator."
      };
    }
    return { allowed: true };
  }

  // Others cannot edit after sent
  return {
    allowed: false,
    reason: "Only Managers, Finance, and Administrators can edit serial numbers after invoice is sent",
    requiredRole: "sales_manager"
  };
}

/**
 * Governance Control: Can user edit quote after approval?
 */
export function canEditApprovedQuote(userRole: UserRole, field: string): GovernanceCheck {
  // Admin can edit any field
  if (userRole === "admin") {
    return { allowed: true };
  }

  // Sales Manager can edit certain fields
  if (userRole === "sales_manager") {
    const allowedFields = [
      "notes",
      "termsAndConditions",
      "validityDays",
      "deliveryNotes",
      "milestoneDescription"
    ];

    if (allowedFields.includes(field)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Sales Managers can only edit: ${allowedFields.join(", ")} in approved quotes`
    };
  }

  return {
    allowed: false,
    reason: "Only Sales Managers and Administrators can edit approved quotes",
    requiredRole: "sales_manager"
  };
}

/**
 * Governance Control: Can user record/delete payments?
 */
export function canManagePayments(userRole: UserRole, action: "create" | "delete"): GovernanceCheck {
  // Only Finance and Admin can manage payments
  if (!["finance_accounts", "admin"].includes(userRole)) {
    return {
      allowed: false,
      reason: "Only Finance/Accounts and Administrators can manage payments",
      requiredRole: "finance_accounts"
    };
  }

  return { allowed: true };
}

/**
 * Bulk Operation Result
 */
export interface BulkOperationResult {
  allowed: boolean;
  reason?: string;
  allowedCount: number;
  totalCount: number;
}

/**
 * Check if user can approve quote considering delegation
 */
export function canApproveQuoteWithDelegation(
  userRole: UserRole,
  quoteStatus: string,
  user?: { role: UserRole; id: string; delegatedApprovalTo?: string | null; delegationStartDate?: Date | null; delegationEndDate?: Date | null }
): boolean {
  // Sales Manager can always approve
  if (userRole === "sales_manager") {
    return ["draft", "sent"].includes(quoteStatus);
  }

  // Check if this user has delegated approval authority
  if (user?.delegatedApprovalTo) {
    const now = new Date();
    const startDate = user.delegationStartDate ? new Date(user.delegationStartDate) : null;
    const endDate = user.delegationEndDate ? new Date(user.delegationEndDate) : null;

    if (startDate && endDate && now >= startDate && now <= endDate) {
      // User has temporary approval authority
      return ["draft", "sent"].includes(quoteStatus);
    }
  }

  return false;
}

/**
 * Check bulk approval permissions for quotes
 */
export function canBulkApproveQuotes(
  userRole: UserRole,
  quoteStatuses: string[],
  user?: { role: UserRole; delegatedApprovalTo?: string | null; delegationStartDate?: Date | null; delegationEndDate?: Date | null }
): BulkOperationResult {
  if (userRole !== "sales_manager" && userRole !== "admin") {
    // Check if user has delegated approval authority
    if (!user?.delegatedApprovalTo) {
      return {
        allowed: false,
        reason: "Only Sales Managers can approve quotes",
        allowedCount: 0,
        totalCount: quoteStatuses.length,
      };
    }

    const now = new Date();
    const startDate = user.delegationStartDate ? new Date(user.delegationStartDate) : null;
    const endDate = user.delegationEndDate ? new Date(user.delegationEndDate) : null;

    if (!startDate || !endDate || now < startDate || now > endDate) {
      return {
        allowed: false,
        reason: "Delegation period has expired",
        allowedCount: 0,
        totalCount: quoteStatuses.length,
      };
    }
  }

  // Check if all quotes can be approved (draft/sent status)
  const approvable = quoteStatuses.filter(status =>
    ["draft", "sent"].includes(status)
  ).length;

  return {
    allowed: approvable === quoteStatuses.length,
    reason: approvable < quoteStatuses.length
      ? `Only ${approvable}/${quoteStatuses.length} quotes are in approvable status`
      : undefined,
    allowedCount: approvable,
    totalCount: quoteStatuses.length,
  };
}

/**
 * Check bulk delete permissions for invoices
 */
export function canBulkDeleteInvoices(
  userRole: UserRole,
  invoiceStatuses: string[]
): BulkOperationResult {
  if (userRole !== "finance_accounts" && userRole !== "admin") {
    return {
      allowed: false,
      reason: "Only Finance/Accounts can delete invoices",
      allowedCount: 0,
      totalCount: invoiceStatuses.length,
    };
  }

  // Can only delete draft invoices
  const deletable = invoiceStatuses.filter(status => status === "draft").length;

  return {
    allowed: deletable === invoiceStatuses.length,
    reason: deletable < invoiceStatuses.length
      ? `Only ${deletable}/${invoiceStatuses.length} invoices are deletable (draft only)`
      : undefined,
    allowedCount: deletable,
    totalCount: invoiceStatuses.length,
  };
}

/**
 * Check bulk delete permissions for Vendor POs
 */
export function canBulkDeleteVendorPos(
  userRole: UserRole,
  poStatuses: string[]
): BulkOperationResult {
  if (userRole !== "purchase_operations" && userRole !== "admin") {
    return {
      allowed: false,
      reason: "Only Purchase/Operations can delete Vendor POs",
      allowedCount: 0,
      totalCount: poStatuses.length,
    };
  }

  // Can only delete draft POs
  const deletable = poStatuses.filter(status => status === "draft").length;

  return {
    allowed: deletable === poStatuses.length,
    reason: deletable < poStatuses.length
      ? `Only ${deletable}/${poStatuses.length} POs are deletable (draft only)`
      : undefined,
    allowedCount: deletable,
    totalCount: poStatuses.length,
  };
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_DEFINITIONS[userRole]?.permissions || [];
}

/**
 * Get role definition
 */
export function getRoleDefinition(userRole: UserRole) {
  return ROLE_DEFINITIONS[userRole];
}

/**
 * Check if action requires audit logging
 */
export function requiresAuditLog(resource: ResourceType, action: ActionType): boolean {
  // Actions that always require audit logging
  const auditActions: ActionType[] = ["approve", "cancel", "finalize", "lock", "delete"];

  if (auditActions.includes(action)) {
    return true;
  }

  // Edit actions on sensitive resources
  if (action === "edit") {
    const sensitiveResources: ResourceType[] = ["invoices", "payments", "serial_numbers"];
    return sensitiveResources.includes(resource);
  }

  return false;
}

/**
 * Get fields that require audit logging when edited
 */
export function getAuditableFields(resource: ResourceType): string[] {
  const auditableFieldsMap: Record<ResourceType, string[]> = {
    quotes: ["subtotal", "total", "discount", "cgst", "sgst", "igst", "status"],
    invoices: ["subtotal", "total", "discount", "cgst", "sgst", "igst", "paymentStatus", "paidAmount", "masterInvoiceStatus"],
    credit_notes: ["total", "status", "appliedAmount"],
    debit_notes: ["total", "status", "appliedAmount"],
    vendor_pos: ["totalAmount", "status"],
    grns: ["totalQuantity", "status"],
    clients: ["name", "email", "gstin"],
    vendors: ["name", "email", "gstin"],
    products: ["name", "sku", "price"],
    payments: ["amount", "paymentMethod", "paymentDate"],
    serial_numbers: ["serialNumber", "status"],
    users: ["role", "status", "email"],
    settings: ["*"], // All settings changes
    sales_orders: ["total", "status", "discount", "orderDate"],
    subscriptions: ["planName", "amount", "billingCycle", "status", "nextBillingDate", "prorataCredit"],
  };

  return auditableFieldsMap[resource] || [];
}

/**
 * Format audit log entry
 */
export function formatAuditLogEntry(
  resource: ResourceType,
  action: ActionType,
  entityId: string,
  changes?: Record<string, { old: any; new: any }>
): string {
  let message = `${action.toUpperCase()} ${resource}`;

  if (changes) {
    const changeDetails = Object.entries(changes)
      .map(([field, { old, new: newVal }]) => `${field}: ${old} → ${newVal}`)
      .join(", ");

    if (changeDetails) {
      message += ` - Changes: ${changeDetails}`;
    }
  }

  return message;
}


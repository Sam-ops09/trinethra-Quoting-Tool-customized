import React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import type { UserRole, Resource } from "@/lib/permissions-new";
import type { Permission } from "@/lib/permissions-new";

interface ProtectedProps {
  children: React.ReactNode;
  /** Fallback component if user doesn't have permission */
  fallback?: React.ReactNode;
}

interface PermissionGuardProps extends ProtectedProps {
  /** Resource to check */
  resource: Resource;
  /** Action to check */
  action: Permission["action"];
  /** Tooltip text to show when permission is denied */
  tooltipText?: string;
  /** Show tooltip on hover (default: true) */
  showTooltip?: boolean;
}

interface RoleGuardProps extends ProtectedProps {
  /** Required role level or array of allowed roles */
  require: UserRole | UserRole[];
  /** If true, match exact role. If false (default), match role level or above */
  exact?: boolean;
}

/**
 * Component that shows children only if user has the specified permission
 * @example
 * <PermissionGuard resource="quotes" action="create">
 *   <Button>Create Quote</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  resource,
  action,
  children,
  fallback = null,
  tooltipText,
  showTooltip = true,
}: PermissionGuardProps) {
  const { canUser } = usePermissions();

  if (!canUser(resource, action)) {
    // Wrapper that prevents any clicks on denied resources
    const wrapper = (
      <div
        className="opacity-50 cursor-not-allowed inline-block"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClickCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              disabled: true,
              onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
              },
            } as any);
          }
          return child;
        })}
      </div>
    );

    // Wrap with tooltip if both showTooltip and tooltipText are provided
    if (showTooltip && tooltipText) {
      return (
        <div title={tooltipText}>
          {wrapper}
        </div>
      );
    }

    return wrapper;
  }

  return <>{children}</>;
}

/**
 * Component that shows children only if user has the required role
 * @example
 * <RoleGuard require="admin">
 *   <Button>Admin Only Button</Button>
 * </RoleGuard>
 *
 * @example
 * <RoleGuard require={["admin", "sales_manager"]}>
 *   <Button>Manager+ Button</Button>
 * </RoleGuard>
 */
export function RoleGuard({
  require,
  exact = true,
  children,
  fallback = null
}: RoleGuardProps) {
  const { role } = usePermissions();

  if (!role) {
    return <>{fallback}</>;
  }

  const allowedRoles = Array.isArray(require) ? require : [require];

  // Check if user role is in the allowed roles
  if (!allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that shows children only if user is admin
 * @example
 * <AdminOnly>
 *   <SettingsPanel />
 * </AdminOnly>
 */
export function AdminOnly({ children, fallback = null }: ProtectedProps) {
  return (
    <RoleGuard require="admin" exact>
      {children}
    </RoleGuard>
  );
}

/**
 * Component that shows children only if user is sales manager or admin
 * @example
 * <SalesManagerOnly>
 *   <AnalyticsPanel />
 * </SalesManagerOnly>
 */
export function SalesManagerOnly({ children, fallback = null }: ProtectedProps) {
  return (
    <RoleGuard require={["admin", "sales_manager"]}>
      {children}
    </RoleGuard>
  );
}


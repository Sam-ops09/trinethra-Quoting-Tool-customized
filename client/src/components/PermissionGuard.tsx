import React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import type { ReactNode } from "react";
interface PermissionGuardProps {
  resource: string;
  resource: string;
  action: string;
  fallback?: ReactNode;
  showTooltip?: boolean;
  tooltipText?: string;
}

export function PermissionGuard({
  resource,
  action,
  children,
  fallback = null,
  showTooltip = true,
  tooltipText,
}: PermissionGuardProps) {
  const { canUser } = usePermissions();

  const hasAccess = canUser(resource, action);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showTooltip && tooltipText) {
    return (
      <div
        title={tooltipText}
        className="opacity-50 cursor-not-allowed inline-block"
      >
        {fallback || children}
      </div>
    );
  }

  return <>{fallback}</>;
}



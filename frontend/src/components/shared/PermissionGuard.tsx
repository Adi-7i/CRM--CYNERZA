"use client";

import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/config/permissions";
import { ReactNode } from "react";

interface PermissionGuardProps {
    children: ReactNode;
    permission?: Permission;
    permissions?: Permission[];
    requireAll?: boolean;
    fallback?: ReactNode;
}

/**
 * Component to conditionally render children based on permissions
 * 
 * Usage:
 * <PermissionGuard permission="users:create">
 *   <CreateUserButton />
 * </PermissionGuard>
 * 
 * <PermissionGuard permissions={['leads:delete', 'leads:edit']} requireAll={false}>
 *   <LeadActions />
 * </PermissionGuard>
 */
export function PermissionGuard({
    children,
    permission,
    permissions,
    requireAll = false,
    fallback = null
}: PermissionGuardProps) {
    const { can, canAny, canAll } = usePermission();

    let hasAccess = false;

    if (permission) {
        hasAccess = can(permission);
    } else if (permissions) {
        hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
    } else {
        hasAccess = true; // No permission specified, allow access
    }

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * HOC to wrap components with permission check
 * 
 * Usage:
 * const ProtectedSettings = withPermission(SettingsPage, 'settings:view');
 */
export function withPermission<P extends object>(
    Component: React.ComponentType<P>,
    permission: Permission,
    FallbackComponent?: React.ComponentType
) {
    return function PermissionWrapper(props: P) {
        const { can } = usePermission();

        if (!can(permission)) {
            if (FallbackComponent) {
                return <FallbackComponent />;
            }
            return null;
        }

        return <Component {...props} />;
    };
}

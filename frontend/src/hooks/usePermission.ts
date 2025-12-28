"use client";

import { useAuth } from "@/context/AuthContext";
import { Role, Permission, hasPermission, hasAnyPermission, hasAllPermissions, ROUTE_PERMISSIONS } from "@/config/permissions";

/**
 * Hook to check permissions for the current user
 */
export function usePermission() {
    const { user } = useAuth();
    const role = user?.role as Role | undefined;

    return {
        role,
        /**
         * Check if user has a specific permission
         */
        can: (permission: Permission) => hasPermission(role, permission),

        /**
         * Check if user has any of the given permissions
         */
        canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),

        /**
         * Check if user has all of the given permissions
         */
        canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),

        /**
         * Check if user can access a specific route
         */
        canAccessRoute: (path: string) => {
            const permission = ROUTE_PERMISSIONS[path];
            if (!permission) return true; // Allow unlisted routes
            return hasPermission(role, permission);
        },

        /**
         * Check if user is admin
         */
        isAdmin: role === 'admin',

        /**
         * Check if user is manager or admin
         */
        isManagerOrAbove: role === 'admin' || role === 'manager',
    };
}

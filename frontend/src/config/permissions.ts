/**
 * Centralized Role-Based Access Control Configuration
 * 
 * This file defines all permissions for the CRM application.
 * Roles: admin, manager, sales
 */

export type Role = 'admin' | 'manager' | 'sales';

export type Permission =
    // Navigation permissions
    | 'nav:dashboard'
    | 'nav:leads'
    | 'nav:customers'
    | 'nav:deals'
    | 'nav:tasks'
    | 'nav:users'
    | 'nav:reports'
    | 'nav:settings'
    // Lead permissions
    | 'leads:create'
    | 'leads:edit'
    | 'leads:delete'
    | 'leads:assign'
    | 'leads:convert'
    | 'leads:convert'
    | 'leads:export'
    | 'leads:import'
    // Customer permissions
    | 'customers:create'
    | 'customers:edit'
    | 'customers:delete'
    | 'customers:assign'
    | 'customers:export'
    // Deal permissions
    | 'deals:create'
    | 'deals:edit'
    | 'deals:delete'
    | 'deals:assign'
    | 'deals:export'
    // Task permissions
    | 'tasks:create'
    | 'tasks:edit'
    | 'tasks:delete'
    | 'tasks:assign'
    // User management permissions
    | 'users:view'
    | 'users:create'
    | 'users:edit'
    | 'users:delete'
    // Reports permissions
    | 'reports:view'
    | 'reports:export'
    // Settings permissions
    | 'settings:view'
    | 'settings:edit'
    // Dashboard permissions
    | 'dashboard:view_all_stats'
    | 'dashboard:view_team_stats'
    | 'dashboard:view_own_stats';

/**
 * Permission matrix defining what each role can do
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    admin: [
        // Navigation
        'nav:dashboard', 'nav:leads', 'nav:customers', 'nav:deals',
        'nav:tasks', 'nav:users', 'nav:reports', 'nav:settings',
        // Leads - full access
        'leads:create', 'leads:edit', 'leads:delete', 'leads:assign',
        'leads:create', 'leads:edit', 'leads:delete', 'leads:assign',
        'leads:convert', 'leads:export', 'leads:import',
        // Customers - full access
        'customers:create', 'customers:edit', 'customers:delete',
        'customers:assign', 'customers:export',
        // Deals - full access
        'deals:create', 'deals:edit', 'deals:delete', 'deals:assign', 'deals:export',
        // Tasks - full access
        'tasks:create', 'tasks:edit', 'tasks:delete', 'tasks:assign',
        // Users - full access
        'users:view', 'users:create', 'users:edit', 'users:delete',
        // Reports - full access
        'reports:view', 'reports:export',
        // Settings - full access
        'settings:view', 'settings:edit',
        // Dashboard - full access
        'dashboard:view_all_stats', 'dashboard:view_team_stats', 'dashboard:view_own_stats',
    ],
    manager: [
        // Navigation (no users, settings)
        'nav:dashboard', 'nav:leads', 'nav:customers', 'nav:deals',
        'nav:tasks', 'nav:reports',
        // Leads - full access except delete
        // Leads - full access except delete
        'leads:create', 'leads:edit', 'leads:assign', 'leads:convert', 'leads:export', 'leads:import',
        // Customers - full access except delete
        'customers:create', 'customers:edit', 'customers:assign', 'customers:export',
        // Deals - full access except delete
        'deals:create', 'deals:edit', 'deals:assign', 'deals:export',
        // Tasks - full access
        'tasks:create', 'tasks:edit', 'tasks:delete', 'tasks:assign',
        // Reports - view only
        'reports:view',
        // Dashboard - team stats
        'dashboard:view_team_stats', 'dashboard:view_own_stats',
    ],
    sales: [
        // Navigation (minimal)
        'nav:dashboard', 'nav:leads', 'nav:customers', 'nav:deals', 'nav:tasks',
        // Leads - create and edit assigned only
        'leads:create', 'leads:edit',
        // Customers - create and edit assigned only
        'customers:create', 'customers:edit',
        // Deals - create and edit own only
        'deals:create', 'deals:edit',
        // Tasks - create and edit assigned only
        'tasks:create', 'tasks:edit',
        // Dashboard - own stats only
        'dashboard:view_own_stats',
    ],
};

/**
 * Route to required permission mapping
 */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
    '/dashboard': 'nav:dashboard',
    '/leads': 'nav:leads',
    '/customers': 'nav:customers',
    '/deals': 'nav:deals',
    '/tasks': 'nav:tasks',
    '/users': 'nav:users',
    '/reports': 'nav:reports',
    '/settings': 'nav:settings',
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role | undefined | null, permission: Permission): boolean {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the given permissions
 */
export function hasAnyPermission(role: Role | undefined | null, permissions: Permission[]): boolean {
    if (!role) return false;
    return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role has all of the given permissions
 */
export function hasAllPermissions(role: Role | undefined | null, permissions: Permission[]): boolean {
    if (!role) return false;
    return permissions.every(p => hasPermission(role, p));
}

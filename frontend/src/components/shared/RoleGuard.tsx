"use client";

import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";

interface RoleGuardProps {
    allowedRoles: string[];
    children: ReactNode;
    fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
    const { user } = useAuth();

    // In a real app, user roles would come from the auth context
    // For now, we simulate roles or assume everyone has basic access
    // If you add a role field to your User type, use: 
    // const hasPermission = user && allowedRoles.includes(user.role);

    // Mock implementation: Assume 'admin@crm.com' is ADMIN, others are USER
    const userRole = user?.email === 'admin@crm.com' ? 'ADMIN' : 'USER';
    const hasPermission = allowedRoles.includes(userRole);

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

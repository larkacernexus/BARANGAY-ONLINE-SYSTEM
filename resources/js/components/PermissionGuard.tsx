// resources/js/components/PermissionGuard.tsx
import React, { ReactNode } from 'react';
import usePermissions, { Permission } from '@/utils/permissions';

interface PermissionGuardProps {
    children: ReactNode;
    permission?: Permission;
    any?: Permission[];
    all?: Permission[];
    fallback?: ReactNode;
    showIf?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
    children, 
    permission, 
    any, 
    all, 
    fallback = null,
    showIf = true
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin } = usePermissions();
    
    if (!showIf) {
        return <>{fallback}</>;
    }
    
    let hasAccess = false;
    
    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (any && any.length > 0) {
        hasAccess = hasAnyPermission(any);
    } else if (all && all.length > 0) {
        hasAccess = hasAllPermissions(all);
    } else {
        hasAccess = true; // No restrictions
    }
    
    return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
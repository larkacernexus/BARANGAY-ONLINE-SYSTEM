// components/admin/role-permissions/RolePermissionsStats.tsx
import { StatCard } from '@/components/adminui/stats-grid';
import { Shield, Key, Users, Layers } from 'lucide-react';
import { RolePermission } from '@/admin-utils/rolePermissionsUtils';

interface RolePermissionsStatsProps {
    permissions: RolePermission[];
    totalItems: number;
}

export default function RolePermissionsStats({ permissions, totalItems }: RolePermissionsStatsProps) {
    // Safe calculations with fallbacks
    const safePermissions = permissions || [];
    
    const uniqueRoles = [...new Set(safePermissions.map(rp => rp.role_id))].length;
    const uniquePermissions = [...new Set(safePermissions.map(rp => rp.permission_id))].length;
    const uniqueModules = [...new Set(safePermissions.map(rp => rp.permission?.module))].filter(Boolean).length;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Assignments"
                value={(totalItems || 0).toLocaleString()}
                icon={<Layers className="h-4 w-4 text-blue-500" />}
                description="Permission assignments"
            />
            <StatCard
                title="Active Roles"
                value={uniqueRoles.toLocaleString()}
                icon={<Shield className="h-4 w-4 text-green-500" />}
                description="Roles with permissions"
            />
            <StatCard
                title="Unique Permissions"
                value={uniquePermissions.toLocaleString()}
                icon={<Key className="h-4 w-4 text-purple-500" />}
                description="Distinct permissions"
            />
            <StatCard
                title="Modules"
                value={uniqueModules.toLocaleString()}
                icon={<Users className="h-4 w-4 text-amber-500" />}
                description="Active modules"
            />
        </div>
    );
}
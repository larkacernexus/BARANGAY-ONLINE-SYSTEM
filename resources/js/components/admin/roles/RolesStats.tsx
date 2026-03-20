// components/admin/roles/RolesStats.tsx
import { StatCard } from '@/components/adminui/stats-grid';
import { Shield, Users, Edit, Key } from 'lucide-react';

interface RolesStatsProps {
    stats: {
        total: number;
        system: number;
        custom: number;
        users: number;
    };
}

export default function RolesStats({ stats }: RolesStatsProps) {
    // Safe stats with fallbacks
    const safeStats = {
        total: stats?.total || 0,
        system: stats?.system || 0,
        custom: stats?.custom || 0,
        users: stats?.users || 0
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Roles"
                value={safeStats.total.toLocaleString()}
                icon={<Key className="h-4 w-4 text-blue-500" />}
                description="All roles in the system"
            />
            <StatCard
                title="System Roles"
                value={safeStats.system.toLocaleString()}
                icon={<Shield className="h-4 w-4 text-purple-500" />}
                description="Predefined system roles"
            />
            <StatCard
                title="Custom Roles"
                value={safeStats.custom.toLocaleString()}
                icon={<Edit className="h-4 w-4 text-green-500" />}
                description="User-created custom roles"
            />
            <StatCard
                title="Users with Roles"
                value={safeStats.users.toLocaleString()}
                icon={<Users className="h-4 w-4 text-amber-500" />}
                description="Users assigned to roles"
            />
        </div>
    );
}
// components/admin/residents/ResidentsStats.tsx
import { Users, UserCheck, UserX, UsersRound, UserCog, Hash, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/adminui/stats-grid';

interface ResidentsStatsProps {
    stats?: {
        total?: number;
        active?: number;
        inactive?: number;
        voters?: number;
        heads?: number;
        averageAge?: number;
        growthRate?: number;
    };
}

export default function ResidentsStats({ stats }: ResidentsStatsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Residents"
                value={Number(stats?.total || 0).toLocaleString()}
                icon={<Users className="h-4 w-4 text-blue-500" />}
                description="All residents"
                trend="up"
            />
            <StatCard
                title="Active"
                value={Number(stats?.active || 0).toLocaleString()}
                icon={<UserCheck className="h-4 w-4 text-green-500" />}
                description="Registered residents"
                trend="up"
            />
            <StatCard
                title="Voters"
                value={Number(stats?.voters || 0).toLocaleString()}
                icon={<UsersRound className="h-4 w-4 text-purple-500" />}
                description="Registered voters"
                trend="up"
            />
            <StatCard
                title="Household Heads"
                value={Number(stats?.heads || 0).toLocaleString()}
                icon={<UserCog className="h-4 w-4 text-amber-500" />}
                description="Family heads"
                trend="up"
            />
        </div>
    );
}
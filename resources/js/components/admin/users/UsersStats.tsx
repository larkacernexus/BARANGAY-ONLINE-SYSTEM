import { StatCard } from '@/components/adminui/stats-grid';
import { Users, UserCheck, UserX, UserCog } from 'lucide-react';

interface UsersStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
  };
}

export default function UsersStats({ stats }: UsersStatsProps) {
  // Safe stats with fallbacks
  const safeStats = {
    total: stats?.total || 0,
    active: stats?.active || 0,
    inactive: stats?.inactive || 0,
    admins: stats?.admins || 0
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Users"
        value={safeStats.total.toLocaleString()}
        icon={<Users className="h-4 w-4 text-blue-500" />}
        description="All registered users"
      />
      <StatCard
        title="Active Users"
        value={safeStats.active.toLocaleString()}
        icon={<UserCheck className="h-4 w-4 text-green-500" />}
        description="Currently active accounts"
      />
      <StatCard
        title="Inactive Users"
        value={safeStats.inactive.toLocaleString()}
        icon={<UserX className="h-4 w-4 text-gray-500" />}
        description="Disabled or inactive accounts"
      />
      <StatCard
        title="Administrators"
        value={safeStats.admins.toLocaleString()}
        icon={<UserCog className="h-4 w-4 text-amber-500" />}
        description="Users with admin privileges"
      />
    </div>
  );
}
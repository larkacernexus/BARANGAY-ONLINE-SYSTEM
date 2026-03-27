// components/admin/users/UsersStats.tsx
import { StatCard } from '@/components/adminui/stats-grid';
import { Users, UserCheck, UserX, UserCog } from 'lucide-react';
import { UsersStatsProps } from '@/types/admin/users/user-types';

export default function UsersStats({ stats, isLoading, onStatClick }: UsersStatsProps) {
  // Safe stats with fallbacks
  const safeStats = {
    total: stats?.find(s => s.label === 'Total Users')?.value || 0,
    active: stats?.find(s => s.label === 'Active Users')?.value || 0,
    inactive: stats?.find(s => s.label === 'Inactive Users')?.value || 0,
    admins: stats?.find(s => s.label === 'Administrators')?.value || 0
  };

  const statsConfig = [
    {
      title: "Total Users",
      value: safeStats.total,
      icon: <Users className="h-4 w-4 text-blue-500" />,
      description: "All registered users",
      color: "blue"
    },
    {
      title: "Active Users",
      value: safeStats.active,
      icon: <UserCheck className="h-4 w-4 text-green-500" />,
      description: "Currently active accounts",
      color: "green"
    },
    {
      title: "Inactive Users",
      value: safeStats.inactive,
      icon: <UserX className="h-4 w-4 text-gray-500" />,
      description: "Disabled or inactive accounts",
      color: "gray"
    },
    {
      title: "Administrators",
      value: safeStats.admins,
      icon: <UserCog className="h-4 w-4 text-amber-500" />,
      description: "Users with admin privileges",
      color: "amber"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value.toLocaleString()}
          icon={stat.icon}
          description={stat.description}
          onClick={() => onStatClick?.(stats[index])}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
import { StatCard } from '@/components/adminui/stats-grid';
import { Users, UserCheck, UserX, UserCog } from 'lucide-react';
import { UsersStatsProps, UserStat } from '@/types/admin/users/user-types';

interface StatsItem {
  label: string;
  value: number;
}

interface StatsObject {
  total: number;
  active: number;
  inactive: number;
  new_this_month?: number;
  by_role?: Record<string, number>;
  by_status?: Record<string, number>;
}

export default function UsersStats({ stats, isLoading, onStatClick }: UsersStatsProps) {
  // Helper to safely get stats value regardless of format
  const getStatValue = (label: string): number => {
    // If stats is an array
    if (Array.isArray(stats)) {
      const stat = stats.find(s => s.label === label);
      return stat?.value || 0;
    }
    
    // If stats is an object
    if (stats && typeof stats === 'object') {
      switch (label) {
        case 'Total Users':
          return (stats as StatsObject)?.total || 0;
        case 'Active Users':
          return (stats as StatsObject)?.active || 0;
        case 'Inactive Users':
          return (stats as StatsObject)?.inactive || 0;
        case 'Administrators':
          // Get admin count from by_role or default to 0
          const byRole = (stats as StatsObject)?.by_role;
          if (byRole && typeof byRole === 'object') {
            // Try to find admin role (role_id 1 is typically admin)
            return byRole['1'] || Object.values(byRole).find(v => v > 0) as number || 0;
          }
          return 0;
        default:
          return 0;
      }
    }
    
    return 0;
  };

  const statsConfig = [
    {
      title: "Total Users",
      value: getStatValue('Total Users'),
      icon: <Users className="h-4 w-4 text-blue-500" />,
      description: "All registered users",
      color: "blue"
    },
    {
      title: "Active Users",
      value: getStatValue('Active Users'),
      icon: <UserCheck className="h-4 w-4 text-green-500" />,
      description: "Currently active accounts",
      color: "green"
    },
    {
      title: "Inactive Users",
      value: getStatValue('Inactive Users'),
      icon: <UserX className="h-4 w-4 text-gray-500" />,
      description: "Disabled or inactive accounts",
      color: "gray"
    },
    {
      title: "Administrators",
      value: getStatValue('Administrators'),
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
          onClick={() => {
            if (onStatClick && stats && Array.isArray(stats)) {
              onStatClick(stats[index]);
            } else if (onStatClick) {
              // For object format, pass a compatible object
              onStatClick({ label: stat.title, value: stat.value });
            }
          }}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
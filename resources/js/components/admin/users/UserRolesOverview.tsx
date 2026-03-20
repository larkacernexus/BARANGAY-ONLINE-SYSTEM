import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  count: number;
}

interface UserRolesOverviewProps {
  roles: Role[];
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  isLoading?: boolean;
}

export default function UserRolesOverview({ 
  roles, 
  roleFilter, 
  setRoleFilter,
  isLoading = false
}: UserRolesOverviewProps) {
  const truncateText = (text: string | null, maxLength: number = 15): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Different colors for different roles
  const getRoleColor = (roleName: string) => {
    const colors = {
      'admin': 'bg-red-500',
      'staff': 'bg-blue-500',
      'treasurer': 'bg-green-500',
      'secretary': 'bg-purple-500',
      'captain': 'bg-amber-500',
      'councilor': 'bg-indigo-500',
      'sk': 'bg-pink-500',
      'default': 'bg-gray-500'
    };
    
    const key = roleName.toLowerCase();
    return colors[key as keyof typeof colors] || colors.default;
  };

  return (
    <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
          <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          User Roles
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
                <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {roles.map((role) => (
              <div 
                key={role.id} 
                className={`border rounded-lg p-3 sm:p-4 transition-all duration-200 cursor-pointer ${
                  roleFilter === role.id.toString() 
                    ? 'ring-2 ring-primary-500 dark:ring-primary-400 border-transparent bg-primary-50 dark:bg-primary-950/30' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                }`}
                onClick={() => setRoleFilter(role.id.toString())}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setRoleFilter(role.id.toString());
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${getRoleColor(role.name)}`} />
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={role.name}>
                    {truncateText(role.name, 15)}
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                  {role.count}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {role.count === 1 ? 'user' : 'users'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
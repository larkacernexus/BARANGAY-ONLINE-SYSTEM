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
}

export default function UserRolesOverview({ 
  roles, 
  roleFilter, 
  setRoleFilter 
}: UserRolesOverviewProps) {
  const truncateText = (text: string | null, maxLength: number = 15): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          User Roles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {roles.map((role) => (
            <div 
              key={role.id} 
              className={`border rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                roleFilter === role.id.toString() ? 'ring-2 ring-primary-500' : ''
              }`}
              onClick={() => setRoleFilter(role.id.toString())}
            >
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full bg-blue-500`} />
                <div className="text-sm font-medium truncate" title={role.name}>
                  {truncateText(role.name, 15)}
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold mt-2">{role.count}</div>
              <div className="text-xs text-gray-500 truncate">users</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
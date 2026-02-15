import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function UsersPermissionsOverview() {
  const permissions = [
    {
      role: 'Administrator',
      permissions: ['Full system access', 'User management', 'System configuration', 'Audit logs access']
    },
    {
      role: 'Treasury Officer',
      permissions: ['Payment management', 'Financial reports', 'Receipt generation', 'Tax collection']
    },
    {
      role: 'Records Clerk',
      permissions: ['Resident registration', 'Household management', 'Data entry', 'Basic reports']
    }
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">System Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {permissions.map((item) => (
            <div key={item.role} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <h4 className="font-medium mb-2 truncate" title={item.role}>
                {item.role}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {item.permissions.map((permission, index) => (
                  <li key={index} className="truncate">• {permission}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
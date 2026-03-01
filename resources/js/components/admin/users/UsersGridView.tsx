import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { Link } from '@inertiajs/react';
import {
  Mail,
  Copy,
  User as UserIcon,
  Shield,
  Calendar,
  Phone,
  Briefcase,
  CheckCircle,
  XCircle,
  Key,
  Lock,
  Unlock,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { User } from '@/types';

interface UsersGridViewProps {
  users: User[];
  isBulkMode: boolean;
  selectedUsers: number[];
  onItemSelect: (id: number) => void;
  isMobile?: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onCopyToClipboard: (text: string, label: string) => void;
}

export default function UsersGridView({
  users,
  isBulkMode,
  selectedUsers,
  onItemSelect,
  isMobile = false,
  hasActiveFilters,
  onClearFilters,
  onDelete,
  onToggleStatus,
  onCopyToClipboard
}: UsersGridViewProps) {
  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'active': 'default',
      'inactive': 'secondary',
      'suspended': 'destructive',
      'pending': 'outline'
    };
    return variants[status] || 'outline';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      'active': <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
      'inactive': <XCircle className="h-3.5 w-3.5 text-gray-500" />,
    };
    return icons[status] || null;
  };

  const getRoleBadgeVariant = (roleName: string | undefined) => {
    if (!roleName) return 'outline';
    
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Administrator': 'destructive',
      'Admin': 'destructive',
      'Super Admin': 'destructive',
    };
    return variants[roleName] || 'outline';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string | null, maxLength: number = 20): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getFullName = (user: User): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.last_name) {
      return user.last_name;
    } else {
      return user.email;
    }
  };

  const emptyState = (
    <EmptyState
      title="No users found"
      description={hasActiveFilters 
        ? 'Try changing your filters or search criteria.'
        : 'Get started by creating a user account.'}
      icon={<UserIcon className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
      hasFilters={hasActiveFilters}
      onClearFilters={onClearFilters}
      onCreateNew={() => window.location.href = '/admin/users/create'}
      createLabel="Create User"
    />
  );

  return (
    <GridLayout
      isEmpty={users.length === 0}
      emptyState={emptyState}
      gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
      gap={{ base: '3', sm: '4' }}
      padding="p-4"
    >
      {users.map((user) => {
        const isSelected = selectedUsers.includes(user.id);
        const fullName = getFullName(user);
        const roleName = user.role?.name || 'N/A';
        const departmentName = user.department?.name || 'N/A';

        return (
          <Card 
            key={user.id}
            className={`overflow-hidden transition-all hover:shadow-md ${
              isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
            }`}
            onClick={(e) => {
              if (isBulkMode && e.target instanceof HTMLElement && 
                  !e.target.closest('a') && 
                  !e.target.closest('button') &&
                  !e.target.closest('.dropdown-menu-content')) {
                onItemSelect(user.id);
              }
            }}
          >
            <CardContent className="p-4">
              {/* Header with Checkbox and ActionDropdown */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      {truncateText(fullName, isMobile ? 15 : 20)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {isBulkMode && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onItemSelect(user.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  )}
                  {/* USE ACTIONDROPDOWN - THREE DOTS MENU */}
                  <ActionDropdown>
                    <ActionDropdownItem
                      icon={<Eye className="h-4 w-4" />}
                      href={`/admin/users/${user.id}`}
                    >
                      View Profile
                    </ActionDropdownItem>
                    
                    <ActionDropdownItem
                      icon={<Edit className="h-4 w-4" />}
                      href={`/admin/users/${user.id}/edit`}
                    >
                      Edit User
                    </ActionDropdownItem>
                    
                    <ActionDropdownSeparator />
                    
                    <ActionDropdownItem
                      icon={<Copy className="h-4 w-4" />}
                      onClick={() => onCopyToClipboard(user.email, 'Email')}
                    >
                      Copy Email
                    </ActionDropdownItem>
                    
                    <ActionDropdownItem
                      icon={<Mail className="h-4 w-4" />}
                      href={`mailto:${user.email}`}
                    >
                      Send Email
                    </ActionDropdownItem>
                    
                    <ActionDropdownSeparator />
                    
                    <ActionDropdownItem
                      icon={user.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      onClick={() => onToggleStatus(user)}
                    >
                      {user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                    </ActionDropdownItem>
                    
                    <ActionDropdownSeparator />
                    
                    <ActionDropdownItem
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => onDelete(user)}
                      dangerous
                    >
                      Delete User
                    </ActionDropdownItem>
                  </ActionDropdown>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {/* Status and Role Badges */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <Badge 
                    variant={getStatusBadgeVariant(user.status)} 
                    className="text-xs flex items-center gap-1"
                  >
                    {getStatusIcon(user.status)}
                    <span className="capitalize">{user.status}</span>
                  </Badge>
                  <Badge 
                    variant={getRoleBadgeVariant(roleName)}
                    className="text-xs"
                  >
                    {truncateText(roleName, 12)}
                  </Badge>
                </div>

                {/* User Details */}
                <div className="space-y-2 text-sm">
                  {user.position && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {truncateText(user.position, 25)}
                      </span>
                    </div>
                  )}
                  
                  {user.contact_number && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{truncateText(user.contact_number, 15)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-gray-600">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {truncateText(departmentName, 25)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Joined {formatDate(user.created_at)}</span>
                  </div>

                  {user.two_factor_confirmed_at && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Key className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-green-600">2FA Enabled</span>
                    </div>
                  )}
                </div>

                {/* Mobile simplified view */}
                {isMobile && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{truncateText(departmentName, 15)}</span>
                      <span>{formatDate(user.created_at)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </GridLayout>
  );
}
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Trash2,
  MoreVertical,
  MessageSquare,
  CheckSquare,
  Square
} from 'lucide-react';
import { User } from '@/types';
import { JSX } from 'react';

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
  onSendMessage?: (user: User) => void;
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
  onCopyToClipboard,
  onSendMessage
}: UsersGridViewProps) {
  // Helper function to safely get string values from unknown
  const getStringValue = (value: unknown, defaultValue: string = ''): string => {
    if (typeof value === 'string') {
      return value;
    }
    return defaultValue;
  };

  // Helper function to safely get status string
  const getStatusString = (status: unknown): string => {
    if (typeof status === 'string') {
      return status;
    }
    return 'unknown';
  };

  const getStatusBadgeVariant = (status: unknown): "default" | "secondary" | "destructive" | "outline" => {
    const statusStr = getStringValue(status, 'unknown');
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'active': 'default',
      'inactive': 'secondary',
      'suspended': 'destructive',
      'pending': 'outline',
      'unknown': 'outline'
    };
    return variants[statusStr] || 'outline';
  };

  const getStatusIcon = (status: unknown): JSX.Element | null => {
    const statusStr = getStringValue(status, 'unknown');
    const icons: Record<string, JSX.Element> = {
      'active': <CheckCircle className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />,
      'inactive': <XCircle className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />,
    };
    return icons[statusStr] || null;
  };

  const getRoleBadgeVariant = (roleName: unknown): "default" | "secondary" | "destructive" | "outline" => {
    const roleStr = getStringValue(roleName, '');
    if (!roleStr) return 'outline';
    
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Administrator': 'destructive',
      'Admin': 'destructive',
      'Super Admin': 'destructive',
    };
    return variants[roleStr] || 'outline';
  };

  const formatDate = (dateString: unknown): string => {
    if (typeof dateString !== 'string' || !dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: unknown, maxLength: number = 20): string => {
    if (typeof text !== 'string' || !text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Type guard to check if an object has the expected shape
  const isValidRoleObject = (role: unknown): role is { name: string } => {
    return typeof role === 'object' && role !== null && 'name' in role && typeof (role as any).name === 'string';
  };

  const isValidDepartmentObject = (dept: unknown): dept is { name: string } => {
    return typeof dept === 'object' && dept !== null && 'name' in dept && typeof (dept as any).name === 'string';
  };

  const getFullName = (user: User): string => {
    // Use type assertion or safe property access
    const firstName = (user as any).first_name;
    const lastName = (user as any).last_name;
    
    if (firstName && lastName && typeof firstName === 'string' && typeof lastName === 'string') {
      return `${firstName} ${lastName}`.trim();
    } else if (firstName && typeof firstName === 'string') {
      return firstName;
    } else if (lastName && typeof lastName === 'string') {
      return lastName;
    } else {
      return user.email;
    }
  };

  // Helper function to safely access role name
  const getRoleName = (user: User): string => {
    if (isValidRoleObject(user.role)) {
      return user.role.name;
    }
    if (typeof user.role === 'string') {
      return user.role;
    }
    return 'N/A';
  };

  // Helper function to safely access department name
  const getDepartmentName = (user: User): string => {
    if (isValidDepartmentObject(user.department)) {
      return user.department.name;
    }
    return 'N/A';
  };

  // Helper function to safely access position
  const getPosition = (user: User): string | null => {
    const position = (user as any).position;
    return typeof position === 'string' ? position : null;
  };

  // Helper function to safely access contact number
  const getContactNumber = (user: User): string | null => {
    const contactNumber = (user as any).contact_number;
    return typeof contactNumber === 'string' ? contactNumber : null;
  };

  // Helper function to safely access two_factor_confirmed_at
  const getTwoFactorConfirmedAt = (user: User): string | null => {
    const twoFactor = (user as any).two_factor_confirmed_at;
    return typeof twoFactor === 'string' ? twoFactor : null;
  };

  const emptyState = (
    <EmptyState
      title="No users found"
      description={hasActiveFilters 
        ? 'Try changing your filters or search criteria.'
        : 'Get started by creating a user account.'}
      icon={<UserIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
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
        const roleName = getRoleName(user);
        const departmentName = getDepartmentName(user);
        const position = getPosition(user);
        const contactNumber = getContactNumber(user);
        const twoFactorConfirmedAt = getTwoFactorConfirmedAt(user);
        const status = getStatusString((user as any).status);

        return (
          <Card 
            key={user.id}
            className={`overflow-hidden transition-all hover:shadow-md bg-white dark:bg-gray-900 border ${
              isSelected 
                ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
            onClick={(e) => {
              if (isBulkMode && e.target instanceof HTMLElement && 
                  !e.target.closest('a') && 
                  !e.target.closest('button') &&
                  !e.target.closest('[role="menuitem"]') &&
                  !e.target.closest('[data-radix-menu-content]')) {
                onItemSelect(user.id);
              }
            }}
          >
            <CardContent className="p-4">
              {/* Header with Checkbox and DropdownMenu */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {truncateText(fullName, isMobile ? 15 : 20)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                    />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Eye className="h-4 w-4" />
                          <span>View Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                          <Edit className="h-4 w-4" />
                          <span>Edit User</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          onCopyToClipboard(user.email, 'Email');
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy Email</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          onCopyToClipboard(fullName, 'Name');
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy Name</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <a 
                          href={`mailto:${user.email}`}
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="h-4 w-4" />
                          <span>Send Email</span>
                        </a>
                      </DropdownMenuItem>

                      {onSendMessage && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            onSendMessage(user);
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Send Message</span>
                        </DropdownMenuItem>
                      )}

                      {isBulkMode && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              onItemSelect(user.id);
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {isSelected ? (
                              <>
                                <CheckSquare className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">Deselect</span>
                              </>
                            ) : (
                              <>
                                <Square className="h-4 w-4" />
                                <span>Select for Bulk</span>
                              </>
                            )}
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          onToggleStatus(user);
                        }}
                        className={`flex items-center gap-2 cursor-pointer ${
                          status === 'active' 
                            ? 'text-amber-600 dark:text-amber-400 focus:text-amber-700 dark:focus:text-amber-300 focus:bg-amber-50 dark:focus:bg-amber-950/30' 
                            : 'text-green-600 dark:text-green-400 focus:text-green-700 dark:focus:text-green-300 focus:bg-green-50 dark:focus:bg-green-950/30'
                        }`}
                      >
                        {status === 'active' 
                          ? <Lock className="h-4 w-4" /> 
                          : <Unlock className="h-4 w-4" />
                        }
                        <span>{status === 'active' ? 'Deactivate User' : 'Activate User'}</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          onDelete(user);
                        }}
                        className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete User</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {/* Status and Role Badges */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <Badge 
                    variant={getStatusBadgeVariant(status)} 
                    className={`text-xs flex items-center gap-1 ${
                      status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : status === 'inactive'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        : status === 'suspended'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {getStatusIcon(status)}
                    <span className="capitalize">{status}</span>
                  </Badge>
                  <Badge 
                    variant={getRoleBadgeVariant(roleName)}
                    className={`text-xs ${
                      roleName === 'Administrator' || roleName === 'Admin' || roleName === 'Super Admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}
                  >
                    {truncateText(roleName, 12)}
                  </Badge>
                </div>

                {/* User Details */}
                <div className="space-y-2 text-sm">
                  {position && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {truncateText(position, 25)}
                      </span>
                    </div>
                  )}
                  
                  {contactNumber && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{truncateText(contactNumber, 15)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {truncateText(departmentName, 25)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Joined {formatDate(user.created_at)}</span>
                  </div>

                  {twoFactorConfirmedAt && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Key className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400">2FA Enabled</span>
                    </div>
                  )}
                </div>

                {/* Mobile simplified view */}
                {isMobile && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
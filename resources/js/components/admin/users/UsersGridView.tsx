// components/admin/users/UsersGridView.tsx

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
  Square,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { User } from '@/types/admin/users/user-types';
import { JSX, useState, useMemo, useCallback, useEffect } from 'react';

interface UsersGridViewProps {
  users: User[];
  isBulkMode: boolean;
  selectedUsers: number[];
  onItemSelect: (id: number) => void;
  isMobile?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onDelete?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onCopyToClipboard?: (text: string, label: string) => void;
  onSendMessage?: (user: User) => void;
  onUserClick?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  windowWidth?: number;
}

export default function UsersGridView({
  users,
  isBulkMode,
  selectedUsers,
  onItemSelect,
  isMobile = false,
  hasActiveFilters = false,
  onClearFilters = () => {},
  onDelete = () => {},
  onToggleStatus = () => {},
  onCopyToClipboard = () => {},
  onSendMessage,
  onUserClick,
  onUserEdit,
  canEdit = true,
  canDelete = true,
  windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: UsersGridViewProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  
  useEffect(() => {
    setDevicePixelRatio(window.devicePixelRatio || 1);
  }, []);
  
  const isCompactView = isMobile;
  
  // Determine grid columns - 3 for laptops, 4 for wide screens
  const gridCols = useMemo(() => {
    if (windowWidth < 640) return 1;      // Mobile: 1 column
    if (windowWidth < 1024) return 2;     // Tablet: 2 columns
    if (windowWidth < 1800) return 3;     // Laptop (including 110% scaling): 3 columns
    return 4;                              // Wide desktop: 4 columns
  }, [windowWidth, devicePixelRatio]);

  const getStringValue = (value: unknown, defaultValue: string = ''): string => {
    if (typeof value === 'string') {
      return value;
    }
    return defaultValue;
  };

  const getStatusString = (status: unknown): string => {
    if (typeof status === 'string') {
      return status;
    }
    return 'unknown';
  };

  const getStatusColor = (status: unknown): string => {
    const statusStr = getStringValue(status, 'unknown');
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      'inactive': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
      'suspended': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
      'unknown': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    };
    return colors[statusStr] || colors.unknown;
  };

  const getStatusIcon = (status: unknown): JSX.Element | null => {
    const statusStr = getStringValue(status, 'unknown');
    const icons: Record<string, JSX.Element> = {
      'active': <CheckCircle className="h-3 w-3" />,
      'inactive': <XCircle className="h-3 w-3" />,
    };
    return icons[statusStr] || null;
  };

  const getRoleColor = (roleName: unknown): string => {
    const roleStr = getStringValue(roleName, '');
    if (roleStr === 'Administrator' || roleStr === 'Admin' || roleStr === 'Super Admin') {
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
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

  const isValidRoleObject = (role: unknown): role is { name: string } => {
    return typeof role === 'object' && role !== null && 'name' in role && typeof (role as any).name === 'string';
  };

  const isValidDepartmentObject = (dept: unknown): dept is { name: string } => {
    return typeof dept === 'object' && dept !== null && 'name' in dept && typeof (dept as any).name === 'string';
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

  const getRoleName = (user: User): string => {
    if (isValidRoleObject(user.role)) {
      return user.role.name;
    }
    if (typeof user.role === 'string') {
      return user.role;
    }
    return 'N/A';
  };

  const getDepartmentName = (user: User): string => {
    if (isValidDepartmentObject(user.department)) {
      return user.department.name;
    }
    return 'N/A';
  };

  const getPosition = (user: User): string | null => {
    const position = (user as any).position;
    return typeof position === 'string' ? position : null;
  };

  const getContactNumber = (user: User): string | null => {
    const contactNumber = (user as any).contact_number;
    return typeof contactNumber === 'string' ? contactNumber : null;
  };

  const getTwoFactorConfirmedAt = (user: User): string | null => {
    const twoFactor = (user as any).two_factor_confirmed_at;
    return typeof twoFactor === 'string' ? twoFactor : null;
  };

  // Toggle card expansion
  const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  // Handle card click
  const handleCardClick = (user: User, e: React.MouseEvent) => {
    if (isBulkMode) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    handleToggleExpand(user.id, e);
  };
  
  // Memoize selected set for quick lookup
  const selectedSet = useMemo(() => new Set(selectedUsers), [selectedUsers]);

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

  // Early return for empty state
  if (users.length === 0) {
    return emptyState;
  }

  return (
    <GridLayout
      isEmpty={false}
      emptyState={null}
      gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
      gap={{ base: '3', sm: '4' }}
      padding="p-4"
    >
      {users.map((user) => {
        const isSelected = selectedSet.has(user.id);
        const isExpanded = expandedId === user.id;
        const fullName = getFullName(user);
        const roleName = getRoleName(user);
        const departmentName = getDepartmentName(user);
        const position = getPosition(user);
        const contactNumber = getContactNumber(user);
        const twoFactorConfirmedAt = getTwoFactorConfirmedAt(user);
        const status = getStatusString(user.status);
        
        // Truncation lengths based on view
        const nameLength = isCompactView ? 18 : 22;
        const emailLength = isCompactView ? 20 : 25;

        return (
          <Card 
            key={user.id}
            className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
              isSelected 
                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
            } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
            onClick={(e) => handleCardClick(user, e)}
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {truncateText(fullName, nameLength)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {truncateText(user.email, emailLength)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  {isBulkMode && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onItemSelect(user.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}`} className="flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      
                      {canEdit && onUserEdit && (
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}/edit`} className="flex items-center">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onCopyToClipboard(user.email, 'Email');
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Email
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onCopyToClipboard(fullName, 'Name');
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Name
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <a href={`mailto:${user.email}`} className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </a>
                      </DropdownMenuItem>

                      {onSendMessage && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onSendMessage(user);
                        }}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                      )}

                      {isBulkMode && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onItemSelect(user.id);
                          }}>
                            {isSelected ? (
                              <>
                                <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                                <span className="text-green-600">Deselect</span>
                              </>
                            ) : (
                              <>
                                <Square className="h-4 w-4 mr-2" />
                                Select for Bulk
                              </>
                            )}
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(user);
                      }}>
                        {status === 'active' ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Deactivate User
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Activate User
                          </>
                        )}
                      </DropdownMenuItem>
                      
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(user);
                            }}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge 
                  variant="outline" 
                  className={`text-xs px-2 py-0.5 ${getStatusColor(status)}`}
                >
                  {getStatusIcon(status)}
                  <span className="ml-1 capitalize">{status}</span>
                </Badge>
                <Badge 
                  variant="outline"
                  className={`text-xs px-2 py-0.5 ${getRoleColor(roleName)}`}
                >
                  {truncateText(roleName, 15)}
                </Badge>
              </div>

              {/* Primary Info */}
              <div className="space-y-2 mb-2">
                {position && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{truncateText(position, 25)}</span>
                  </div>
                )}
                
                {contactNumber && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{truncateText(contactNumber, 15)}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{truncateText(departmentName, 20)}</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Joined {formatDate(user.created_at)}</span>
                </div>

                {twoFactorConfirmedAt && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Key className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-green-600 dark:text-green-400">2FA Enabled</span>
                  </div>
                )}
              </div>

              {/* Expand/Collapse indicator */}
              {!isBulkMode && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {isExpanded ? 'Hide details' : 'Click to view details'}
                  </div>
                  <button
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={(e) => handleToggleExpand(user.id, e)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              )}

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50">
                  {/* Email Verified Status */}
                  <div className="flex items-center gap-2 text-sm">
                    {user.email_verified_at ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Email Verified</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-auto">
                          {formatDate(user.email_verified_at)}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400">Email Not Verified</span>
                      </>
                    )}
                  </div>

                  {/* Last Login */}
                  {(user as any).last_login_at && (
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Last Login:</span>
                      <span className="text-gray-900 dark:text-white ml-1">
                        {formatDate((user as any).last_login_at)}
                      </span>
                    </div>
                  )}

                  {/* Created/Updated Dates */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(user.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                      <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(user.updated_at)}</span>
                    </div>
                  </div>

                  {/* View full details link */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View full profile
                    </Link>
                    <button
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={(e) => handleToggleExpand(user.id, e)}
                    >
                      <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </GridLayout>
  );
}
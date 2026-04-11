// components/admin/roles/RolesGridView.tsx
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
  Shield,
  Users,
  Key,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';
import { Role } from '@/types/admin/roles/roles';
import { JSX } from 'react';

interface RolesGridViewProps {
  roles: Role[];
  isBulkMode: boolean;
  selectedRoles: number[];
  onItemSelect: (id: number) => void;
  isMobile?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onDelete?: (role: Role) => void;
  onCopyToClipboard?: (text: string, label: string) => void;
  onRoleClick?: (role: Role) => void;
  onRoleEdit?: (role: Role) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function RolesGridView({
  roles,
  isBulkMode,
  selectedRoles,
  onItemSelect,
  isMobile = false,
  hasActiveFilters = false,
  onClearFilters = () => {},
  onDelete = () => {},
  onCopyToClipboard = () => {},
  onRoleClick,
  onRoleEdit,
  canEdit = true,
  canDelete = true
}: RolesGridViewProps) {
  
  const getStringValue = (value: unknown, defaultValue: string = ''): string => {
    if (typeof value === 'string') {
      return value;
    }
    return defaultValue;
  };

  const getRoleTypeBadgeVariant = (isSystemRole: boolean): "default" | "secondary" | "destructive" | "outline" => {
    return isSystemRole ? 'secondary' : 'default';
  };

  const getRoleTypeBadgeClass = (isSystemRole: boolean): string => {
    return isSystemRole 
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
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

  const canDeleteRole = (role: Role): boolean => {
    return !role.is_system_role && (role.users_count ?? 0) === 0;
  };

  const getDeleteDisabledReason = (role: Role): string => {
    if (role.is_system_role) return 'System roles cannot be deleted';
    if ((role.users_count ?? 0) > 0) return 'Roles with assigned users cannot be deleted';
    return '';
  };

  const emptyState = (
    <EmptyState
      title="No roles found"
      description={hasActiveFilters 
        ? 'Try changing your filters or search criteria.'
        : 'Get started by creating a role.'}
      icon={<Shield className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
      hasFilters={hasActiveFilters}
      onClearFilters={onClearFilters}
      onCreateNew={() => window.location.href = '/admin/roles/create'}
      createLabel="Create Role"
    />
  );

  const handleCardClick = (role: Role, e: React.MouseEvent) => {
    if (isBulkMode && e.target instanceof HTMLElement && 
        !e.target.closest('a') && 
        !e.target.closest('button') &&
        !e.target.closest('[role="menuitem"]') &&
        !e.target.closest('[data-radix-menu-content]')) {
      onItemSelect(role.id);
    } else if (!isBulkMode && onRoleClick) {
      onRoleClick(role);
    }
  };

  return (
    <GridLayout
      isEmpty={roles.length === 0}
      emptyState={emptyState}
      gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
      gap={{ base: '3', sm: '4' }}
      padding="p-4"
    >
      {roles.map((role) => {
        const isSelected = selectedRoles.includes(role.id);
        const usersCount = role.users_count ?? 0;
        const permissionsCount = role.permissions_count ?? 0;
        const deletable = canDeleteRole(role);
        const deleteDisabledReason = getDeleteDisabledReason(role);
        const typeBadgeClass = getRoleTypeBadgeClass(role.is_system_role);
        
        return (
          <Card 
            key={role.id}
            className={`overflow-hidden transition-all hover:shadow-md bg-white dark:bg-gray-900 border cursor-pointer ${
              isSelected 
                ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
            onClick={(e) => handleCardClick(role, e)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    role.is_system_role 
                      ? 'bg-purple-100 dark:bg-purple-900/30' 
                      : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    <Shield className={`h-5 w-5 ${
                      role.is_system_role 
                        ? 'text-purple-600 dark:text-purple-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate" title={role.name}>
                      {truncateText(role.name, isMobile ? 15 : 20)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={role.slug}>
                      {truncateText(role.slug, 25)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {isBulkMode && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onItemSelect(role.id)}
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
                        <Link href={`/admin/roles/${role.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      {canEdit && onRoleEdit && (
                        <DropdownMenuItem asChild>
                          <Link 
                            href={`/admin/roles/${role.id}/edit`} 
                            className={`flex items-center gap-2 cursor-pointer ${role.is_system_role ? 'opacity-50 pointer-events-none' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                            aria-disabled={role.is_system_role}
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit Role</span>
                            {role.is_system_role && (
                              <span className="ml-auto text-xs text-muted-foreground">
                                System
                              </span>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem asChild>
                        <Link 
                          href={`/admin/roles/${role.id}/permissions`} 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Key className="h-4 w-4" />
                          <span>Manage Permissions</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onCopyToClipboard(role.name, 'Role Name');
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy Name</span>
                      </DropdownMenuItem>
                      
                      {role.description && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onCopyToClipboard(role.description!, 'Role Description');
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Copy className="h-4 w-4" />
                          <span>Copy Description</span>
                        </DropdownMenuItem>
                      )}

                      {isBulkMode && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onItemSelect(role.id);
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
                      
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (deletable) {
                                onDelete(role);
                              }
                            }}
                            className={`flex items-center gap-2 cursor-pointer ${
                              deletable
                                ? 'text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/30'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!deletable}
                            title={deleteDisabledReason}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Role</span>
                            {!deletable && (
                              <span className="ml-auto text-xs text-muted-foreground">
                                {role.is_system_role ? 'System' : 'Has users'}
                              </span>
                            )}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <Badge 
                    variant={getRoleTypeBadgeVariant(role.is_system_role)}
                    className={`text-xs ${typeBadgeClass}`}
                  >
                    {role.is_system_role ? 'System' : 'Custom'}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {role.description && (
                    <div 
                      className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2"
                      title={role.description}
                    >
                      {truncateText(role.description, isMobile ? 40 : 60)}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Users className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{usersCount} user{usersCount !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Key className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{permissionsCount} permission{permissionsCount !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Created {formatDate(role.created_at)}</span>
                  </div>
                </div>

                {isMobile && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>ID: {role.id}</span>
                      <span className={typeBadgeClass}>
                        {role.is_system_role ? 'System' : 'Custom'}
                      </span>
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
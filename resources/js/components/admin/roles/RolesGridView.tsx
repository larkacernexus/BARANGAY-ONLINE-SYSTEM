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
  Square,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { Role } from '@/types/admin/roles/roles';
import { JSX, useState, useMemo, useCallback, useEffect } from 'react';

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
  windowWidth?: number;
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
  canDelete = true,
  windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: RolesGridViewProps) {
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

  const getRoleTypeColor = (isSystemRole: boolean): string => {
    return isSystemRole 
      ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
      : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
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

  // Toggle card expansion
  const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  // Handle card click
  const handleCardClick = (role: Role, e: React.MouseEvent) => {
    if (isBulkMode) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    handleToggleExpand(role.id, e);
  };
  
  // Memoize selected set for quick lookup
  const selectedSet = useMemo(() => new Set(selectedRoles), [selectedRoles]);

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

  // Early return for empty state
  if (roles.length === 0) {
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
      {roles.map((role) => {
        const isSelected = selectedSet.has(role.id);
        const isExpanded = expandedId === role.id;
        const usersCount = role.users_count ?? 0;
        const permissionsCount = role.permissions_count ?? 0;
        const deletable = canDeleteRole(role);
        const deleteDisabledReason = getDeleteDisabledReason(role);
        const typeColor = getRoleTypeColor(role.is_system_role);
        
        // Truncation lengths based on view
        const nameLength = isCompactView ? 18 : 22;
        const descriptionLength = isCompactView ? 40 : 60;
        
        return (
          <Card 
            key={role.id}
            className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
              isSelected 
                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 dark:ring-blue-400 dark:border-blue-400' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
            } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer`}
            onClick={(e) => handleCardClick(role, e)}
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
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
                    <div className="font-medium text-gray-900 dark:text-white truncate" title={role.name}>
                      {truncateText(role.name, nameLength)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={role.slug}>
                      {truncateText(role.slug, 25)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  {isBulkMode && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onItemSelect(role.id)}
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
                        <Link href={`/admin/roles/${role.id}`} className="flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      
                      {canEdit && onRoleEdit && (
                        <DropdownMenuItem asChild>
                          <Link 
                            href={`/admin/roles/${role.id}/edit`} 
                            className={`flex items-center ${role.is_system_role ? 'opacity-50 pointer-events-none' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                            aria-disabled={role.is_system_role}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Role
                            {role.is_system_role && (
                              <span className="ml-auto text-xs text-gray-400">System</span>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/roles/${role.id}/permissions`} className="flex items-center">
                          <Key className="h-4 w-4 mr-2" />
                          Manage Permissions
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onCopyToClipboard(role.name, 'Role Name');
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Name
                      </DropdownMenuItem>
                      
                      {role.description && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onCopyToClipboard(role.description!, 'Role Description');
                        }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Description
                        </DropdownMenuItem>
                      )}

                      {isBulkMode && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onItemSelect(role.id);
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
                      
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (deletable) {
                                onDelete(role);
                              }
                            }}
                            className={`${
                              deletable
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!deletable}
                            title={deleteDisabledReason}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Role
                            {!deletable && (
                              <span className="ml-auto text-xs text-gray-400">
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

              {/* Status Badge */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge 
                  variant="outline"
                  className={`text-xs px-2 py-0.5 ${typeColor}`}
                >
                  {role.is_system_role ? 'System Role' : 'Custom Role'}
                </Badge>
              </div>

              {/* Primary Info */}
              <div className="space-y-2 mb-2">
                {role.description && (
                  <div 
                    className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2"
                    title={role.description}
                  >
                    {truncateText(role.description, descriptionLength)}
                  </div>
                )}
                
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{usersCount} user{usersCount !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Key className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{permissionsCount} permission{permissionsCount !== 1 ? 's' : ''}</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Created {formatDate(role.created_at)}</span>
                </div>
              </div>

              {/* Expand/Collapse indicator */}
              {!isBulkMode && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {isExpanded ? 'Hide details' : 'Click to view details'}
                  </div>
                  <button
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={(e) => handleToggleExpand(role.id, e)}
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
                  {/* Full Description */}
                  {role.description && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Full Description:</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {role.description}
                      </p>
                    </div>
                  )}

                  {/* Role Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Role ID:</span>
                      <span className="text-gray-700 dark:text-gray-300 ml-1">#{role.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Slug:</span>
                      <span className="text-gray-700 dark:text-gray-300 ml-1">{role.slug}</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(role.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                      <span className="text-gray-700 dark:text-gray-300 ml-1">{formatDate(role.updated_at)}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/admin/roles/${role.id}/permissions`}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="w-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-1.5 px-3 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1">
                        <Key className="h-3 w-3" />
                        Manage Permissions
                      </button>
                    </Link>
                  </div>

                  {/* View full details link */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/admin/roles/${role.id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View full details
                    </Link>
                    <button
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={(e) => handleToggleExpand(role.id, e)}
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
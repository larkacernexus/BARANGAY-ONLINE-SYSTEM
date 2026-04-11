// resources/js/Pages/Admin/Roles/components/permissions-tab.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Lock,
    Key,
    Settings,
    Copy,
    Search,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    Filter,
} from 'lucide-react';
import { Role, Permission } from '@/types/admin/roles/roles';

interface PermissionsTabProps {
    role: Role;
    groupedPermissions: Record<string, Permission[]>;
    onCopyToClipboard: (text: string, label: string) => void;
    onManagePermissions: () => void;
}

export const PermissionsTab = ({ 
    role, 
    groupedPermissions, 
    onCopyToClipboard, 
    onManagePermissions 
}: PermissionsTabProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(Object.keys(groupedPermissions)));
    const [filterModule, setFilterModule] = useState<string | null>(null);

    // Safe access with fallbacks
    const permissionsCount = role.permissions?.length ?? role.permissions_count ?? 0;
    const modulesCount = Object.keys(groupedPermissions).length;
    const hasPermissions = permissionsCount > 0;

    // Filter permissions based on search term
    const filterPermissions = (permissions: Permission[]): Permission[] => {
        if (!searchTerm) return permissions;
        const searchLower = searchTerm.toLowerCase();
        return permissions.filter(permission => 
            permission.display_name?.toLowerCase().includes(searchLower) ||
            permission.name?.toLowerCase().includes(searchLower) ||
            permission.description?.toLowerCase().includes(searchLower) ||
            permission.module?.toLowerCase().includes(searchLower)
        );
    };

// Filter modules based on search
    const getFilteredModules = (): [string, Permission[]][] => {
        let modules = Object.entries(groupedPermissions) as [string, Permission[]][];
        
        if (filterModule) {
            modules = modules.filter(([moduleName]) => moduleName === filterModule);
        }
        
        if (searchTerm) {
            modules = modules
                .map(([moduleName, permissions]): [string, Permission[]] => [
                    moduleName,
                    filterPermissions(permissions)
                ])
                .filter(([, permissions]) => permissions.length > 0);
        }
        
        return modules;
    };
    
    const toggleModule = (moduleName: string) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(moduleName)) {
                newSet.delete(moduleName);
            } else {
                newSet.add(moduleName);
            }
            return newSet;
        });
    };

    const expandAll = () => {
        setExpandedModules(new Set(Object.keys(groupedPermissions)));
    };

    const collapseAll = () => {
        setExpandedModules(new Set());
    };

    const clearSearch = () => {
        setSearchTerm('');
        setFilterModule(null);
    };

    const filteredModules = getFilteredModules();
    const hasActiveFilters = searchTerm !== '' || filterModule !== null;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <Lock className="h-5 w-5" />
                            Assigned Permissions
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            {permissionsCount} permission{permissionsCount !== 1 ? 's' : ''} across {modulesCount} module{modulesCount !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasPermissions && (
                            <>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={expandAll}
                                    className="dark:border-gray-600 dark:text-gray-300"
                                >
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    Expand All
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={collapseAll}
                                    className="dark:border-gray-600 dark:text-gray-300"
                                >
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Collapse All
                                </Button>
                            </>
                        )}
                        <Button 
                            size="sm"
                            onClick={onManagePermissions}
                            disabled={role.is_system_role}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Permissions
                        </Button>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                {hasPermissions && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search permissions by name, key, or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                        
                        {modulesCount > 0 && (
                            <select
                                value={filterModule || ''}
                                onChange={(e) => setFilterModule(e.target.value || null)}
                                className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                            >
                                <option value="">All Modules</option>
                                {Object.keys(groupedPermissions).map(module => (
                                    <option key={module} value={module}>{module}</option>
                                ))}
                            </select>
                        )}
                        
                        {hasActiveFilters && (
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={clearSearch}
                                className="dark:text-gray-400"
                            >
                                <Filter className="h-4 w-4 mr-1" />
                                Clear Filters
                            </Button>
                        )}
                    </div>
                )}
            </CardHeader>
            
            <CardContent>
                {hasPermissions ? (
                    filteredModules.length > 0 ? (
                        <div className="space-y-6">
                            {filteredModules.map(([module, permissions]) => {
                                const isExpanded = expandedModules.has(module);
                                const filteredPermissions = searchTerm ? permissions : filterPermissions(permissions);
                                
                                return (
                                    <div key={module} className="space-y-3">
                                        {/* Module Header */}
                                        <div 
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={() => toggleModule(module)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Key className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <h3 className="text-base font-semibold dark:text-gray-100">
                                                    {module}
                                                </h3>
                                                <Badge variant="secondary" className="text-xs">
                                                    {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                                                </Badge>
                                                {searchTerm && filteredPermissions.length !== permissions.length && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {filteredPermissions.length} filtered
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleModule(module);
                                                    }}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        {/* Permissions Grid */}
                                        {isExpanded && (
                                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 pl-4">
                                                {filteredPermissions.map(permission => (
                                                    <Card 
                                                        key={permission.id} 
                                                        className="dark:bg-gray-800/50 overflow-hidden hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                                                    >
                                                        <CardHeader className="pb-2">
                                                            <CardTitle className="text-sm font-medium dark:text-gray-200 flex items-center justify-between">
                                                                <span className="truncate" title={permission.display_name || permission.name}>
                                                                    {permission.display_name || permission.name}
                                                                </span>
                                                                {permission.is_active === false && (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        Inactive
                                                                    </Badge>
                                                                )}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="pb-3">
                                                            <div className="space-y-2">
                                                                <code className="text-xs text-gray-500 dark:text-gray-400 block font-mono break-all">
                                                                    {permission.name}
                                                                </code>
                                                                {permission.description && (
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                                                        {permission.description}
                                                                    </p>
                                                                )}
                                                                {permission.module && (
                                                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                                                        Module: {permission.module}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                        <CardFooter className="pt-0">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 px-2 text-xs dark:text-gray-400 dark:hover:text-white"
                                                                        onClick={() => onCopyToClipboard(permission.name, 'Permission name')}
                                                                    >
                                                                        <Copy className="h-3 w-3 mr-1" />
                                                                        Copy Key
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Copy permission key
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </CardFooter>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Search className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium dark:text-gray-100 mb-2">
                                No matching permissions
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                No permissions match your search criteria.
                            </p>
                            <Button 
                                variant="outline" 
                                onClick={clearSearch}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                Clear Search
                            </Button>
                        </div>
                    )
                ) : (
                    <div className="text-center py-12">
                        <div className="h-20 w-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Key className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium dark:text-gray-100 mb-2">
                            No permissions assigned
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                            This role doesn't have any permissions assigned yet. 
                            {!role.is_system_role && ' Assign permissions to control what users with this role can do.'}
                        </p>
                        {!role.is_system_role && (
                            <Button 
                                onClick={onManagePermissions}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Assign Permissions
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
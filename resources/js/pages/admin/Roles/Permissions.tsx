import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-app-layout';
import { Search, Filter, Check, X, ChevronDown, Eye, Edit, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    module: string;
    is_active: boolean;
}

interface GroupedPermissions {
    [module: string]: Permission[];
}

interface Role {
    id: number;
    name: string;
    description: string | null;
    is_system_role: boolean;
}

interface RolePermissionsProps {
    role: Role;
    permissions: GroupedPermissions;
    currentPermissions: number[];
    modules: string[];
}

export default function RolePermissions({ role, permissions, currentPermissions, modules }: RolePermissionsProps) {
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(currentPermissions);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate filtered permissions with memoization
    const filteredPermissions = useMemo(() => {
        let filtered = { ...permissions };
        
        // Filter by search term
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = Object.keys(filtered).reduce((acc, module) => {
                const modulePermissions = filtered[module].filter(permission =>
                    permission.display_name.toLowerCase().includes(searchLower) ||
                    permission.name.toLowerCase().includes(searchLower) ||
                    permission.description?.toLowerCase().includes(searchLower)
                );
                
                if (modulePermissions.length > 0) {
                    acc[module] = modulePermissions;
                }
                
                return acc;
            }, {} as GroupedPermissions);
        }
        
        // Filter by module
        if (selectedModule !== 'all' && filtered[selectedModule]) {
            return { [selectedModule]: filtered[selectedModule] };
        }
        
        return filtered;
    }, [permissions, searchTerm, selectedModule]);

    // Calculate stats
    const totalCount = useMemo(() => 
        Object.values(permissions).flat().length,
        [permissions]
    );
    
    const selectedCount = selectedPermissions.length;
    const selectionPercentage = totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0;

    // Handle permission toggle
    const togglePermission = useCallback((permissionId: number) => {
        setSelectedPermissions(prev => 
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    }, []);

    // Handle module toggle
    const toggleModulePermissions = useCallback((moduleName: string) => {
        const modulePermissionIds = permissions[moduleName]?.map(p => p.id) || [];
        const allSelected = modulePermissionIds.every(id => selectedPermissions.includes(id));
        
        setSelectedPermissions(prev => 
            allSelected
                ? prev.filter(id => !modulePermissionIds.includes(id))
                : [...new Set([...prev, ...modulePermissionIds])]
        );
    }, [permissions, selectedPermissions]);

    // Handle select all/deselect all
    const handleSelectAll = useCallback(() => {
        const allPermissionIds = Object.values(permissions)
            .flat()
            .map(p => p.id);
        setSelectedPermissions(allPermissionIds);
    }, [permissions]);

    const handleDeselectAll = useCallback(() => {
        setSelectedPermissions([]);
    }, []);

    // Check if all permissions in a module are selected
    const isModuleSelected = useCallback((moduleName: string): boolean => {
        const modulePermissions = permissions[moduleName] || [];
        if (modulePermissions.length === 0) return false;
        return modulePermissions.every(p => selectedPermissions.includes(p.id));
    }, [permissions, selectedPermissions]);

    // Check if any permissions in a module are selected
    const isModulePartial = useCallback((moduleName: string): boolean => {
        const modulePermissions = permissions[moduleName] || [];
        if (modulePermissions.length === 0) return false;
        return modulePermissions.some(p => selectedPermissions.includes(p.id)) && 
               !modulePermissions.every(p => selectedPermissions.includes(p.id));
    }, [permissions, selectedPermissions]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await router.put(route('roles.update', role.id), {
                _method: 'PUT',
                name: role.name,
                description: role.description,
                permissions: selectedPermissions,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedModule('all');
    };

    // Check if system role
    if (role.is_system_role) {
        return (
            <AdminLayout>
                <Head title="Role Permissions" />
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            System Role Protected
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Permissions for system roles cannot be modified as they are protected by the system.
                        </p>
                        <Link
                            href={route('roles.index')}
                            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Back to Roles
                        </Link>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Head title={`${role.name} - Permissions`} />

            {/* Header with Breadcrumbs */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Link href={route('roles.index')} className="hover:text-blue-600">
                        Roles
                    </Link>
                    <span>/</span>
                    <Link href={route('roles.show', role.id)} className="hover:text-blue-600">
                        {role.name}
                    </Link>
                    <span>/</span>
                    <span className="font-medium text-gray-900">Permissions</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {role.name} - Permissions
                        </h1>
                        <p className="text-gray-600 mt-1 text-sm">
                            Manage access permissions for this role
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('roles.show', role.id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <Eye className="h-4 w-4 mr-1.5" />
                            View Role
                        </Link>
                        <Link
                            href={route('roles.edit', role.id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <Edit className="h-4 w-4 mr-1.5" />
                            Edit Role
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="bg-white border shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-sm font-medium text-gray-500 mb-1">Total Permissions</div>
                        <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white border shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-sm font-medium text-gray-500 mb-1">Selected Permissions</div>
                        <div className="text-2xl font-bold text-blue-600">{selectedCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white border shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-sm font-medium text-gray-500 mb-1">Selection Progress</div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-xl font-bold text-green-600">{selectionPercentage}%</div>
                            <div className="text-sm text-gray-500">{selectedCount}/{totalCount}</div>
                        </div>
                        <Progress value={selectionPercentage} className="h-2" />
                    </CardContent>
                </Card>
            </div>

            {/* Filters Card */}
            <Card className="mb-6 border shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search permissions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="pl-8 pr-3 py-2 h-9">
                                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                                            <span className="text-sm">
                                                {selectedModule === 'all' ? 'All Modules' : selectedModule}
                                            </span>
                                            <ChevronDown className="ml-2 h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem 
                                            onClick={() => setSelectedModule('all')}
                                            className={`text-sm ${selectedModule === 'all' ? 'bg-gray-100' : ''}`}
                                        >
                                            All Modules
                                        </DropdownMenuItem>
                                        {modules.map((module) => (
                                            <DropdownMenuItem 
                                                key={module} 
                                                onClick={() => setSelectedModule(module)}
                                                className={`text-sm ${selectedModule === module ? 'bg-gray-100' : ''}`}
                                            >
                                                {module}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {(searchTerm || selectedModule !== 'all') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="h-9 px-3 text-gray-600 hover:text-gray-900"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    {/* Bulk Actions */}
                    <Separator className="my-4" />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            {selectedCount} of {totalCount} permissions selected
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSelectAll}
                                className="h-8 px-3"
                            >
                                Select All
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDeselectAll}
                                className="h-8 px-3"
                            >
                                Deselect All
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Permissions List */}
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {Object.keys(filteredPermissions).length === 0 ? (
                        <Card className="border shadow-sm">
                            <CardContent className="p-8 text-center">
                                <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
                                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No permissions found</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {searchTerm ? 'Try a different search term' : 'No permissions available for this module'}
                                </p>
                                {(searchTerm || selectedModule !== 'all') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-9"
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        Object.entries(filteredPermissions).map(([moduleName, modulePermissions]) => {
                            const isSelected = isModuleSelected(moduleName);
                            const isPartial = isModulePartial(moduleName);
                            const selectedInModule = modulePermissions.filter(p => selectedPermissions.includes(p.id)).length;
                            
                            return (
                                <Card key={moduleName} className="border shadow-sm overflow-hidden">
                                    {/* Module Header */}
                                    <CardHeader className="px-4 py-3 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleModulePermissions(moduleName)}
                                                    className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                                                        isSelected 
                                                            ? 'bg-blue-600 border-blue-600 hover:bg-blue-700' 
                                                            : isPartial
                                                            ? 'bg-blue-100 border-blue-300 hover:bg-blue-200'
                                                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                                    {isPartial && <div className="h-2 w-2 bg-blue-600 rounded-sm" />}
                                                </button>
                                                <div>
                                                    <CardTitle className="text-base font-semibold text-gray-900">
                                                        {moduleName}
                                                    </CardTitle>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {selectedInModule} of {modulePermissions.length} permissions selected
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {modulePermissions.map((permission) => {
                                                const isSelected = selectedPermissions.includes(permission.id);
                                                
                                                return (
                                                    <div
                                                        key={permission.id}
                                                        onClick={() => togglePermission(permission.id)}
                                                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                                                            isSelected
                                                                ? 'border-blue-300 bg-blue-50'
                                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                                                                isSelected
                                                                    ? 'bg-blue-600 border-blue-600'
                                                                    : 'border-gray-300'
                                                            }`}>
                                                                {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                                    <div className="min-w-0">
                                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                                            {permission.display_name}
                                                                        </h4>
                                                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                                                            {permission.name}
                                                                        </p>
                                                                    </div>
                                                                    <Badge 
                                                                        variant="outline" 
                                                                        className={`text-xs px-1.5 py-0.5 ${
                                                                            permission.is_active
                                                                                ? 'border-green-200 bg-green-50 text-green-700'
                                                                                : 'border-gray-200 bg-gray-50 text-gray-600'
                                                                        }`}
                                                                    >
                                                                        {permission.is_active ? 'Active' : 'Inactive'}
                                                                    </Badge>
                                                                </div>
                                                                {permission.description && (
                                                                    <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                                                                        {permission.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Sticky Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t shadow-lg p-4 mt-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium text-gray-900">{selectedCount}</span> permissions selected
                                <span className="text-gray-400 mx-2">•</span>
                                <span className="text-blue-600 font-medium">{selectionPercentage}% selected</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('roles.index')}
                                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Roles
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium min-w-[120px] justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Permissions'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
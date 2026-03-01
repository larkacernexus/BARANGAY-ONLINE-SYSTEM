// components/admin/role-permissions/PermissionDetailsDropdown.tsx
import React from 'react';
import { 
    Calendar,
    User,
    Clock,
    Shield,
    Info,
    Copy,
    XCircle,
    Eye,
    ChevronUp,
    ChevronDown,
    Tag,
    Layers,
    Award,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface PermissionDetailsDropdownProps {
    permission: any;
    isExpanded: boolean;
    onToggle: (e?: React.MouseEvent) => void;
    onRevoke: (permission: any) => void;
    onCopy: (text: string, label: string) => void;
    onViewRole: (roleId: number) => void;
    onViewGranter: (granterId: number) => void;
}

export default function PermissionDetailsDropdown({
    permission,
    isExpanded,
    onToggle,
    onRevoke,
    onCopy,
    onViewRole,
    onViewGranter
}: PermissionDetailsDropdownProps) {
    
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getModuleIcon = (moduleName: string) => {
        switch (moduleName?.toLowerCase()) {
            case 'dashboard': return <Layers className="h-4 w-4" />;
            case 'residents': return <User className="h-4 w-4" />;
            case 'households': return <User className="h-4 w-4" />;
            case 'fees': return <Tag className="h-4 w-4" />;
            case 'calendar': return <Calendar className="h-4 w-4" />;
            case 'settings': return <Award className="h-4 w-4" />;
            case 'notifications': return <Award className="h-4 w-4" />;
            case 'reports': return <FileText className="h-4 w-4" />;
            default: return <Layers className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status: boolean) => {
        return status ? (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                Active
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                Inactive
            </Badge>
        );
    };

    return (
        <div className="permission-dropdown border-t border-gray-100 bg-gray-50/50">
            {/* Dropdown Header - Click to toggle */}
            <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Additional Details</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Permission Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-3">
                            {/* Module Info */}
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    {getModuleIcon(permission.module)}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Module</p>
                                    <p className="text-sm font-medium">{permission.module || 'N/A'}</p>
                                    {permission.submodule && (
                                        <p className="text-xs text-gray-500">{permission.submodule}</p>
                                    )}
                                </div>
                            </div>

                            {/* Permission Name */}
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <Shield className="h-4 w-4 text-purple-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500">Permission Name</p>
                                    <p className="text-sm font-mono truncate" title={permission.name}>
                                        {permission.name}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCopy(permission.name, 'Permission name');
                                        }}
                                        className="h-6 px-2 text-xs mt-1"
                                    >
                                        <Copy className="h-3 w-3 mr-1" />
                                        Copy
                                    </Button>
                                </div>
                            </div>

                            {/* Display Name */}
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <Tag className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Display Name</p>
                                    <p className="text-sm font-medium">{permission.display_name}</p>
                                </div>
                            </div>

                            {/* Description */}
                            {permission.description && (
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Description</p>
                                        <p className="text-sm text-gray-700">{permission.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                            {/* Role Info */}
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <Shield className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Role</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{permission.role_name}</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewRole(permission.role_id);
                                            }}
                                            className="h-6 px-2 text-xs"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            View Role
                                        </Button>
                                    </div>
                                    {permission.role_description && (
                                        <p className="text-xs text-gray-500 mt-1">{permission.role_description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Granted By */}
                            {permission.granted_by_name && (
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                        <User className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Granted By</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{permission.granted_by_name}</p>
                                            {permission.granter_id && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewGranter(permission.granter_id);
                                                    }}
                                                    className="h-6 px-2 text-xs"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View Granter
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Granted At */}
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-4 w-4 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Granted At</p>
                                    <p className="text-sm font-medium" title={formatDate(permission.granted_at)}>
                                        {formatDate(permission.granted_at)}
                                    </p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <Clock className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <div className="mt-1">
                                        {getStatusBadge(permission.is_active)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <Separator />
                    
                    <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCopy(JSON.stringify({
                                                id: permission.id,
                                                name: permission.name,
                                                display_name: permission.display_name,
                                                role: permission.role_name,
                                                module: permission.module,
                                                granted_at: permission.granted_at
                                            }, null, 2), 'Permission data');
                                        }}
                                        className="h-8"
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Data
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Copy all permission details as JSON
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRevoke(permission);
                                        }}
                                        className="h-8"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Revoke Permission
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Remove this permission from the role
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            )}
        </div>
    );
}
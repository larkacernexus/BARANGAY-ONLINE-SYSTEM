// pages/admin/roles/create.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react'; // Add useEffect
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { FormContainer } from '@/components/adminui/form/form-container';
import { FormTabs, TabConfig } from '@/components/adminui/form/form-tabs';
import { FormProgress } from '@/components/adminui/form/form-progress';
import { FormNavigation } from '@/components/adminui/form/form-navigation';
import { FormHeader } from '@/components/adminui/form/form-header';
import { FormErrors } from '@/components/adminui/form/form-errors';
import { RequiredFieldsChecklist } from '@/components/adminui/form/required-fields-checklist';
import { useFormManager } from '@/hooks/admin/use-form-manager';
import { Shield, Key, Settings, Sparkles, Edit, Eye, AlertCircle, BookOpen, RefreshCw, Tag, Lock } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/roles/create/basic-info-tab';
import { PermissionsTab } from '@/components/admin/roles/create/permissions-tab';
import { SettingsTab } from '@/components/admin/roles/create/settings-tab';
import { route } from 'ziggy-js';

interface FormData {
    name: string;
    description: string;
    is_system_role: boolean;
    permissions: number[];
}

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: Shield, requiredFields: ['name'] },
    { id: 'permissions', label: 'Permissions', icon: Key, requiredFields: [] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['name'],
    permissions: [],
    settings: []
};

interface PageProps {
    permissions: Record<string, Permission[]>;
    modules: string[];
    [key: string]: unknown;
}

import type { Permission } from '@/types/admin/roles/roles';

export default function CreateRole() {
    const { props } = usePage<PageProps>();
    const { permissions = {}, modules = [] } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState<string>('all');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showSystemRoleWarning, setShowSystemRoleWarning] = useState(false);
    const [localPermissions, setLocalPermissions] = useState<number[]>([]);

    const {
        formData,
        errors,
        isSubmitting,
        activeTab,
        formProgress,
        allRequiredFieldsFilled,
        handleInputChange,
        handleSelectChange,
        handleSubmit,
        setActiveTab,
        getTabStatus,
        getMissingFields,
        goToNextTab,
        goToPrevTab,
        updateFormData,
        resetForm
    } = useFormManager<FormData>({
        initialData: {
            name: '',
            description: '',
            is_system_role: false,
            permissions: [],
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            // Check for system role confirmation
            if (data.is_system_role) {
                if (!confirm('Are you sure you want to create a system role? System roles cannot be deleted.')) {
                    return;
                }
            }

            router.post(route('admin.roles.store'), data as any, {
                onSuccess: () => {
                    toast.success('Role created successfully');
                    router.visit(route('admin.roles.index'));
                },
                onError: (errs) => {
                    toast.error('Failed to create role');
                }
            });
        }
    });

    // Sync local permissions with form data - FIXED
    useEffect(() => {
        if (Array.isArray(formData.permissions)) {
            setLocalPermissions(formData.permissions);
        }
    }, [formData.permissions]);

    // Memoized values
    const allPermissions = useMemo(() => {
        return Object.values(permissions).flat();
    }, [permissions]);

    const availableModules = useMemo(() => {
        const permissionModules = Object.keys(permissions);
        return ['all', ...permissionModules.sort()];
    }, [permissions]);

    // Filter permissions based on search and module
    const filteredPermissions = useMemo(() => {
        return allPermissions.filter(permission => {
            const permissionName = permission.name?.toLowerCase() || '';
            const displayName = permission.display_name?.toLowerCase() || '';
            const module = (permission as any).module || '';

            const matchesSearch = searchTerm === '' ||
                permissionName.includes(searchTerm.toLowerCase()) ||
                displayName.includes(searchTerm.toLowerCase());

            const matchesModule = selectedModule === 'all' || module === selectedModule;

            return matchesSearch && matchesModule;
        });
    }, [allPermissions, searchTerm, selectedModule]);

    // Group filtered permissions by module
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};

        filteredPermissions.forEach(permission => {
            const module = (permission as any).module || 'Uncategorized';
            if (!groups[module]) {
                groups[module] = [];
            }
            groups[module].push(permission);
        });

        return groups;
    }, [filteredPermissions]);

    // Check if role name suggests a system role - FIXED
    useEffect(() => {
        const systemKeywords = ['admin', 'superadmin', 'system', 'root', 'super', 'owner'];
        const roleName = formData.name.toLowerCase();
        const isPotentialSystemRole = systemKeywords.some(keyword =>
            roleName.includes(keyword) || roleName.startsWith(keyword)
        );
        setShowSystemRoleWarning(isPotentialSystemRole && !formData.is_system_role);
    }, [formData.name, formData.is_system_role]);

    // Handle permission toggle
    const handlePermissionToggle = (permissionId: number) => {
        if (localPermissions.includes(permissionId)) {
            const newPermissions = localPermissions.filter(id => id !== permissionId);
            setLocalPermissions(newPermissions);
            updateFormData({ permissions: newPermissions });
        } else {
            const newPermissions = [...localPermissions, permissionId];
            setLocalPermissions(newPermissions);
            updateFormData({ permissions: newPermissions });
        }
    };

    // Handle select all permissions in a module or all
    const handleSelectAll = (module?: string) => {
        let permissionIdsToAdd: number[];

        if (module && groupedPermissions[module]) {
            permissionIdsToAdd = groupedPermissions[module]
                .filter(p => !localPermissions.includes(p.id))
                .map(p => p.id);
        } else {
            permissionIdsToAdd = filteredPermissions
                .filter(p => !localPermissions.includes(p.id))
                .map(p => p.id);
        }

        const newPermissions = [...localPermissions, ...permissionIdsToAdd];
        setLocalPermissions(newPermissions);
        updateFormData({ permissions: newPermissions });
    };

    // Handle deselect all permissions in a module or all
    const handleDeselectAll = (module?: string) => {
        let newPermissions = [...localPermissions];

        if (module && groupedPermissions[module]) {
            const modulePermissionIds = groupedPermissions[module].map(p => p.id);
            newPermissions = newPermissions.filter(id => !modulePermissionIds.includes(id));
        } else {
            newPermissions = [];
        }

        setLocalPermissions(newPermissions);
        updateFormData({ permissions: newPermissions });
    };

    // Check if all permissions in a module are selected
    const isAllSelected = (module?: string) => {
        if (module && groupedPermissions[module]) {
            const modulePermissions = groupedPermissions[module];
            return modulePermissions.length > 0 && modulePermissions.every(p => localPermissions.includes(p.id));
        }
        return filteredPermissions.length > 0 && filteredPermissions.every(p => localPermissions.includes(p.id));
    };

    // Check if any permissions in a module are selected
    const isAnySelected = (module?: string) => {
        if (module && groupedPermissions[module]) {
            const modulePermissions = groupedPermissions[module];
            return modulePermissions.some(p => localPermissions.includes(p.id));
        }
        return filteredPermissions.some(p => localPermissions.includes(p.id));
    };

    // Handle copy to clipboard
    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
            toast.success(`${field} copied to clipboard`);
        });
    };

    // Apply template
    const applyTemplate = (template: 'admin' | 'editor' | 'viewer') => {
        switch (template) {
            case 'admin':
                const allActivePermissionIds = allPermissions
                    .filter(p => (p as any).is_active)
                    .map(p => p.id);
                updateFormData({
                    name: 'admin',
                    description: 'Full system administrator with all permissions',
                    is_system_role: true,
                    permissions: allActivePermissionIds,
                });
                setLocalPermissions(allActivePermissionIds);
                toast.success('Admin template applied');
                break;
            case 'editor':
                const contentPermissions = allPermissions
                    .filter(p => (p as any).is_active &&
                        ((p as any).module?.toLowerCase().includes('content') ||
                            (p as any).module?.toLowerCase().includes('post') ||
                            p.name.includes('create') ||
                            p.name.includes('edit')))
                    .map(p => p.id)
                    .slice(0, 15);
                updateFormData({
                    name: 'content_editor',
                    description: 'Can create and edit content',
                    is_system_role: false,
                    permissions: contentPermissions,
                });
                setLocalPermissions(contentPermissions);
                toast.success('Editor template applied');
                break;
            case 'viewer':
                const viewPermissions = allPermissions
                    .filter(p => (p as any).is_active &&
                        (p.name.includes('view') ||
                            p.name.includes('read') ||
                            p.name.includes('list')))
                    .map(p => p.id);
                updateFormData({
                    name: 'viewer',
                    description: 'Can view content but not create or edit',
                    is_system_role: false,
                    permissions: viewPermissions,
                });
                setLocalPermissions(viewPermissions);
                toast.success('Viewer template applied');
                break;
        }
    };

    // Handle reset
    const handleReset = () => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            resetForm();
            setLocalPermissions([]);
            setSearchTerm('');
            setSelectedModule('all');
            toast.info('Form reset');
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (formData.name || formData.description || localPermissions.length > 0) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.roles.index'));
            }
        } else {
            router.visit(route('admin.roles.index'));
        }
    };

    // Validate form (custom validation for role name format)
    const validateCustom = () => {
        const newErrors: Record<string, string> = {};

        if (formData.name && !/^[a-z_]+$/.test(formData.name)) {
            newErrors.name = 'Role name must contain only lowercase letters and underscores';
        }

        if (formData.name && formData.name.length < 3) {
            newErrors.name = 'Role name must be at least 3 characters';
        }

        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fix the errors in the form');
            return false;
        }
        return true;
    };

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        permissions: getTabStatus('permissions'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'Role Name', value: !!formData.name, tabId: 'basic' },
    ];

    const tabOrder = ['basic', 'permissions', 'settings'];

    return (
        <AppLayout
            title="Create Role"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Roles', href: '/admin/roles' },
                { title: 'Create', href: '/admin/roles/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create Role"
                    description="Define a new role with specific permissions"
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Reset
                            </button>
                        </div>
                    }
                />

                {/* Quick Templates Card */}
                <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium text-indigo-800 dark:text-indigo-300">Quick start with templates</h3>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                                Choose from common role templates to get started quickly.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={() => applyTemplate('admin')}
                                    className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                >
                                    <Shield className="h-3 w-3" />
                                    Administrator
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyTemplate('editor')}
                                    className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                >
                                    <Edit className="h-3 w-3" />
                                    Content Editor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyTemplate('viewer')}
                                    className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                >
                                    <Eye className="h-3 w-3" />
                                    Viewer (Read-Only)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Role Warning */}
                {showSystemRoleWarning && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-800 dark:text-yellow-300">System Role Warning</p>
                                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                                    This role name suggests it might be a system role. Consider enabling "System Role" in settings.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <FormErrors errors={errors} />

                <div className={`grid ${showPreview ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    <div className={`${showPreview ? 'lg:col-span-2' : 'col-span-1'} space-y-4`}>
                        <FormTabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            tabStatuses={tabStatuses}
                        />

                        {activeTab === 'basic' && (
                            <>
                                <FormContainer title="Basic Information" description="Enter the core details for this role">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={errors}
                                        copiedField={copiedField}
                                        onInputChange={handleInputChange}
                                        onCopy={handleCopy}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && validateCustom()}
                                    showPrevious={false}
                                    nextLabel="Next: Permissions"
                                />
                            </>
                        )}

                        {activeTab === 'permissions' && (
                            <>
                                <FormContainer 
                                    title="Permissions" 
                                    description="Select the permissions to assign to this role"
                                    actions={
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {localPermissions.length} selected
                                        </div>
                                    }
                                >
                                    <PermissionsTab
                                        formData={formData}
                                        errors={errors}
                                        permissions={permissions}
                                        groupedPermissions={groupedPermissions}
                                        availableModules={availableModules}
                                        selectedModule={selectedModule}
                                        searchTerm={searchTerm}
                                        localPermissions={localPermissions}
                                        filteredPermissions={filteredPermissions}
                                        isAllSelected={isAllSelected}
                                        isAnySelected={isAnySelected}
                                        onModuleChange={setSelectedModule}
                                        onSearchChange={setSearchTerm}
                                        onPermissionToggle={handlePermissionToggle}
                                        onSelectAll={handleSelectAll}
                                        onDeselectAll={handleDeselectAll}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && validateCustom()}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Settings"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer title="Role Settings" description="Configure role behavior and access options">
                                    <SettingsTab
                                        formData={formData}
                                        errors={errors}
                                        onSwitchChange={(checked) => updateFormData({ is_system_role: checked })}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && validateCustom()}
                                    previousLabel="Back: Permissions"
                                    showNext={false}
                                    submitLabel="Create Role"
                                />
                            </>
                        )}
                    </div>

                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled}
                                    missingFields={missingFields}
                                    onMissingFieldClick={(tabId) => setActiveTab(tabId)}
                                />
                                <RequiredFieldsChecklist
                                    fields={requiredFieldsList}
                                    onTabClick={(tabId) => setActiveTab(tabId)}
                                    missingFields={missingFields}
                                />
                                
                                {/* Role Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Role Summary</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                                formData.is_system_role
                                                    ? 'bg-purple-100 dark:bg-purple-900/30'
                                                    : 'bg-indigo-100 dark:bg-indigo-900/30'
                                            }`}>
                                                <Shield className={`h-5 w-5 ${
                                                    formData.is_system_role
                                                        ? 'text-purple-600 dark:text-purple-400'
                                                        : 'text-indigo-600 dark:text-indigo-400'
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-mono font-medium dark:text-gray-200">
                                                    {formData.name || <span className="text-gray-400 italic">role_name</span>}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formData.is_system_role ? 'System Role' : 'Custom Role'}
                                                </div>
                                            </div>
                                        </div>

                                        {formData.description && (
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                                                    {formData.description}
                                                </p>
                                            </div>
                                        )}

                                        <div className="pt-2 border-t dark:border-gray-700">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Permissions:</span>
                                                <span className="text-xs font-medium dark:text-gray-300">
                                                    {localPermissions.length} selected
                                                </span>
                                            </div>
                                            {localPermissions.length > 0 ? (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {localPermissions.length} permission(s) assigned to this role
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">No permissions selected</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Tips Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <div className="h-5 w-5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 flex items-center justify-center">
                                                <BookOpen className="h-3 w-3 text-white" />
                                            </div>
                                            Quick Tips
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm flex items-center gap-2 dark:text-gray-200">
                                                <Tag className="h-3 w-3 text-indigo-500" />
                                                Role Naming
                                            </h4>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                <li>Use lowercase letters and underscores</li>
                                                <li>Choose descriptive names like "content_editor"</li>
                                                <li>Avoid spaces and special characters</li>
                                            </ul>
                                        </div>
                                        
                                        <div className="pt-2 border-t dark:border-gray-700">
                                            <h4 className="font-medium text-sm flex items-center gap-2 dark:text-gray-200">
                                                <Key className="h-3 w-3 text-amber-500" />
                                                Permissions
                                            </h4>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside mt-2">
                                                <li>Only grant permissions the role actually needs</li>
                                                <li>Use templates to get started quickly</li>
                                                <li>Review permissions before saving</li>
                                            </ul>
                                        </div>
                                        
                                        <div className="pt-2 border-t dark:border-gray-700">
                                            <h4 className="font-medium text-sm flex items-center gap-2 dark:text-gray-200">
                                                <Lock className="h-3 w-3 text-purple-500" />
                                                System Roles
                                            </h4>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside mt-2">
                                                <li>System roles cannot be deleted</li>
                                                <li>Use for core administrative functions</li>
                                                <li>Require confirmation to create</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
// pages/admin/roles/edit.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/admin-app-layout';
import { FormContainer } from '@/components/adminui/form/form-container';
import { FormTabs, TabConfig } from '@/components/adminui/form/form-tabs';
import { FormProgress } from '@/components/adminui/form/form-progress';
import { FormNavigation } from '@/components/adminui/form/form-navigation';
import { FormHeader } from '@/components/adminui/form/form-header';
import { FormErrors } from '@/components/adminui/form/form-errors';
import { RequiredFieldsChecklist } from '@/components/adminui/form/required-fields-checklist';
import { useFormManager } from '@/hooks/admin/use-form-manager';
import { Shield, Key, Settings, History, Trash2, Lock } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/roles/create/basic-info-tab';
import { PermissionsTab } from '@/components/admin/roles/create/permissions-tab';
import { SettingsTab } from '@/components/admin/roles/create/settings-tab';
import { route } from 'ziggy-js';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    role: Role;
    permissions: Record<string, Permission[]>;
    [key: string]: unknown;
}

import type { Permission, Role } from '@/types/admin/roles/roles';

export default function EditRole() {
    const { props } = usePage<PageProps>();
    const { role, permissions = {} } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState<string>('all');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [localPermissions, setLocalPermissions] = useState<number[]>([]);
    const [selectedRolePermissions, setSelectedRolePermissions] = useState<number[]>([]);

    const isSystemRole = role.is_system_role;
    const usersCount = role.users_count ?? 0;
    const canDelete = !isSystemRole && usersCount === 0;

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
        resetForm,
        hasUnsavedChanges
    } = useFormManager<FormData>({
        initialData: {
            name: role.name || '',
            description: role.description || '',
            is_system_role: role.is_system_role,
            permissions: role.permissions?.map(p => p.id) || [],
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            if (isSystemRole) {
                toast.error('System role cannot be modified');
                return;
            }

            router.put(route('admin.roles.update', role.id), data as any, {
                onSuccess: () => {
                    toast.success('Role updated successfully');
                    router.visit(route('admin.roles.show', role.id));
                },
                onError: (errs) => {
                    toast.error('Failed to update role');
                }
            });
        }
    });

    // Sync local permissions with form data
    useState(() => {
        if (Array.isArray(formData.permissions)) {
            setLocalPermissions(formData.permissions);
        }
    });

    // Memoized values
    const allPermissions = useMemo(() => {
        return Object.values(permissions).flat();
    }, [permissions]);

    const availableModules = useMemo(() => {
        const permissionModules = Object.keys(permissions);
        return ['all', ...permissionModules.sort()];
    }, [permissions]);

    const filteredPermissions = useMemo(() => {
        return allPermissions.filter(permission => {
            const permissionName = permission.name?.toLowerCase() || '';
            const displayName = permission.display_name?.toLowerCase() || '';
            const module = permission.module || '';

            const matchesSearch = searchTerm === '' ||
                permissionName.includes(searchTerm.toLowerCase()) ||
                displayName.includes(searchTerm.toLowerCase());

            const matchesModule = selectedModule === 'all' || module === selectedModule;

            return matchesSearch && matchesModule;
        });
    }, [allPermissions, searchTerm, selectedModule]);

    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        filteredPermissions.forEach(permission => {
            const module = permission.module || 'Uncategorized';
            if (!groups[module]) {
                groups[module] = [];
            }
            groups[module].push(permission);
        });
        return groups;
    }, [filteredPermissions]);

    // Handle permission toggle
    const handlePermissionToggle = (permissionId: number) => {
        if (isSystemRole) {
            toast.error('System role permissions cannot be modified');
            return;
        }
        
        const newPermissions = localPermissions.includes(permissionId)
            ? localPermissions.filter(id => id !== permissionId)
            : [...localPermissions, permissionId];
        
        setLocalPermissions(newPermissions);
        updateFormData({ permissions: newPermissions });
    };

    // Handle select all permissions
    const handleSelectAll = (module?: string) => {
        if (isSystemRole) {
            toast.error('System role permissions cannot be modified');
            return;
        }
        
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

    // Handle deselect all permissions
    const handleDeselectAll = (module?: string) => {
        if (isSystemRole) {
            toast.error('System role permissions cannot be modified');
            return;
        }
        
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
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
            toast.success(`${field} copied to clipboard`);
        });
    };

    // Handle reset
    const handleReset = () => {
        if (confirm('Reset all changes to the original values?')) {
            resetForm();
            setLocalPermissions(role.permissions?.map(p => p.id) || []);
            setSearchTerm('');
            setSelectedModule('all');
            toast.info('Form reset to original values');
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (hasUnsavedChanges && !isSystemRole) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.roles.show', role.id));
            }
        } else {
            router.visit(route('admin.roles.show', role.id));
        }
    };

    // Handle delete
    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.roles.destroy', role.id), {
            onSuccess: () => {
                toast.success('Role deleted successfully');
                router.visit(route('admin.roles.index'));
            },
            onError: () => {
                toast.error('Failed to delete role');
                setShowDeleteDialog(false);
            }
        });
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

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Count changed fields
    const changedFieldsCount = () => {
        let count = 0;
        if (formData.name !== role.name) count++;
        if (formData.description !== (role.description || '')) count++;
        if (JSON.stringify(formData.permissions) !== JSON.stringify(role.permissions?.map(p => p.id) || [])) count++;
        return count;
    };

    return (
        <AdminLayout
            title={`Edit Role: ${role.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Roles', href: '/admin/roles' },
                { title: role.name, href: route('admin.roles.show', role.id) },
                { title: 'Edit', href: route('admin.roles.edit', role.id) }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Edit Role"
                    description={`Editing ${role.name}`}
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    actions={
                        <div className="flex items-center gap-2">
                            {hasUnsavedChanges && !isSystemRole && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                                >
                                    <History className="h-4 w-4" />
                                    Reset
                                </button>
                            )}
                            {!isSystemRole && canDelete && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            )}
                            <div className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800">
                                {role.slug}
                            </div>
                            <div className={`px-2 py-1 rounded-md text-xs ${
                                role.is_system_role 
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                                {role.is_system_role ? 'System Role' : 'Custom Role'}
                            </div>
                        </div>
                    }
                />

                {/* System Role Warning */}
                {isSystemRole && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-amber-800 dark:text-amber-300">System Role</p>
                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                    This is a system role. Role name and description cannot be modified. Only permissions can be updated.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Last Updated & Changes Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <History className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Last updated: {formatDate(role.updated_at)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Created: {formatDate(role.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {hasUnsavedChanges && !isSystemRole && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                                    <span className="font-medium text-blue-800 dark:text-blue-300">
                                        {changedFieldsCount()} field{changedFieldsCount() !== 1 ? 's' : ''} modified
                                    </span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleReset}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    Reset All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

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
                                <FormContainer title="Basic Information" description="Update the core details for this role">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={errors}
                                        copiedField={copiedField}
                                        onInputChange={handleInputChange}
                                        onCopy={handleCopy}
                                        isSubmitting={isSubmitting}
                                        isSystemRole={isSystemRole}
                                        originalName={role.name}
                                        originalDescription={role.description || undefined}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !isSystemRole}
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
                                        isSystemRole={isSystemRole}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !isSystemRole}
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
                                        isEdit={true}
                                        isSystemRole={isSystemRole}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !isSystemRole}
                                    previousLabel="Back: Permissions"
                                    showNext={false}
                                    submitLabel="Update Role"
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
                                                role.is_system_role
                                                    ? 'bg-purple-100 dark:bg-purple-900/30'
                                                    : 'bg-indigo-100 dark:bg-indigo-900/30'
                                            }`}>
                                                <Shield className={`h-5 w-5 ${
                                                    role.is_system_role
                                                        ? 'text-purple-600 dark:text-purple-400'
                                                        : 'text-indigo-600 dark:text-indigo-400'
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-mono font-medium dark:text-gray-200">
                                                    {formData.name || <span className="text-gray-400 italic">role_name</span>}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {role.is_system_role ? 'System Role' : 'Custom Role'}
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
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Assigned to {usersCount} user(s)
                                            </div>
                                        </div>

                                        {/* Last Updated Info */}
                                        <div className="pt-2 border-t dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Slug: {role.slug}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="dark:bg-gray-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Trash2 className="h-5 w-5" />
                            Delete Role
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete role "{role.name}"? This action cannot be undone.
                            {usersCount > 0 && (
                                <span className="block mt-2 text-yellow-600 dark:text-yellow-400">
                                    Warning: This role has {usersCount} user(s) assigned.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                            disabled={usersCount > 0}
                        >
                            Delete Role
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
// pages/admin/users/edit.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
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
import { User, Lock, Shield, Settings, History, Trash2, AlertCircle } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/users/create/basic-info-tab';
import { SecurityTab } from '@/components/admin/users/create/security-tab';
import { PermissionsTab } from '@/components/admin/users/create/permissions-tab';
import { SettingsTab } from '@/components/admin/users/create/settings-tab';
import { route } from 'ziggy-js';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
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
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
    password_confirmation: string;
    contact_number: string;
    position: string;
    department_id: string;
    role_id: string;
    selected_permissions: number[];
    status: 'active' | 'inactive';
    require_password_change: boolean;
    is_email_verified: boolean;
    send_reset_email: boolean;
}

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: User, requiredFields: ['first_name', 'last_name', 'email', 'username', 'role_id'] },
    { id: 'security', label: 'Security', icon: Lock, requiredFields: [] },
    { id: 'permissions', label: 'Permissions', icon: Shield, requiredFields: [] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['first_name', 'last_name', 'email', 'username', 'role_id'],
    security: [],
    permissions: [],
    settings: []
};

interface PageProps extends InertiaPageProps {
    user: any;
    permissions: Record<string, Permission[]>;
    roles: Role[];
    departments: Department[];
}

import type { Permission, UserRole as Role, UserDepartment as Department } from '@/types/admin/users/user-types';

export default function EditUser() {
    const { props } = usePage<PageProps>();
    const { user, permissions = {}, roles = [], departments = [] } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
    const [passwordResetMode, setPasswordResetMode] = useState(false);
    const [localSelectedPermissions, setLocalSelectedPermissions] = useState<number[]>([]);
    const [selectedRolePermissions, setSelectedRolePermissions] = useState<number[]>([]);
    const [isResettingPermissions, setIsResettingPermissions] = useState(false);
    const [initialFormData, setInitialFormData] = useState<FormData | null>(null);

    // Helper to get editable status
    const getEditableStatus = (status: string): 'active' | 'inactive' => {
        if (status === 'suspended') return 'inactive';
        return status === 'active' ? 'active' : 'inactive';
    };

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
        // Remove resetForm and hasUnsavedChanges from here
    } = useFormManager<FormData>({
        initialData: {
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            username: user.username || '',
            password: '',
            password_confirmation: '',
            contact_number: user.contact_number || '',
            position: user.position || '',
            department_id: user.department_id?.toString() || '',
            role_id: user.roles?.[0]?.id?.toString() || '',
            selected_permissions: user.permissions?.map((p: any) => p.id) || [],
            status: getEditableStatus(user.status),
            require_password_change: user.require_password_change || false,
            is_email_verified: user.email_verified_at !== null,
            send_reset_email: false,
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            router.put(route('admin.users.update', user.id), data as any, {
                onSuccess: () => {
                    toast.success('User updated successfully');
                    router.visit(route('admin.users.show', user.id));
                },
                onError: (errs) => {
                    toast.error('Failed to update user');
                }
            });
        }
    });

    // Store initial form data for reset functionality
    useEffect(() => {
        if (!initialFormData) {
            setInitialFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                username: user.username || '',
                password: '',
                password_confirmation: '',
                contact_number: user.contact_number || '',
                position: user.position || '',
                department_id: user.department_id?.toString() || '',
                role_id: user.roles?.[0]?.id?.toString() || '',
                selected_permissions: user.permissions?.map((p: any) => p.id) || [],
                status: getEditableStatus(user.status),
                require_password_change: user.require_password_change || false,
                is_email_verified: user.email_verified_at !== null,
                send_reset_email: false,
            });
        }
    }, []);

    // Calculate hasUnsavedChanges
    const hasUnsavedChanges = useMemo(() => {
        if (!initialFormData) return false;
        
        return (
            formData.first_name !== initialFormData.first_name ||
            formData.last_name !== initialFormData.last_name ||
            formData.email !== initialFormData.email ||
            formData.username !== initialFormData.username ||
            formData.contact_number !== initialFormData.contact_number ||
            formData.position !== initialFormData.position ||
            formData.department_id !== initialFormData.department_id ||
            formData.role_id !== initialFormData.role_id ||
            formData.status !== initialFormData.status ||
            formData.require_password_change !== initialFormData.require_password_change ||
            formData.is_email_verified !== initialFormData.is_email_verified ||
            JSON.stringify(formData.selected_permissions) !== JSON.stringify(initialFormData.selected_permissions) ||
            formData.password !== '' ||
            formData.password_confirmation !== ''
        );
    }, [formData, initialFormData]);

    // Reset function
    const resetForm = () => {
        if (initialFormData) {
            updateFormData(initialFormData);
            setLocalSelectedPermissions(initialFormData.selected_permissions);
            setPasswordResetMode(false);
        }
    };

    // Memoized values
    const flattenedPermissions = useMemo(() => {
        if (!permissions) return [];
        return Object.values(permissions).flat();
    }, [permissions]);

    const selectedRole = useMemo(() => {
        if (!Array.isArray(roles) || !formData.role_id) return null;
        return roles.find(role => role && role.id && role.id.toString() === formData.role_id.toString()) || null;
    }, [roles, formData.role_id]);

    const selectedDepartment = useMemo(() => {
        if (!Array.isArray(departments) || !formData.department_id) return null;
        return departments.find(dept => dept && dept.id && dept.id.toString() === formData.department_id.toString()) || null;
    }, [departments, formData.department_id]);

    const selectedPermissionsCount = useMemo(() => {
        return localSelectedPermissions.length + selectedRolePermissions.length;
    }, [localSelectedPermissions, selectedRolePermissions]);

    const permissionModules = useMemo(() => {
        if (!permissions || typeof permissions !== 'object') return [];
        return Object.keys(permissions).filter(key =>
            Array.isArray(permissions[key]) && permissions[key].length > 0
        );
    }, [permissions]);

    // Sync local state with form data
    useEffect(() => {
        if (Array.isArray(formData.selected_permissions)) {
            setLocalSelectedPermissions(formData.selected_permissions);
        }
    }, [formData.selected_permissions]);

    // When role changes, load its permissions
    useEffect(() => {
        if (formData.role_id && roles) {
            const role = Array.isArray(roles)
                ? roles.find(r => r && r.id && r.id.toString() === formData.role_id.toString())
                : null;

            if (role && role.permissions) {
                const rolePermissionIds = Array.isArray(role.permissions)
                    ? role.permissions
                        .filter((p: any) => p && p.id !== undefined && p.id !== null)
                        .map((p: any) => p.id)
                    : [];
                setSelectedRolePermissions(rolePermissionIds);
            } else {
                setSelectedRolePermissions([]);
            }
        } else {
            setSelectedRolePermissions([]);
        }
    }, [formData.role_id, roles]);

    // Toggle permission
    const togglePermission = (permissionId: number) => {
        if (localSelectedPermissions.includes(permissionId)) {
            const newPermissions = localSelectedPermissions.filter(id => id !== permissionId);
            setLocalSelectedPermissions(newPermissions);
            updateFormData({ selected_permissions: newPermissions });
        } else {
            const newPermissions = [...localSelectedPermissions, permissionId];
            setLocalSelectedPermissions(newPermissions);
            updateFormData({ selected_permissions: newPermissions });
        }
    };

    // Toggle all permissions in a module
    const toggleAllPermissions = (modulePermissions: Permission[]) => {
        const permissionsArray = Array.isArray(modulePermissions) ? modulePermissions : [];
        if (permissionsArray.length === 0) return;

        const permissionIds = permissionsArray
            .filter((p: Permission) => p && p.id !== undefined && p.id !== null)
            .map((p: Permission) => p.id);

        if (permissionIds.length === 0) return;

        const allSelected = permissionIds.every(id => localSelectedPermissions.includes(id));

        if (allSelected) {
            const newPermissions = localSelectedPermissions.filter(id => !permissionIds.includes(id));
            setLocalSelectedPermissions(newPermissions);
            updateFormData({ selected_permissions: newPermissions });
        } else {
            const newIds = permissionIds.filter(id => !localSelectedPermissions.includes(id));
            const newPermissions = [...localSelectedPermissions, ...newIds];
            setLocalSelectedPermissions(newPermissions);
            updateFormData({ selected_permissions: newPermissions });
        }
    };

    // Reset permissions
    const handleResetPermissions = () => {
        setIsResettingPermissions(true);
        setLocalSelectedPermissions([]);
        updateFormData({ selected_permissions: [] });
        setTimeout(() => {
            setIsResettingPermissions(false);
            toast.success('Custom permissions reset');
        }, 500);
    };

    // Generate password
    const generatePassword = (): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const handleGeneratePassword = () => {
        setIsGeneratingPassword(true);
        const newPassword = generatePassword();
        updateFormData({
            password: newPassword,
            password_confirmation: newPassword,
        });
        setPasswordResetMode(true);
        setTimeout(() => setIsGeneratingPassword(false), 500);
        toast.success('Password generated');
    };

    const handleForcePasswordReset = () => {
        handleGeneratePassword();
        updateFormData({ require_password_change: true, send_reset_email: true });
    };

    const clearPasswordFields = () => {
        updateFormData({ password: '', password_confirmation: '' });
        setPasswordResetMode(false);
    };

    // Handle reset
    const handleReset = () => {
        if (confirm('Reset all changes to the original values?')) {
            resetForm();
            setLocalSelectedPermissions(user.permissions?.map((p: any) => p.id) || []);
            setPasswordResetMode(false);
            toast.info('Form reset to original values');
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.users.show', user.id));
            }
        } else {
            router.visit(route('admin.users.show', user.id));
        }
    };

    // Handle delete
    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.users.destroy', user.id), {
            onSuccess: () => {
                toast.success('User deleted successfully');
                router.visit(route('admin.users.index'));
            },
            onError: () => {
                toast.error('Failed to delete user');
                setShowDeleteDialog(false);
            }
        });
    };

    // Get permission by ID
    const getPermissionById = (permissionId: number): Permission | undefined => {
        return flattenedPermissions.find((p: Permission) => p && p.id === permissionId);
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        security: getTabStatus('security'),
        permissions: getTabStatus('permissions'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'First Name', value: !!formData.first_name, tabId: 'basic' },
        { label: 'Last Name', value: !!formData.last_name, tabId: 'basic' },
        { label: 'Email Address', value: !!formData.email, tabId: 'basic' },
        { label: 'Username', value: !!formData.username, tabId: 'basic' },
        { label: 'User Role', value: !!formData.role_id, tabId: 'basic' },
    ];

    const tabOrder = ['basic', 'security', 'permissions', 'settings'];

    // Count changed fields
    const changedFieldsCount = () => {
        if (!initialFormData) return 0;
        let count = 0;
        if (formData.first_name !== initialFormData.first_name) count++;
        if (formData.last_name !== initialFormData.last_name) count++;
        if (formData.email !== initialFormData.email) count++;
        if (formData.username !== initialFormData.username) count++;
        if (formData.contact_number !== initialFormData.contact_number) count++;
        if (formData.position !== initialFormData.position) count++;
        if (formData.department_id !== initialFormData.department_id) count++;
        if (formData.role_id !== initialFormData.role_id) count++;
        if (formData.status !== initialFormData.status) count++;
        if (formData.require_password_change !== initialFormData.require_password_change) count++;
        if (formData.is_email_verified !== initialFormData.is_email_verified) count++;
        if (JSON.stringify(formData.selected_permissions) !== JSON.stringify(initialFormData.selected_permissions)) count++;
        if (formData.password !== '') count++;
        return count;
    };

    return (
        <AppLayout
            title={`Edit User: ${user.first_name} ${user.last_name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Users', href: '/admin/users' },
                { title: `${user.first_name} ${user.last_name}`, href: route('admin.users.show', user.id) },
                { title: 'Edit', href: route('admin.users.edit', user.id) }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Edit User"
                    description={`Editing ${user.first_name} ${user.last_name}`}
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    actions={
                        <div className="flex items-center gap-2">
                            {hasUnsavedChanges && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                                >
                                    <History className="h-4 w-4" />
                                    Reset
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                            <div className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800">
                                ID: {user.id}
                            </div>
                            <div className={`px-2 py-1 rounded-md text-xs ${
                                formData.status === 'active' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                                {formData.status}
                            </div>
                        </div>
                    }
                />

                {/* Unsaved Changes Banner */}
                {hasUnsavedChanges && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
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

                {/* Status Change Warning */}
                {user.status !== formData.status && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-800 dark:text-yellow-300">Status Change</p>
                                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                                    User status will be changed from <strong>{user.status}</strong> to <strong>{formData.status}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Suspended User Notice */}
                {user.status === 'suspended' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-800 dark:text-red-300">Account Suspended</p>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    This account is currently suspended. To reactivate, change status to active.
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
                                <FormContainer title="Basic Information" description="Update the user's personal and professional details">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={errors}
                                        user={user}
                                        roles={roles}
                                        departments={departments}
                                        selectedRole={selectedRole}
                                        selectedDepartment={selectedDepartment}
                                        onInputChange={handleInputChange}
                                        onSelectChange={handleSelectChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    showPrevious={false}
                                    nextLabel="Next: Security"
                                />
                            </>
                        )}

                        {activeTab === 'security' && (
                            <>
                                <FormContainer title="Password & Security" description="Update the user's login credentials">
                                    <SecurityTab
                                        formData={formData}
                                        errors={errors}
                                        showPassword={showPassword}
                                        passwordResetMode={passwordResetMode}
                                        onToggleShowPassword={() => setShowPassword(!showPassword)}
                                        onGeneratePassword={handleGeneratePassword}
                                        onForcePasswordReset={handleForcePasswordReset}
                                        onClearPasswordFields={clearPasswordFields}
                                        isGeneratingPassword={isGeneratingPassword}
                                        onInputChange={handleInputChange}
                                        onSwitchChange={(name, checked) => updateFormData({ [name]: checked })}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Permissions"
                                />
                            </>
                        )}

                        {activeTab === 'permissions' && (
                            <>
                                <FormContainer 
                                    title="System Permissions" 
                                    description="Select modules and features this user can access. Permissions from role are shown in blue and cannot be changed."
                                >
                                    <PermissionsTab
                                        formData={formData}
                                        errors={errors}
                                        permissions={permissions}
                                        permissionModules={permissionModules}
                                        selectedRolePermissions={selectedRolePermissions}
                                        selectedPermissionsCount={selectedPermissionsCount}
                                        flattenedPermissions={flattenedPermissions}
                                        onTogglePermission={togglePermission}
                                        onToggleAllPermissions={toggleAllPermissions}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Security"
                                    nextLabel="Next: Settings"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer title="Account Settings" description="Configure account behavior and access options">
                                    <SettingsTab
                                        formData={formData}
                                        errors={errors}
                                        user={user}
                                        lastLogin={formatDate(user.last_login_at)}
                                        emailVerifiedAt={formatDate(user.email_verified_at)}
                                        createdAt={formatDate(user.created_at)}
                                        onStatusChange={(checked) => updateFormData({ status: checked ? 'active' : 'inactive' })}
                                        isSubmitting={isSubmitting} onSwitchChange={function (name: string, checked: boolean): void {
                                            throw new Error('Function not implemented.');
                                        } }                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Permissions"
                                    showNext={false}
                                    submitLabel="Update User"
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
                                
                                {/* User Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">User Summary</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                                                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium dark:text-gray-200">
                                                    {formData.first_name || formData.last_name
                                                        ? `${formData.first_name} ${formData.last_name}`.trim()
                                                        : <span className="text-gray-400 italic">User</span>
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {selectedRole?.name || 'No role selected'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                                <span className="font-medium dark:text-gray-300 truncate max-w-[180px]">
                                                    {formData.email || <span className="text-gray-400 italic">Not set</span>}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Username:</span>
                                                <span className="font-mono font-medium dark:text-gray-300">
                                                    {formData.username || <span className="text-gray-400 italic">Not set</span>}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                <span className={`font-medium ${
                                                    formData.status === 'active' 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                    {formData.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Permissions Summary */}
                                        <div className="pt-2 border-t dark:border-gray-700">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Permissions:</span>
                                                <span className="text-xs font-medium dark:text-gray-300">
                                                    {selectedPermissionsCount} total
                                                </span>
                                            </div>
                                            {selectedPermissionsCount > 0 ? (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    ({localSelectedPermissions.length} custom + {selectedRolePermissions.length} from role)
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">No permissions selected</p>
                                            )}
                                        </div>

                                        {/* Last Updated Info */}
                                        <div className="pt-2 border-t dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Last updated: {formatDate(user.updated_at)}
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
                            Delete User
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete user "{user.first_name} {user.last_name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
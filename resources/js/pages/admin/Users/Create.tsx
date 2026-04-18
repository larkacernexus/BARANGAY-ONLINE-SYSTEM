// pages/admin/users/create.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
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
import { User, Lock, Shield, Settings, Sparkles, Key, Loader2, RefreshCw } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/users/create/basic-info-tab';
import { SecurityTab } from '@/components/admin/users/create/security-tab';
import { PermissionsTab } from '@/components/admin/users/create/permissions-tab';
import { SettingsTab } from '@/components/admin/users/create/settings-tab';
import { route } from 'ziggy-js';

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
    send_setup_email: boolean;
}

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: User, requiredFields: ['first_name', 'last_name', 'email', 'username', 'role_id'] },
    { id: 'security', label: 'Security', icon: Lock, requiredFields: ['password', 'password_confirmation'] },
    { id: 'permissions', label: 'Permissions', icon: Shield, requiredFields: [] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['first_name', 'last_name', 'email', 'username', 'role_id'],
    security: ['password', 'password_confirmation'],
    permissions: [],
    settings: []
};

interface PageProps {
    permissions: Record<string, Permission[]> | null;
    roles: Role[] | null;
    departments: Department[] | null;
    [key: string]: unknown;
}

import type { Permission, UserRole as Role, UserDepartment as Department } from '@/types/admin/users/user-types';
import { Button } from '@/components/ui/button';

export default function CreateUser() {
    const { props } = usePage<PageProps>();
    const {
        permissions = {},
        roles = [],
        departments = []
    } = props;

    const [showPreview, setShowPreview] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

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
        updateFormData
    } = useFormManager<FormData>({
        initialData: {
            first_name: '',
            last_name: '',
            email: '',
            username: '',
            password: '',
            password_confirmation: '',
            contact_number: '',
            position: '',
            department_id: '',
            role_id: '',
            selected_permissions: [],
            status: 'active',
            require_password_change: false,
            is_email_verified: false,
            send_setup_email: false,
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            router.post(route('users.store'), data as any, {
                onSuccess: () => {
                    toast.success('User created successfully');
                    router.visit(route('admin.users.index'));
                },
                onError: (errs) => {
                    toast.error('Failed to create user');
                }
            });
        }
    });

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

    const selectedRolePermissions = useMemo(() => {
        if (!selectedRole || !selectedRole.permissions) return [];
        return selectedRole.permissions
            .filter((p: { id: null | undefined; }) => p && p.id !== undefined && p.id !== null)
            .map((p: { id: any; }) => p.id);
    }, [selectedRole]);

    const selectedPermissionsCount = useMemo(() => {
        return formData.selected_permissions.length + selectedRolePermissions.length;
    }, [formData.selected_permissions, selectedRolePermissions]);

    const permissionModules = useMemo(() => {
        if (!permissions || typeof permissions !== 'object') return [];
        return Object.keys(permissions).filter(key =>
            Array.isArray(permissions[key]) && permissions[key].length > 0
        );
    }, [permissions]);

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
        setTimeout(() => setIsGeneratingPassword(false), 500);
    };

    // Generate username from name
    const generateUsername = () => {
        if (formData.first_name && formData.last_name) {
            const username = `${formData.first_name.toLowerCase()}.${formData.last_name.toLowerCase()}`
                .replace(/[^a-z0-9.]/g, '');
            updateFormData({ username });
            toast.success('Username generated successfully');
        } else {
            toast.error('Please enter first and last name first');
        }
    };

    // Toggle permission
    const togglePermission = (permissionId: number) => {
        if (formData.selected_permissions.includes(permissionId)) {
            updateFormData({
                selected_permissions: formData.selected_permissions.filter(id => id !== permissionId)
            });
        } else {
            updateFormData({
                selected_permissions: [...formData.selected_permissions, permissionId]
            });
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

        const allSelected = permissionIds.every(id => formData.selected_permissions.includes(id));

        if (allSelected) {
            updateFormData({
                selected_permissions: formData.selected_permissions.filter(id => !permissionIds.includes(id))
            });
        } else {
            const newIds = permissionIds.filter(id => !formData.selected_permissions.includes(id));
            updateFormData({
                selected_permissions: [...formData.selected_permissions, ...newIds]
            });
        }
    };

    // Reset form
    const handleReset = () => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            updateFormData({
                first_name: '',
                last_name: '',
                email: '',
                username: '',
                password: '',
                password_confirmation: '',
                contact_number: '',
                position: '',
                department_id: '',
                role_id: '',
                selected_permissions: [],
                status: 'active',
                require_password_change: false,
                is_email_verified: false,
                send_setup_email: false,
            });
            setActiveTab('basic');
            toast.info('Form reset');
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (formData.first_name || formData.last_name || formData.email || formData.username) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.users.index'));
            }
        } else {
            router.visit(route('admin.users.index'));
        }
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
        { label: 'Password', value: !!formData.password, tabId: 'security' },
        { label: 'Confirm Password', value: !!(formData.password && formData.password_confirmation && formData.password === formData.password_confirmation), tabId: 'security' }
    ];

    const tabOrder = ['basic', 'security', 'permissions', 'settings'];

    // Loading state
    if (!permissions || !roles || !departments) {
        return (
            <AppLayout
                title="Create User"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Users', href: '/admin/users' },
                    { title: 'Create', href: '/admin/users/create' }
                ]}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Loading user creation form...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Create User"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Users', href: '/admin/users' },
                { title: 'Create', href: '/admin/users/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create User"
                    description="Add a new user account with specific permissions"
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

                {/* Quick Tips Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium text-blue-800 dark:text-blue-300">Quick tips for creating users</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                Set up user accounts with appropriate roles and permissions.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={generateUsername}
                                    disabled={!formData.first_name || !formData.last_name || isSubmitting}
                                    className="gap-2 dark:border-gray-600 dark:text-gray-300"
                                    type="button"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    Generate Username
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGeneratePassword}
                                    disabled={isGeneratingPassword || isSubmitting}
                                    className="gap-2 dark:border-gray-600 dark:text-gray-300"
                                    type="button"
                                >
                                    <Key className="h-3 w-3" />
                                    Generate Password
                                </Button>
                            </div>
                        </div>
                    </div>
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
                                <FormContainer title="Basic Information" description="Enter the user's personal and professional details">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={errors}
                                        roles={roles}
                                        departments={departments}
                                        selectedRole={selectedRole}
                                        selectedDepartment={selectedDepartment}
                                        onInputChange={handleInputChange}
                                        onSelectChange={handleSelectChange}
                                        onGenerateUsername={generateUsername}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.first_name && !!formData.last_name && !!formData.email && !!formData.username && !!formData.role_id}
                                    showPrevious={false}
                                    nextLabel="Next: Security"
                                />
                            </>
                        )}

                        {activeTab === 'security' && (
                            <>
                                <FormContainer title="Password & Security" description="Set up the user's login credentials">
                                    <SecurityTab
                                        formData={formData}
                                        errors={errors}
                                        showPassword={showPassword}
                                        onToggleShowPassword={() => setShowPassword(!showPassword)}
                                        onGeneratePassword={handleGeneratePassword}
                                        isGeneratingPassword={isGeneratingPassword}
                                        onInputChange={handleInputChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.password && formData.password === formData.password_confirmation}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Permissions"
                                />
                            </>
                        )}

                        {activeTab === 'permissions' && (
                            <>
                                <FormContainer title="System Permissions" description="Select modules and features this user can access. Permissions from role are shown in blue.">
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
                                        onSwitchChange={(name, checked) => updateFormData({ [name]: name === 'status' ? (checked ? 'active' : 'inactive') : checked })}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Permissions"
                                    showNext={false}
                                    submitLabel="Create User"
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
                                                        : <span className="text-gray-400 italic">New User</span>
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
                                                <div className="flex gap-1 flex-wrap max-h-20 overflow-y-auto">
                                                    {selectedPermissionsCount > 0 && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            ({formData.selected_permissions.length} custom + {selectedRolePermissions.length} from role)
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">No permissions selected</p>
                                            )}
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
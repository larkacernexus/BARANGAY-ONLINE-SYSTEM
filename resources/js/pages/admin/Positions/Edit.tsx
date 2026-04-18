// pages/admin/positions/edit.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { FormContainer } from '@/components/adminui/form/form-container';
import { FormTabs, TabConfig } from '@/components/adminui/form/form-tabs';
import { FormProgress } from '@/components/adminui/form/form-progress';
import { FormNavigation } from '@/components/adminui/form/form-navigation';
import { FormErrors } from '@/components/adminui/form/form-errors';
import { RequiredFieldsChecklist } from '@/components/adminui/form/required-fields-checklist';
import { useFormManager } from '@/hooks/admin/use-form-manager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Target, Settings, Info, BookOpen, Tag, Users, History, AlertCircle, Trash2 } from 'lucide-react';
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
import { BasicInfoTab } from '@/components/admin/positions/create/basic-info-tab';
import { AssignmentTab } from '@/components/admin/positions/create/assignment-tab';
import { SettingsTab } from '@/components/admin/positions/create/settings-tab';
import { route } from 'ziggy-js';

// Types
interface Committee {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
}

interface Role {
    id: number;
    name: string;
    description?: string;
}

interface Official {
    id: number;
    name: string;
}

interface Position {
    id: number;
    code: string;
    name: string;
    description: string | null;
    order: number;
    requires_account: boolean;
    is_active: boolean;
    committee_id: number | null;
    committee?: Committee;
    role_id?: number | null;
    role?: Role;
    officials_count?: number;
    created_at: string;
    updated_at: string;
}

interface FormData {
    code: string;
    name: string;
    description: string;
    order: number;
    requires_account: boolean;
    is_active: boolean;
    committee_id: number | null;
    role_id: number | null;
}

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: Shield, requiredFields: ['name', 'code'] },
    { id: 'assignment', label: 'Assignment', icon: Target, requiredFields: [] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['name', 'code'],
    assignment: [],
    settings: []
};

export default function EditPosition() {
    const { props } = usePage<{
        position: Position;
        committees: Committee[];
        roles: Role[];
        officials?: Official[];
    }>();
    const { position, committees = [], roles = [], officials = [] } = props;
    
    const [showPreview, setShowPreview] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const hasOfficials = (position.officials_count ?? 0) > 0;

    const {
        formData,
        errors,
        isSubmitting,
        activeTab,
        formProgress,
        allRequiredFieldsFilled,
        handleInputChange,
        handleSelectChange,
        handleSwitchChange,
        handleSubmit,
        setActiveTab,
        getTabStatus,
        getMissingFields,
        goToNextTab,
        goToPrevTab,
        updateFormData,
        setErrors
    } = useFormManager<FormData>({
        initialData: {
            code: position.code || '',
            name: position.name || '',
            description: position.description || '',
            order: position.order || 0,
            requires_account: position.requires_account ?? false,
            is_active: position.is_active ?? true,
            committee_id: position.committee_id || null,
            role_id: position.role_id || null,
        },
        requiredFields: requiredFieldsMap,
        validationRules: {
            name: (value) => !value?.trim() ? 'Position name is required' : undefined,
            code: (value) => {
                if (!value?.trim()) return 'Position code is required';
                if (!/^[A-Z0-9_]+$/.test(value)) return 'Code must contain only uppercase letters, numbers, and underscores';
                return undefined;
            },
            order: (value) => value < 0 ? 'Display order cannot be negative' : undefined
        },
        onSubmit: (data) => {
            router.put(route('admin.positions.update', position.id), data as any, {
                onSuccess: () => {
                    toast.success('Position updated successfully');
                    router.visit(route('admin.positions.show', position.id));
                },
                onError: (errs) => {
                    setErrors(errs);
                    toast.error('Failed to update position');
                }
            });
        }
    });

    // Check for unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        const originalData = {
            code: position.code || '',
            name: position.name || '',
            description: position.description || '',
            order: position.order || 0,
            requires_account: position.requires_account ?? false,
            is_active: position.is_active ?? true,
            committee_id: position.committee_id || null,
            role_id: position.role_id || null,
        };

        return Object.keys(originalData).some(key => {
            const originalValue = originalData[key as keyof typeof originalData];
            const currentValue = formData[key as keyof FormData];
            
            if (originalValue === null && currentValue === null) return false;
            if (originalValue === undefined && currentValue === undefined) return false;
            if (originalValue === '' && currentValue === '') return false;
            
            return String(originalValue) !== String(currentValue);
        });
    }, [formData, position]);

    // Count changed fields
    const changedFieldsCount = useMemo(() => {
        let count = 0;
        if (formData.code !== position.code) count++;
        if (formData.name !== position.name) count++;
        if (formData.description !== (position.description || '')) count++;
        if (formData.order !== position.order) count++;
        if (formData.requires_account !== position.requires_account) count++;
        if (formData.is_active !== position.is_active) count++;
        if (formData.committee_id !== position.committee_id) count++;
        if (formData.role_id !== position.role_id) count++;
        return count;
    }, [formData, position]);

    // Check if position is Kagawad type
    const isKagawadPosition = useMemo(() => {
        return formData.name?.toLowerCase().includes('kagawad') || 
               formData.code?.toLowerCase().includes('kagawad');
    }, [formData.name, formData.code]);

    // Get selected committee and role
    const selectedCommittee = formData.committee_id 
        ? committees.find(c => c.id === formData.committee_id)
        : null;
    
    const selectedRole = formData.role_id
        ? roles.find(r => r.id === formData.role_id)
        : null;

    // Handle delete
    const handleDelete = () => {
        if (hasOfficials) {
            toast.error('Cannot delete position that has assigned officials. Please reassign officials first.');
            return;
        }
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.positions.destroy', position.id), {
            onSuccess: () => {
                toast.success('Position deleted successfully');
                router.visit(route('admin.positions.index'));
            },
            onError: () => {
                toast.error('Failed to delete position');
                setShowDeleteDialog(false);
            }
        });
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.positions.show', position.id));
            }
        } else {
            router.visit(route('admin.positions.show', position.id));
        }
    };

    const handleReset = () => {
        if (confirm('Reset all changes to the original values?')) {
            updateFormData({
                code: position.code || '',
                name: position.name || '',
                description: position.description || '',
                order: position.order || 0,
                requires_account: position.requires_account ?? false,
                is_active: position.is_active ?? true,
                committee_id: position.committee_id || null,
                role_id: position.role_id || null,
            });
            setActiveTab('basic');
            toast.info('Form reset to original values');
        }
    };

    // Generate code from name
    const generateCode = () => {
        if (formData.name) {
            const code = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            updateFormData({ code });
            toast.success('Code generated from name');
        } else {
            toast.error('Please enter a position name first');
        }
    };

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        assignment: getTabStatus('assignment'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();
    const requiredFieldsList = [
        { label: 'Position Name', value: !!formData.name, tabId: 'basic' },
        { label: 'Position Code', value: !!formData.code, tabId: 'basic' }
    ];

    const tabOrder = ['basic', 'assignment', 'settings'];

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

    return (
        <AppLayout
            title={`Edit Position: ${position.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Positions', href: '/admin/positions' },
                { title: position.name, href: route('admin.positions.show', position.id) },
                { title: 'Edit', href: route('admin.positions.edit', position.id) }
            ]}
        >
            <div className="space-y-6">
                {/* Header with custom actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            type="button"
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Back to Position
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                Edit Position
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {position.code}
                                </Badge>
                                <Badge className={formData.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}>
                                    {formData.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </Button>
                        {hasUnsavedChanges && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                type="button"
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <History className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isSubmitting || hasOfficials}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Last Updated & Changes Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="dark:bg-gray-900">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <History className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Last updated: {formatDate(position.updated_at)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Created: {formatDate(position.created_at)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {hasUnsavedChanges && (
                        <Card className="border-l-4 border-l-blue-500 dark:bg-gray-900">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                                        <span className="font-medium dark:text-gray-200">
                                            {changedFieldsCount} field{changedFieldsCount !== 1 ? 's' : ''} modified
                                        </span>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={handleReset}
                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        <History className="h-4 w-4 mr-1" />
                                        Reset All
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Warning for positions with officials */}
                {hasOfficials && (
                    <Card className="border-l-4 border-l-amber-500 dark:bg-gray-900">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-800 dark:text-amber-300">
                                        This position has {position.officials_count} official(s) assigned
                                    </p>
                                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                        Changing position details may affect assigned officials. Deleting is not allowed while officials are assigned.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <FormErrors errors={errors} />

                {/* Kagawad Warning */}
                {isKagawadPosition && !formData.committee_id && (
                    <Card className="border-l-4 border-l-yellow-500 dark:bg-gray-900">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-yellow-800 dark:text-yellow-300">Kagawad Position Notice</p>
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                                        Kagawad positions usually have a committee assigned. Consider selecting a committee in the Assignment tab.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                                <FormContainer 
                                    title="Basic Information" 
                                    description="Update the core details for this position"
                                >
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={errors}
                                        onNameChange={(e) => handleInputChange(e)}
                                        onCodeChange={(e) => handleInputChange(e)}
                                        onOrderChange={(name, value) => updateFormData({ [name]: value })}
                                        onDescriptionChange={(e) => handleInputChange(e)}
                                        onGenerateCode={generateCode}
                                        isSubmitting={isSubmitting}
                                        maxOrder={position.order}
                                        isCodeManuallyEdited={false}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    showPrevious={false}
                                    nextLabel="Next: Assignment"
                                    submitLabel="Update Position"
                                />
                            </>
                        )}

                        {activeTab === 'assignment' && (
                            <>
                                <FormContainer 
                                    title="Committee & Role Assignment" 
                                    description="Update committee and system role assignments (optional)"
                                >
                                    <AssignmentTab
                                        formData={formData}
                                        errors={errors}
                                        committees={committees}
                                        roles={roles}
                                        onCommitteeSelect={(id) => handleSelectChange('committee_id', id)}
                                        onRoleSelect={(id) => handleSelectChange('role_id', id)}
                                        isSubmitting={isSubmitting}
                                        isKagawadPosition={isKagawadPosition}
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
                                    nextLabel="Next: Settings"
                                    submitLabel="Update Position"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer 
                                    title="Position Settings" 
                                    description="Update position behavior and access options (optional)"
                                >
                                    <SettingsTab
                                        formData={formData}
                                        onSwitchChange={handleSwitchChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                
                                {/* Officials List */}
                                {hasOfficials && officials.length > 0 && (
                                    <Card className="dark:bg-gray-900">
                                        <div className="p-4 border-b dark:border-gray-700">
                                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Assigned Officials ({officials.length})
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {officials.slice(0, 5).map((official) => (
                                                <div key={official.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <span className="text-sm dark:text-gray-300">{official.name}</span>
                                                    <Badge variant="outline" className="dark:border-gray-600">
                                                        Active
                                                    </Badge>
                                                </div>
                                            ))}
                                            {officials.length > 5 && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                                    +{officials.length - 5} more officials
                                                </p>
                                            )}
                                        </div>
                                    </Card>
                                )}

                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Assignment"
                                    showNext={false}
                                    submitLabel="Update Position"
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

                                {/* Position Summary Preview Card */}
                                <Card className="dark:bg-gray-900">
                                    <div className="p-4 border-b dark:border-gray-700">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Info className="h-4 w-4" />
                                            Position Summary
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                                <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium dark:text-gray-200">
                                                    {formData.name || <span className="text-gray-400 italic">Not set</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={formData.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}>
                                                        {formData.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                                        {formData.code || 'No code'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Display Order:</span>
                                                <span className="font-medium dark:text-gray-300">{formData.order}</span>
                                            </div>
                                            {selectedCommittee && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">Committee:</span>
                                                    <span className="font-medium dark:text-gray-300">{selectedCommittee.name}</span>
                                                </div>
                                            )}
                                            {selectedRole && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">System Role:</span>
                                                    <span className="font-medium dark:text-gray-300">{selectedRole.name}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Officials:</span>
                                                <span className="font-medium dark:text-gray-300">{position.officials_count || 0}</span>
                                            </div>
                                        </div>

                                        {formData.description && (
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                                                    {formData.description}
                                                </p>
                                            </div>
                                        )}

                                        <Separator className="dark:bg-gray-700" />

                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Settings</h4>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${formData.requires_account ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                                        {formData.requires_account ? 'Requires Account' : 'No Account Required'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {hasUnsavedChanges && (
                                            <>
                                                <Separator className="dark:bg-gray-700" />
                                                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                                                        {changedFieldsCount} field{changedFieldsCount !== 1 ? 's' : ''} modified
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Card>

                                {/* Quick Tips Card */}
                                <Card className="dark:bg-gray-900">
                                    <div className="p-4 border-b dark:border-gray-700">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 flex items-center justify-center">
                                                <BookOpen className="h-3 w-3 text-white" />
                                            </div>
                                            Quick Tips
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm flex items-center gap-2 dark:text-gray-200">
                                                <Tag className="h-3 w-3 text-indigo-500" />
                                                Position Naming
                                            </h4>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                <li>Use official position titles (e.g., Punong Barangay)</li>
                                                <li>For Kagawad, include committee (e.g., Kagawad - Peace and Order)</li>
                                                <li>Keep names clear and descriptive</li>
                                            </ul>
                                        </div>
                                        
                                        <Separator className="dark:bg-gray-700" />
                                        
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm flex items-center gap-2 dark:text-gray-200">
                                                <Target className="h-3 w-3 text-green-500" />
                                                Committee Assignment
                                            </h4>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                <li>Kagawad positions should have a committee</li>
                                                <li>Committee determines oversight responsibilities</li>
                                                <li>Update when committee assignments change</li>
                                            </ul>
                                        </div>
                                        
                                        <Separator className="dark:bg-gray-700" />
                                        
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm flex items-center gap-2 dark:text-gray-200">
                                                <Shield className="h-3 w-3 text-purple-500" />
                                                System Access
                                            </h4>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                <li>Key positions require system accounts</li>
                                                <li>Assign appropriate system roles</li>
                                                <li>Account required for dashboard access</li>
                                            </ul>
                                        </div>
                                    </div>
                                </Card>
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
                            Delete Position
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete position "{position.name}"? This action cannot be undone.
                            {hasOfficials && (
                                <span className="block mt-2 text-yellow-600 dark:text-yellow-400">
                                    Warning: This position has {position.officials_count} official(s) assigned.
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
                            disabled={hasOfficials}
                        >
                            Delete Position
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
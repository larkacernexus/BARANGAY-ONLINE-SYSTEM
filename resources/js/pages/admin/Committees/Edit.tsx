// pages/admin/committees/edit.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Target, Settings, Users, Info, BookOpen, Tag, Lock, Unlock, Hash, History, Trash2 } from 'lucide-react';
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
import { BasicInfoTab } from '@/components/admin/committees/create/basic-info-tab';
import { SettingsTab } from '@/components/admin/committees/create/settings-tab';
import { route } from 'ziggy-js';
import type { Committee } from '@/types/admin/committees/committees';

// Types
interface Position {
    id: number;
    name: string;
    code: string;
}

interface CommitteeWithRelations extends Committee {
    positions?: Position[];
    positions_count?: number;
}

interface FormData {
    code: string;
    name: string;
    description: string;
    order: number;
    is_active: boolean;
}

interface PageProps {
    committee: CommitteeWithRelations;
    [key: string]: any;
}

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: Target, requiredFields: ['name', 'code'] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['name', 'code'],
    settings: []
};

export default function EditCommittee() {
    const { props } = usePage<PageProps>();
    const { committee } = props;
    
    const [showPreview, setShowPreview] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const hasPositions = (committee.positions_count ?? 0) > 0;

    // Generate code from name
    const generateCodeFromName = useCallback((name: string): string => {
        if (!name) return '';
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .trim()
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
    }, []);

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
            code: committee.code || '',
            name: committee.name || '',
            description: committee.description || '',
            order: committee.order || 0,
            is_active: committee.is_active ?? true,
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            // Validate before submit
            const newErrors: Record<string, string> = {};
            
            if (!data.name?.trim()) {
                newErrors.name = 'Committee name is required';
            }
            if (!data.code?.trim()) {
                newErrors.code = 'Committee code is required';
            } else if (!/^[a-z0-9_]+$/.test(data.code)) {
                newErrors.code = 'Code must contain only lowercase letters, numbers, and underscores';
            }
            if (data.order < 0) {
                newErrors.order = 'Display order cannot be negative';
            }
            
            if (Object.keys(newErrors).length > 0) {
                setValidationErrors(newErrors);
                toast.error('Please fix the validation errors');
                return;
            }
            
            router.put(route('admin.committees.update', committee.id), data as any, {
                onSuccess: () => {
                    toast.success('Committee updated successfully');
                    router.visit(route('admin.committees.show', committee.id));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to update committee');
                }
            });
        }
    });

    // Combine errors from server and validation
    const allErrors = { ...errors, ...validationErrors };

    // Auto-generate code when name changes (only if not manually edited)
    useEffect(() => {
        if (formData.name && !isCodeManuallyEdited && formData.name !== committee.name) {
            const generatedCode = generateCodeFromName(formData.name);
            if (generatedCode !== formData.code) {
                updateFormData({ code: generatedCode });
            }
        }
    }, [formData.name, isCodeManuallyEdited, generateCodeFromName, formData.code, updateFormData, committee.name]);

    // Clear validation error when name changes
    useEffect(() => {
        if (validationErrors.name && formData.name) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.name;
                return newErrors;
            });
        }
    }, [formData.name, validationErrors.name]);

    // Clear validation error when code changes
    useEffect(() => {
        if (validationErrors.code && formData.code) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.code;
                return newErrors;
            });
        }
    }, [formData.code, validationErrors.code]);

    // Check for unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        const originalData = {
            code: committee.code || '',
            name: committee.name || '',
            description: committee.description || '',
            order: committee.order || 0,
            is_active: committee.is_active ?? true,
        };

        return Object.keys(originalData).some(key => {
            const originalValue = originalData[key as keyof typeof originalData];
            const currentValue = formData[key as keyof FormData];
            
            if (originalValue === null && currentValue === null) return false;
            if (originalValue === undefined && currentValue === undefined) return false;
            if (originalValue === '' && currentValue === '') return false;
            
            return String(originalValue) !== String(currentValue);
        });
    }, [formData, committee]);

    // Count changed fields
    const changedFieldsCount = useMemo(() => {
        let count = 0;
        if (formData.code !== committee.code) count++;
        if (formData.name !== committee.name) count++;
        if (formData.description !== (committee.description || '')) count++;
        if (formData.order !== committee.order) count++;
        if (formData.is_active !== committee.is_active) count++;
        return count;
    }, [formData, committee]);

    // Handle name change
    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        updateFormData({ name: newName });
    }, [updateFormData]);

    // Handle code change
    const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const processedValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        updateFormData({ code: processedValue });
        setIsCodeManuallyEdited(true);
    }, [updateFormData]);

    // Reset to auto-generated code
    const resetToAutoGenerated = useCallback(() => {
        if (formData.name) {
            const generatedCode = generateCodeFromName(formData.name);
            updateFormData({ code: generatedCode });
            setIsCodeManuallyEdited(false);
            toast.success('Code reset to auto-generated value');
        } else {
            toast.error('Please enter a committee name first');
        }
    }, [formData.name, generateCodeFromName, updateFormData]);

    // Handle number input changes
    const handleNumberChange = useCallback((name: string, value: number) => {
        updateFormData({ [name]: value });
    }, [updateFormData]);

    // Handle switch changes
    const handleSwitchChange = useCallback((name: string, checked: boolean) => {
        updateFormData({ [name]: checked });
    }, [updateFormData]);

    // Reset form
    const handleReset = useCallback(() => {
        if (confirm('Reset all changes to the original values?')) {
            resetForm();
            setIsCodeManuallyEdited(false);
            setValidationErrors({});
            setActiveTab('basic');
            toast.info('Form reset to original values');
        }
    }, [resetForm, setActiveTab]);

    const handleCancel = useCallback(() => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.committees.show', committee.id));
            }
        } else {
            router.visit(route('admin.committees.show', committee.id));
        }
    }, [hasUnsavedChanges, committee.id]);

    // Handle delete
    const handleDelete = () => {
        if (hasPositions) {
            toast.error('Cannot delete committee that has assigned positions. Please reassign positions first.');
            return;
        }
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.committees.destroy', committee.id), {
            onSuccess: () => {
                toast.success('Committee deleted successfully');
                router.visit(route('admin.committees.index'));
            },
            onError: () => {
                toast.error('Failed to delete committee');
                setShowDeleteDialog(false);
            }
        });
    };

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();
    const requiredFieldsList = [
        { label: 'Committee Name', value: !!formData.name, tabId: 'basic' },
        { label: 'Committee Code', value: !!formData.code, tabId: 'basic' }
    ];

    const tabOrder = ['basic', 'settings'];

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
            title={`Edit Committee: ${committee.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Committees', href: '/admin/committees' },
                { title: committee.name, href: route('admin.committees.show', committee.id) },
                { title: 'Edit', href: route('admin.committees.edit', committee.id) }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Edit Committee"
                    description={`Editing ${committee.name}`}
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
                                disabled={isSubmitting || hasPositions}
                                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                            <div className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800">
                                ID: {committee.id}
                            </div>
                            <div className={`px-2 py-1 rounded-md text-xs ${
                                formData.is_active 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                                {formData.is_active ? 'Active' : 'Inactive'}
                            </div>
                            <div className="font-mono text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-md">
                                {formData.code || 'No code'}
                            </div>
                        </div>
                    }
                />

                {/* Last Updated & Changes Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="dark:bg-gray-900">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <History className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Last updated: {formatDate(committee.updated_at)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Created: {formatDate(committee.created_at)}
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

                {/* Warning for committees with positions */}
                {hasPositions && (
                    <Card className="border-l-4 border-l-amber-500 dark:bg-gray-900">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-800 dark:text-amber-300">
                                        This committee has {committee.positions_count} position(s) assigned
                                    </p>
                                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                        Changing committee details may affect assigned positions. Deleting is not allowed while positions are assigned.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <FormErrors errors={allErrors} />

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
                                    description="Update the core details for this committee"
                                >
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        onNameChange={handleNameChange}
                                        onCodeChange={handleCodeChange}
                                        onOrderChange={handleNumberChange}
                                        onDescriptionChange={handleInputChange}
                                        onResetCode={resetToAutoGenerated}
                                        isSubmitting={isSubmitting}
                                        nextOrder={committee.order}
                                        isCodeManuallyEdited={isCodeManuallyEdited}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
                                    showPrevious={false}
                                    nextLabel="Next: Settings"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer 
                                    title="Committee Settings" 
                                    description="Update committee behavior and visibility (optional)"
                                >
                                    <SettingsTab
                                        formData={formData}
                                        onSwitchChange={handleSwitchChange}
                                        isSubmitting={isSubmitting}
                                        originalValues={{
                                            is_active: committee.is_active
                                        }}
                                    />
                                </FormContainer>

                                {/* Positions List */}
                                {hasPositions && committee.positions && committee.positions.length > 0 && (
                                    <Card className="dark:bg-gray-900">
                                        <div className="p-4 border-b dark:border-gray-700">
                                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Assigned Positions ({committee.positions.length})
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {committee.positions.slice(0, 5).map((position) => (
                                                <div key={position.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <span className="text-sm dark:text-gray-300">{position.name}</span>
                                                    <Badge variant="outline" className="dark:border-gray-600">
                                                        {position.code}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {committee.positions.length > 5 && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                                    +{committee.positions.length - 5} more positions
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
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
                                    previousLabel="Back: Basic Info"
                                    showNext={false}
                                    submitLabel="Update Committee"
                                />
                            </>
                        )}
                    </div>

                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled && !!formData.name && !!formData.code}
                                    missingFields={missingFields}
                                    onMissingFieldClick={(tabId) => setActiveTab(tabId)}
                                />
                                
                                <RequiredFieldsChecklist
                                    fields={requiredFieldsList}
                                    onTabClick={(tabId) => setActiveTab(tabId)}
                                    missingFields={missingFields}
                                />

                                {/* Committee Summary Preview Card */}
                                <Card className="dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800">
                                    <div className="p-4 border-b dark:border-gray-700">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Target className="h-4 w-4" />
                                            Committee Summary
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                                                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Code Source:</span>
                                                <span className="font-medium dark:text-gray-300 flex items-center gap-1">
                                                    {isCodeManuallyEdited ? (
                                                        <>
                                                            <Unlock className="h-3 w-3 text-amber-500" />
                                                            Manual
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="h-3 w-3 text-green-500" />
                                                            Auto-generated
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Positions:</span>
                                                <span className="font-medium dark:text-gray-300">{committee.positions_count || 0}</span>
                                            </div>
                                        </div>

                                        {formData.description && (
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                                    {formData.description}
                                                </p>
                                            </div>
                                        )}

                                        <Separator className="dark:bg-gray-700" />

                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Settings</h4>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${formData.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                    {formData.is_active ? 'Active - Available for assignment' : 'Inactive - Hidden from selection'}
                                                </span>
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
                                                <Tag className="h-3 w-3 text-purple-500" />
                                                Committee Naming
                                            </h4>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                <li>Use clear, descriptive names (e.g., "Peace and Order")</li>
                                                <li>Include "Committee" for clarity if needed</li>
                                                <li>Keep names concise but informative</li>
                                            </ul>
                                        </div>
                                        
                                        <Separator className="dark:bg-gray-700" />
                                        
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm flex items-center gap-2 dark:text-gray-200">
                                                <Lock className="h-3 w-3 text-green-500" />
                                                Code Generation
                                            </h4>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                <li>Auto-generated from name (lowercase with underscores)</li>
                                                <li>Manually edit code by typing in the field</li>
                                                <li>Codes must be unique across all committees</li>
                                            </ul>
                                        </div>
                                        
                                        <Separator className="dark:bg-gray-700" />
                                        
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm flex items-center gap-2 dark:text-gray-200">
                                                <Hash className="h-3 w-3 text-amber-500" />
                                                Display Order
                                            </h4>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                <li>Lower numbers appear first in dropdowns</li>
                                                <li>Helps organize committees logically</li>
                                                <li>Can be reordered later if needed</li>
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
                            Delete Committee
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete committee "{committee.name}"? This action cannot be undone.
                            {hasPositions && (
                                <span className="block mt-2 text-yellow-600 dark:text-yellow-400">
                                    Warning: This committee has {committee.positions_count} position(s) assigned.
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
                            disabled={hasPositions}
                        >
                            Delete Committee
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
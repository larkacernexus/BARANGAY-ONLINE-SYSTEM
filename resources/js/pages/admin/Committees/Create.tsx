// pages/admin/committees/create.tsx
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
import { Target, Settings, Sparkles, Copy, RefreshCw, Info, BookOpen, Tag, Lock, Unlock, Hash } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/committees/create/basic-info-tab';
import { SettingsTab } from '@/components/admin/committees/create/settings-tab';
import { route } from 'ziggy-js';
import type { Committee } from '@/types/admin/committees/committees';

// Types
interface CommitteeTemplate {
    name: string;
    code: string;
    description: string;
    order: number;
    is_active: boolean;
}

interface FormData {
    code: string;
    name: string;
    description: string;
    order: number;
    is_active: boolean;
}

interface PageProps {
    nextOrder: number;
    templates?: CommitteeTemplate[];
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

export default function CreateCommittee() {
    const { props } = usePage<PageProps>();
    const { nextOrder = 0, templates = [] } = props;
    
    const [showPreview, setShowPreview] = useState(true);
    const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
            code: '',
            name: '',
            description: '',
            order: nextOrder,
            is_active: true,
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
            
            router.post(route('admin.committees.store'), data as any, {
                onSuccess: () => {
                    toast.success('Committee created successfully');
                    router.visit(route('admin.committees.index'));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to create committee');
                }
            });
        }
    });

    // Combine errors from server and validation
    const allErrors = { ...errors, ...validationErrors };

    // Auto-generate code when name changes
    useEffect(() => {
        if (formData.name && !isCodeManuallyEdited) {
            const generatedCode = generateCodeFromName(formData.name);
            if (generatedCode !== formData.code) {
                updateFormData({ code: generatedCode });
            }
        }
    }, [formData.name, isCodeManuallyEdited, generateCodeFromName, formData.code, updateFormData]);

    // Handle name change
    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        updateFormData({ name: newName });
        
        // Clear validation error if exists
        if (validationErrors.name) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.name;
                return newErrors;
            });
        }
    }, [updateFormData, validationErrors]);

    // Handle code change
    const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const processedValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        updateFormData({ code: processedValue });
        setIsCodeManuallyEdited(true);
        
        // Clear validation error if exists
        if (validationErrors.code) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.code;
                return newErrors;
            });
        }
    }, [updateFormData, validationErrors]);

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
        
        // Clear validation error if exists
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [updateFormData, validationErrors]);

    // Handle switch changes
    const handleSwitchChange = useCallback((name: string, checked: boolean) => {
        updateFormData({ [name]: checked });
    }, [updateFormData]);

    // Apply template
    const applyTemplate = useCallback((template: CommitteeTemplate) => {
        updateFormData({
            name: template.name,
            code: template.code,
            description: template.description,
            order: template.order,
            is_active: template.is_active,
        });
        setIsCodeManuallyEdited(true);
        toast.success(`${template.name} template applied`);
    }, [updateFormData]);

    // Reset form
    const handleReset = useCallback(() => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            resetForm();
            setValidationErrors({});
            setIsCodeManuallyEdited(false);
            setActiveTab('basic');
            toast.info('Form reset');
        }
    }, [resetForm, setActiveTab]);

    const handleCancel = useCallback(() => {
        if (formData.name || formData.code || formData.description) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.committees.index'));
            }
        } else {
            router.visit(route('admin.committees.index'));
        }
    }, [formData]);

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

    // Default templates if none provided
    const defaultTemplates: CommitteeTemplate[] = [
        {
            name: 'Peace and Order',
            code: 'peace_and_order',
            description: 'Maintains peace, order, and public safety in the barangay',
            order: 1,
            is_active: true,
        },
        {
            name: 'Health and Sanitation',
            code: 'health_and_sanitation',
            description: 'Oversees health programs and sanitation initiatives',
            order: 2,
            is_active: true,
        },
        {
            name: 'Education and Culture',
            code: 'education_and_culture',
            description: 'Promotes education, literacy, and cultural activities',
            order: 3,
            is_active: true,
        },
        {
            name: 'Infrastructure and Public Works',
            code: 'infrastructure_and_public_works',
            description: 'Manages barangay infrastructure projects and maintenance',
            order: 4,
            is_active: true,
        },
        {
            name: 'Agriculture and Livelihood',
            code: 'agriculture_and_livelihood',
            description: 'Supports agricultural development and livelihood programs',
            order: 5,
            is_active: true,
        },
    ];

    const displayTemplates = templates.length > 0 ? templates : defaultTemplates;

    return (
        <AppLayout
            title="Create Committee"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Committees', href: '/admin/committees' },
                { title: 'Create', href: '/admin/committees/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create Committee"
                    description="Add a new committee for barangay officials"
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    backLabel="Back"
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
                <Card className="border-l-4 border-l-purple-500 dark:bg-gray-900">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-medium text-purple-800 dark:text-purple-300">Quick start with templates</h3>
                                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                                    Choose from common committee templates to get started quickly.
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {displayTemplates.map((template) => (
                                        <Button
                                            key={template.code}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => applyTemplate(template)}
                                            className="gap-2 dark:border-gray-600 dark:text-gray-300"
                                            type="button"
                                        >
                                            <Copy className="h-3 w-3" />
                                            {template.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                                    description="Enter the core details for this committee"
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
                                        nextOrder={nextOrder}
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
                                    submitLabel="Create Committee"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer 
                                    title="Committee Settings" 
                                    description="Configure committee behavior and visibility (optional)"
                                >
                                    <SettingsTab
                                        formData={formData}
                                        onSwitchChange={handleSwitchChange}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
                                    previousLabel="Back: Basic Info"
                                    showNext={false}
                                    submitLabel="Create Committee"
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

                                        {/* Summary Card */}
                                        <Card className="dark:bg-gray-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                                            <div className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Info className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {allRequiredFieldsFilled && !!formData.name && !!formData.code
                                                            ? `"${formData.name}" committee is ready to be created`
                                                            : `${missingFields.length} required field${missingFields.length !== 1 ? 's' : ''} remaining`}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
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
        </AppLayout>
    );
}
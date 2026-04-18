// pages/admin/positions/create.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useCallback, useMemo, useRef } from 'react';
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
import { Shield, Target, Settings, Sparkles, Copy, RefreshCw, Info, BookOpen, Tag, AlertCircle, CheckCircle, Circle, AlertTriangle } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/positions/create/basic-info-tab';
import { AssignmentTab } from '@/components/admin/positions/create/assignment-tab';
import { SettingsTab } from '@/components/admin/positions/create/settings-tab';
import { route } from 'ziggy-js';
import { 
    Committee, 
    Role, 
} from '@/types/admin/positions/position.types';


interface PositionTemplate {
    name: string;
    code: string;
    description: string;
    order: number;
    requires_account: boolean;
    is_active: boolean;
    committee_name?: string;
}

interface FormData {
    code: string;
    name: string;
    description: string;
    order: number;
    committee_id: number | null;
    role_id: number | null;
    additional_committees: number[];
    requires_account: boolean;
    is_active: boolean;
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

export default function CreatePosition() {
    const { props } = usePage<{
        committees: Committee[];
        roles: Role[];
        maxOrder: number;
        templates?: PositionTemplate[];
    }>();
    const { committees = [], roles = [], maxOrder = 0, templates = [] } = props;
    
    const [showPreview, setShowPreview] = useState(true);
    const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);
    const prevNameRef = useRef<string>('');

    // Generate code from name
    const generateCodeFromName = useCallback((name: string): string => {
        if (!name) return '';
        return name
            .toUpperCase()
            .replace(/[^A-Z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
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
    updateFormData
} = useFormManager<FormData>({
    initialData: {
        code: '',
        name: '',
        description: '',
        order: maxOrder + 1,
        committee_id: null,
        role_id: null,
        additional_committees: [],
        requires_account: false,
        is_active: true,
    },
    requiredFields: requiredFieldsMap,
    // Remove validationRules - it's not supported
    onSubmit: (data) => {
        router.post(route('admin.positions.store'), data as any, {
            onSuccess: () => {
                toast.success('Position created successfully');
                router.visit(route('admin.positions.index'));
            },
            onError: (errs) => {
                toast.error('Failed to create position');
            }
        });
    }
});

    // Handle name change with auto code generation
    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        updateFormData({ name: newName });
        
        if (!isCodeManuallyEdited) {
            const generatedCode = generateCodeFromName(newName);
            updateFormData({ code: generatedCode });
        }
    }, [isCodeManuallyEdited, generateCodeFromName, updateFormData]);

    // Handle code change
    const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const processedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
        updateFormData({ code: processedValue });
        setIsCodeManuallyEdited(true);
    }, [updateFormData]);

    // Handle manual generate code button
    const handleGenerateCode = useCallback(() => {
        if (formData.name) {
            const generatedCode = generateCodeFromName(formData.name);
            updateFormData({ code: generatedCode });
            setIsCodeManuallyEdited(false);
            toast.success('Code generated from name');
        } else {
            toast.error('Please enter a position name first');
        }
    }, [formData.name, generateCodeFromName, updateFormData]);

    // Handle number input changes
    const handleNumberChange = useCallback((name: string, value: number) => {
        updateFormData({ [name]: value });
    }, [updateFormData]);

    // Handle switch changes
    const handleSwitchChange = useCallback((name: keyof FormData, checked: boolean) => {
        updateFormData({ [name]: checked });
    }, [updateFormData]);

    // Apply template
    const applyTemplate = useCallback((template: PositionTemplate) => {
        updateFormData({
            name: template.name,
            code: template.code,
            description: template.description,
            order: template.order,
            requires_account: template.requires_account,
            is_active: template.is_active,
        });
        
        setIsCodeManuallyEdited(false);
        
        if (template.committee_name && committees.length > 0) {
            const committee = committees.find(c => 
                c.name.toLowerCase().includes(template.committee_name?.toLowerCase() || '')
            );
            if (committee) {
                updateFormData({ committee_id: committee.id });
            }
        }
        
        toast.success(`${template.name} template applied`);
    }, [committees, updateFormData]);

    // Reset form
    const handleReset = useCallback(() => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            updateFormData({
                code: '',
                name: '',
                description: '',
                order: maxOrder + 1,
                committee_id: null,
                role_id: null,
                additional_committees: [],
                requires_account: false,
                is_active: true,
            });
            setIsCodeManuallyEdited(false);
            setActiveTab('basic');
            toast.info('Form reset');
        }
    }, [maxOrder, updateFormData, setActiveTab]);

    const handleCancel = useCallback(() => {
        if (formData.name || formData.code || formData.description) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.positions.index'));
            }
        } else {
            router.visit(route('admin.positions.index'));
        }
    }, [formData]);

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

    // Check if position is Kagawad type
    const isKagawadPosition = useMemo(() => {
        return formData.name?.toLowerCase().includes('kagawad') ||
            formData.code?.toLowerCase().includes('kagawad');
    }, [formData.name, formData.code]);

    // Default templates if none provided
    const defaultTemplates: PositionTemplate[] = [
        {
            name: 'Punong Barangay',
            code: 'PUNONG_BARANGAY',
            description: 'Chief executive of the barangay, responsible for overall governance and administration',
            order: 1,
            requires_account: true,
            is_active: true,
        },
        {
            name: 'Barangay Kagawad',
            code: 'KAGAWAD',
            description: 'Barangay council member responsible for specific committees',
            order: 2,
            requires_account: true,
            is_active: true,
        },
        {
            name: 'Barangay Secretary',
            code: 'SECRETARY',
            description: 'Records keeper and administrative officer of the barangay',
            order: 3,
            requires_account: true,
            is_active: true,
        },
        {
            name: 'Barangay Treasurer',
            code: 'TREASURER',
            description: 'Financial officer responsible for barangay funds and budgeting',
            order: 4,
            requires_account: true,
            is_active: true,
        },
        {
            name: 'SK Chairperson',
            code: 'SK_CHAIRPERSON',
            description: 'Sangguniang Kabataan chairperson, representing youth affairs',
            order: 5,
            requires_account: true,
            is_active: true,
        },
    ];

    const displayTemplates = templates.length > 0 ? templates : defaultTemplates;

    return (
        <AppLayout
            title="Create Position"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Positions', href: '/admin/positions' },
                { title: 'Create', href: '/admin/positions/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create Position"
                    description="Add a new official position for barangay officials"
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    backLabel="Back"
                />

                {/* Quick Templates Card */}
                <Card className="border-l-4 border-l-indigo-500 dark:bg-gray-900">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-medium text-indigo-800 dark:text-indigo-300">Quick start with templates</h3>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                                    Choose from common position templates to get started quickly.
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
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleReset}
                                        className="gap-2 dark:border-gray-600 dark:text-gray-300"
                                        type="button"
                                    >
                                        <RefreshCw className="h-3 w-3" />
                                        Reset Form
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                                    description="Enter the core details for this position"
                                >
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={errors}
                                        onNameChange={handleNameChange}
                                        onCodeChange={handleCodeChange}
                                        onOrderChange={handleNumberChange}
                                        onDescriptionChange={handleInputChange}
                                        onGenerateCode={handleGenerateCode}
                                        isSubmitting={isSubmitting}
                                        maxOrder={maxOrder}
                                        isCodeManuallyEdited={isCodeManuallyEdited}
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
                                    submitLabel="Create Position"
                                />
                            </>
                        )}

                        {activeTab === 'assignment' && (
                            <>
                                <FormContainer 
                                    title="Committee & Role Assignment" 
                                    description="Assign this position to committees and system roles (optional)"
                                >
                                    <AssignmentTab
                                        formData={formData}
                                        errors={errors}
                                        committees={committees}
                                        roles={roles}
                                        onCommitteeSelect={(id) => handleSelectChange('committee_id', id)}
                                        onRoleSelect={(id) => handleSelectChange('role_id', id)}
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
                                    nextLabel="Next: Settings"
                                    submitLabel="Create Position"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer 
                                    title="Position Settings" 
                                    description="Configure position behavior and access options (optional)"
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
                                    isSubmittable={allRequiredFieldsFilled}
                                    previousLabel="Back: Assignment"
                                    showNext={false}
                                    submitLabel="Create Position"
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
                                            {formData.committee_id && committees.find(c => c.id === formData.committee_id) && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">Committee:</span>
                                                    <span className="font-medium dark:text-gray-300">
                                                        {committees.find(c => c.id === formData.committee_id)?.name}
                                                    </span>
                                                </div>
                                            )}
                                            {formData.role_id && roles.find(r => r.id === formData.role_id) && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 dark:text-gray-400">System Role:</span>
                                                    <span className="font-medium dark:text-gray-300">
                                                        {roles.find(r => r.id === formData.role_id)?.name}
                                                    </span>
                                                </div>
                                            )}
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
                                                <li>Use official position titles</li>
                                                <li>For Kagawad, include committee</li>
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
                                                <li>Positions can have additional committees</li>
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
        </AppLayout>
    );
}
// pages/admin/report-types/create.tsx
import { router, usePage } from '@inertiajs/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { FileText, ListChecks, Activity, Settings, Sparkles, Copy, RefreshCw, AlertCircle, AlertTriangle, Bike, Bolt, Brain, Building, Bus, Cake, Calendar, Camera, Car, Circle, Clock, Cloud, Coffee, Dna, Flag, Flame, FlaskConical, Globe, Hamburger, Headphones, HeartPulse, HelpCircle, Hexagon, Home, Mail, MapPin, MessageCircle, Mic, Microscope, Moon, Octagon, Pen, Pencil, Phone, Pill, Pizza, Plane, Radio, Rocket, Ruler, Scissors, Shield, ShieldAlert, Ship, Square, Store, Sun, Target, Thermometer, Train, Triangle, Tv, Users, Video, Wifi, Wind, Zap } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/report-types/create/basic-info-tab';
import { FieldsTab } from '@/components/admin/report-types/create/fields-tab';
import { StepsTab } from '@/components/admin/report-types/create/steps-tab';
import { SettingsTab } from '@/components/admin/report-types/create/settings-tab';
import { route } from 'ziggy-js';
import type { ReportType } from '@/types/admin/report-types/report-types';
import React from 'react';

interface RequiredField {
    key: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    rows?: number;
}

interface ResolutionStep {
    step: number;
    action: string;
    description: string;
}

interface CommonType {
    name: string;
    code: string;
    description: string;
    icon: string;
    color: string;
    priority_level: number;
    resolution_days: number;
    requires_immediate_action?: boolean;
    requires_evidence?: boolean;
    allows_anonymous?: boolean;
}

interface FormData {
    code: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    icon: string;
    color: string;
    priority_level: number;
    resolution_days: number;
    is_active: boolean;
    requires_immediate_action: boolean;
    requires_evidence: boolean;
    allows_anonymous: boolean;
    required_fields: RequiredField[];
    resolution_steps: ResolutionStep[];
    assigned_to_roles: string[];
}

interface PageProps {
    commonTypes: CommonType[];
    [key: string]: unknown;
}

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: FileText, requiredFields: ['name', 'code', 'category'] },
    { id: 'fields', label: 'Fields', icon: ListChecks, requiredFields: [] },
    { id: 'steps', label: 'Steps', icon: Activity, requiredFields: [] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['name', 'code', 'category'],
    fields: [],
    steps: [],
    settings: []
};

// Icon mapping with valid Lucide React icons
const ICON_GROUPS = {
    alerts: [
        { value: 'alert-circle', label: 'Alert Circle', icon: AlertCircle },
        { value: 'alert-triangle', label: 'Alert Triangle', icon: AlertTriangle },
        { value: 'flame', label: 'Flame', icon: Flame },
        { value: 'shield', label: 'Shield', icon: Shield },
        { value: 'shield-alert', label: 'Shield Alert', icon: ShieldAlert },
        { value: 'rocket', label: 'Rocket', icon: Rocket },
    ],
    community: [
        { value: 'users', label: 'Users', icon: Users },
        { value: 'home', label: 'Home', icon: Home },
        { value: 'building', label: 'Building', icon: Building },
        { value: 'store', label: 'Store', icon: Store },
        { value: 'flag', label: 'Flag', icon: Flag },
        { value: 'heart-pulse', label: 'Heart Pulse', icon: HeartPulse },
    ],
    environment: [
        { value: 'cloud', label: 'Cloud', icon: Cloud },
        { value: 'wind', label: 'Wind', icon: Wind },
        { value: 'sun', label: 'Sun', icon: Sun },
        { value: 'moon', label: 'Moon', icon: Moon },
        { value: 'thermometer', label: 'Temperature', icon: Thermometer },
    ],
    transportation: [
        { value: 'car', label: 'Car', icon: Car },
        { value: 'bus', label: 'Bus', icon: Bus },
        { value: 'bike', label: 'Bike', icon: Bike },
        { value: 'train', label: 'Train', icon: Train },
        { value: 'plane', label: 'Plane', icon: Plane },
        { value: 'ship', label: 'Ship', icon: Ship },
    ],
    health: [
        { value: 'heart-pulse', label: 'Heart Pulse', icon: HeartPulse },
        { value: 'pill', label: 'Pill', icon: Pill },
        { value: 'microscope', label: 'Microscope', icon: Microscope },
        { value: 'flask-conical', label: 'Flask', icon: FlaskConical },
        { value: 'dna', label: 'DNA', icon: Dna },
        { value: 'brain', label: 'Brain', icon: Brain },
    ],
    communication: [
        { value: 'message-circle', label: 'Message', icon: MessageCircle },
        { value: 'mail', label: 'Mail', icon: Mail },
        { value: 'phone', label: 'Phone', icon: Phone },
        { value: 'wifi', label: 'WiFi', icon: Wifi },
        { value: 'radio', label: 'Radio', icon: Radio },
        { value: 'tv', label: 'TV', icon: Tv },
        { value: 'camera', label: 'Camera', icon: Camera },
        { value: 'video', label: 'Video', icon: Video },
        { value: 'mic', label: 'Microphone', icon: Mic },
        { value: 'headphones', label: 'Headphones', icon: Headphones },
    ],
    maps: [
        { value: 'map-pin', label: 'Map Pin', icon: MapPin },
        { value: 'globe', label: 'Globe', icon: Globe },
    ],
    files: [
        { value: 'file-text', label: 'File Text', icon: FileText },
        { value: 'pen', label: 'Pen', icon: Pen },
        { value: 'pencil', label: 'Pencil', icon: Pencil },
        { value: 'scissors', label: 'Scissors', icon: Scissors },
        { value: 'ruler', label: 'Ruler', icon: Ruler },
    ],
    time: [
        { value: 'clock', label: 'Clock', icon: Clock },
        { value: 'calendar', label: 'Calendar', icon: Calendar },
    ],
    targets: [
        { value: 'target', label: 'Target', icon: Target },
        { value: 'activity', label: 'Activity', icon: Activity },
        { value: 'zap', label: 'Zap', icon: Zap },
        { value: 'bolt', label: 'Bolt', icon: Bolt },
    ],
    food: [
        { value: 'coffee', label: 'Coffee', icon: Coffee },
        { value: 'cake', label: 'Cake', icon: Cake },
        { value: 'pizza', label: 'Pizza', icon: Pizza },
        { value: 'hamburger', label: 'Hamburger', icon: Hamburger },
    ],
    shapes: [
        { value: 'circle', label: 'Circle', icon: Circle },
        { value: 'square', label: 'Square', icon: Square },
        { value: 'triangle', label: 'Triangle', icon: Triangle },
        { value: 'hexagon', label: 'Hexagon', icon: Hexagon },
        { value: 'octagon', label: 'Octagon', icon: Octagon },
    ],
};

// Flatten icons for select dropdown
const iconOptions = Object.values(ICON_GROUPS).flat();

// Color presets with names
const colorPresets = [
    { value: '#3B82F6', name: 'Blue' },
    { value: '#10B981', name: 'Green' },
    { value: '#F59E0B', name: 'Orange' },
    { value: '#EF4444', name: 'Red' },
    { value: '#8B5CF6', name: 'Purple' },
    { value: '#EC4899', name: 'Pink' },
    { value: '#6B7280', name: 'Gray' },
    { value: '#0EA5E9', name: 'Sky Blue' },
    { value: '#F97316', name: 'Bright Orange' },
    { value: '#DC2626', name: 'Dark Red' },
];

// Category options with descriptions
const categoryOptions = [
    { value: 'complaint', label: 'Complaint', description: 'Formal complaint about an issue', icon: AlertCircle },
    { value: 'issue', label: 'Community Issue', description: 'General community concern', icon: Users },
    { value: 'request', label: 'Request', description: 'Service or assistance request', icon: FileText },
    { value: 'concern', label: 'Concern', description: 'Safety or welfare concern', icon: HeartPulse },
    { value: 'suggestion', label: 'Suggestion', description: 'Community improvement idea', icon: Sparkles },
    { value: 'incident', label: 'Incident', description: 'Report of an incident', icon: Flag },
    { value: 'feedback', label: 'Feedback', description: 'General feedback', icon: MessageCircle },
    { value: 'inquiry', label: 'Inquiry', description: 'Information request', icon: HelpCircle },
];

// Priority options
const priorityOptions: Record<number, string> = {
    1: 'Critical',
    2: 'High',
    3: 'Medium',
    4: 'Low'
};

// Role options
const roleOptions: Record<string, string> = {
    admin: 'Administrator',
    barangay_captain: 'Barangay Captain',
    barangay_secretary: 'Barangay Secretary',
    barangay_treasurer: 'Barangay Treasurer',
    kagawad: 'Kagawad',
    tanod: 'Tanod'
};

// Field types
const fieldTypes: Record<string, string> = {
    text: 'Text Input',
    textarea: 'Text Area',
    select: 'Dropdown Select',
    checkbox: 'Checkbox',
    date: 'Date Picker',
    number: 'Number',
    email: 'Email',
    phone: 'Phone Number'
};

export default function ReportTypeCreate() {
    const { props } = usePage<PageProps>();
    const commonTypes: CommonType[] = props.commonTypes || [];

    const [showPreview, setShowPreview] = useState(true);
    const [autoGenerateCode, setAutoGenerateCode] = useState(true);
    const [selectedIcon, setSelectedIcon] = useState('alert-circle');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [searchIconTerm, setSearchIconTerm] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
    const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
    const [newOption, setNewOption] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [newField, setNewField] = useState<RequiredField>({
        key: '',
        label: '',
        type: 'text',
        required: true,
        placeholder: '',
        options: [],
        rows: 3,
    });

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
            category: '',
            subcategory: '',
            icon: 'alert-circle',
            color: '#3B82F6',
            priority_level: 3,
            resolution_days: 7,
            is_active: true,
            requires_immediate_action: false,
            requires_evidence: false,
            allows_anonymous: true,
            required_fields: [],
            resolution_steps: [],
            assigned_to_roles: [],
        },
        requiredFields: requiredFieldsMap,
        onSubmit: (data) => {
            // Validate before submit
            const newErrors: Record<string, string> = {};
            
            if (!data.name?.trim()) {
                newErrors.name = 'Report name is required';
            }
            if (!data.code?.trim()) {
                newErrors.code = 'Report code is required';
            }
            if (!data.category) {
                newErrors.category = 'Category is required';
            }
            if (data.resolution_days < 1) {
                newErrors.resolution_days = 'Resolution days must be at least 1';
            }
            if (data.priority_level < 1 || data.priority_level > 4) {
                newErrors.priority_level = 'Priority must be between 1 and 4';
            }
            
            if (Object.keys(newErrors).length > 0) {
                setValidationErrors(newErrors);
                toast.error('Please fix the validation errors');
                return;
            }
            
            router.post(route('admin.report-types.store'), data as any, {
                onSuccess: () => {
                    toast.success('Report type created successfully');
                    router.visit(route('admin.report-types.index'));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to create report type');
                }
            });
        }
    });

    // Combine errors from server and validation
    const allErrors = { ...errors, ...validationErrors };

    // Filter icons based on search
    const filteredIcons = searchIconTerm
        ? iconOptions.filter(icon => 
            icon.label.toLowerCase().includes(searchIconTerm.toLowerCase())
          )
        : iconOptions;

    // Load template
    const loadTemplate = useCallback((type: CommonType) => {
        setSelectedTemplate(type.code);
        updateFormData({
            code: type.code,
            name: type.name,
            description: type.description,
            icon: type.icon || 'alert-circle',
            color: type.color || '#3B82F6',
            priority_level: type.priority_level,
            resolution_days: type.resolution_days,
            requires_immediate_action: type.requires_immediate_action || false,
            requires_evidence: type.requires_evidence || false,
            allows_anonymous: type.allows_anonymous !== false,
        });
        setSelectedIcon(type.icon || 'alert-circle');
        toast.success(`"${type.name}" template loaded successfully`);
    }, [updateFormData]);

    // Handle code generation
    const generateCode = useCallback(() => {
        if (formData.name) {
            const code = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            updateFormData({ code });
            toast.success('Code generated from name');
        } else {
            toast.error('Please enter a name first');
        }
    }, [formData.name, updateFormData]);

    // Handle copy code
    const handleCopyCode = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(formData.code);
            toast.success('Code copied to clipboard');
        } catch {
            toast.error('Failed to copy code');
        }
    }, [formData.code]);

    // Handle number change
    const handleNumberChange = useCallback((name: string, value: string) => {
        const numValue = parseInt(value) || 0;
        updateFormData({ [name]: numValue });
        // Clear validation error if exists
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [updateFormData, validationErrors]);

    // Handle switch change
    const handleSwitchChange = useCallback((name: string, checked: boolean) => {
        updateFormData({ [name]: checked });
    }, [updateFormData]);

    // Handle role toggle
    const toggleRole = useCallback((role: string) => {
        const current = formData.assigned_to_roles || [];
        if (current.includes(role)) {
            updateFormData({ assigned_to_roles: current.filter((r: string) => r !== role) });
        } else {
            updateFormData({ assigned_to_roles: [...current, role] });
        }
    }, [formData.assigned_to_roles, updateFormData]);

    // Handle icon select
    const handleIconSelect = useCallback((iconValue: string) => {
        handleSelectChange('icon', iconValue);
        setSelectedIcon(iconValue);
        setShowIconPicker(false);
        setSearchIconTerm('');
    }, [handleSelectChange]);

    // Required Fields Management
    const addRequiredField = useCallback(() => {
        if (!newField.key || !newField.label) {
            toast.error('Key and label are required');
            return;
        }

        const updatedFields = [...(formData.required_fields || []), { ...newField }];
        updateFormData({ required_fields: updatedFields });

        setNewField({
            key: '',
            label: '',
            type: 'text',
            required: true,
            placeholder: '',
            options: [],
            rows: 3,
        });
        setShowCustomFieldForm(false);
        setEditingFieldIndex(null);
        toast.success('Field added successfully');
    }, [newField, formData.required_fields, updateFormData]);

    const updateRequiredField = useCallback(() => {
        if (editingFieldIndex === null) return;

        if (!newField.key || !newField.label) {
            toast.error('Key and label are required');
            return;
        }

        const updatedFields = [...(formData.required_fields || [])];
        updatedFields[editingFieldIndex] = { ...newField };

        updateFormData({ required_fields: updatedFields });

        setNewField({
            key: '',
            label: '',
            type: 'text',
            required: true,
            placeholder: '',
            options: [],
            rows: 3,
        });
        setShowCustomFieldForm(false);
        setEditingFieldIndex(null);
        toast.success('Field updated successfully');
    }, [editingFieldIndex, newField, formData.required_fields, updateFormData]);

    const editRequiredField = useCallback((index: number) => {
        const field = formData.required_fields[index];
        setNewField({ ...field });
        setEditingFieldIndex(index);
        setShowCustomFieldForm(true);
    }, [formData.required_fields]);

    const removeRequiredField = useCallback((index: number) => {
        const updatedFields = (formData.required_fields || []).filter((_, i) => i !== index);
        updateFormData({ required_fields: updatedFields });
        toast.success('Field removed');
    }, [formData.required_fields, updateFormData]);

    const moveFieldUp = useCallback((index: number) => {
        if (index === 0) return;
        const fields = [...(formData.required_fields || [])];
        [fields[index - 1], fields[index]] = [fields[index], fields[index - 1]];
        updateFormData({ required_fields: fields });
    }, [formData.required_fields, updateFormData]);

    const moveFieldDown = useCallback((index: number) => {
        if (index === (formData.required_fields || []).length - 1) return;
        const fields = [...(formData.required_fields || [])];
        [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
        updateFormData({ required_fields: fields });
    }, [formData.required_fields, updateFormData]);

    const addOption = useCallback(() => {
        if (!newOption.trim()) return;
        setNewField(prev => ({
            ...prev,
            options: [...(prev.options || []), newOption.trim()]
        }));
        setNewOption('');
    }, [newOption]);

    const removeOption = useCallback((index: number) => {
        setNewField(prev => ({
            ...prev,
            options: prev.options?.filter((_, i) => i !== index)
        }));
    }, []);

    const cancelFieldForm = useCallback(() => {
        setShowCustomFieldForm(false);
        setEditingFieldIndex(null);
        setNewField({
            key: '',
            label: '',
            type: 'text',
            required: true,
            placeholder: '',
            options: [],
            rows: 3,
        });
        setNewOption('');
    }, []);

    // Resolution Steps Management
    const addResolutionStep = useCallback(() => {
        const nextStep = (formData.resolution_steps || []).length + 1;
        const newStep: ResolutionStep = {
            step: nextStep,
            action: `Step ${nextStep}`,
            description: '',
        };
        updateFormData({
            resolution_steps: [...(formData.resolution_steps || []), newStep]
        });
    }, [formData.resolution_steps, updateFormData]);

    const updateResolutionStep = useCallback((index: number, field: keyof ResolutionStep, value: string) => {
        const updatedSteps = [...(formData.resolution_steps || [])];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };
        updateFormData({ resolution_steps: updatedSteps });
    }, [formData.resolution_steps, updateFormData]);

    const removeResolutionStep = useCallback((index: number) => {
        const filtered = (formData.resolution_steps || []).filter((_, i) => i !== index);
        const reordered = filtered.map((step, idx) => ({ ...step, step: idx + 1 }));
        updateFormData({ resolution_steps: reordered });
    }, [formData.resolution_steps, updateFormData]);

    // Get category label
    const getCategoryLabel = useCallback((categoryValue: string): string => {
        const category = categoryOptions.find(c => c.value === categoryValue);
        return category?.label || 'Not selected';
    }, []);

    // Get role label
    const getRoleLabel = useCallback((roleValue: string): string => {
        return roleOptions[roleValue] || roleValue;
    }, []);

    // Reset form
    const handleReset = useCallback(() => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            resetForm();
            setSelectedIcon('alert-circle');
            setSelectedTemplate('');
            setShowCustomFieldForm(false);
            setEditingFieldIndex(null);
            setValidationErrors({});
            toast.info('Form reset');
        }
    }, [resetForm]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (formData.name || formData.code || formData.description) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.report-types.index'));
            }
        } else {
            router.visit(route('admin.report-types.index'));
        }
    }, [formData]);

    const tabStatuses: Record<string, 'complete' | 'incomplete' | 'error' | 'optional'> = {
        basic: getTabStatus('basic'),
        fields: getTabStatus('fields'),
        steps: getTabStatus('steps'),
        settings: getTabStatus('settings')
    };

    const missingFields = getMissingFields();

    const requiredFieldsList = [
        { label: 'Name', value: !!formData.name, tabId: 'basic' },
        { label: 'Code', value: !!formData.code, tabId: 'basic' },
        { label: 'Category', value: !!formData.category, tabId: 'basic' },
    ];

    const tabOrder = ['basic', 'fields', 'steps', 'settings'];

    return (
        <AppLayout
            title="Create Report Type"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Report Types', href: '/admin/report-types' },
                { title: 'Create', href: '/admin/report-types/create' }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Create Report Type"
                    description="Add a new report type to the system"
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

                {/* Template Selection */}
                {commonTypes.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-medium text-orange-800 dark:text-orange-300">Quick start with templates</h3>
                                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                                    Choose from common report type templates to get started quickly.
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {commonTypes.map((type) => {
                                        const IconComponent = iconOptions.find(i => i.value === type.icon)?.icon || AlertCircle;
                                        return (
                                            <button
                                                key={type.code}
                                                type="button"
                                                onClick={() => loadTemplate(type)}
                                                className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md border ${
                                                    selectedTemplate === type.code
                                                        ? 'bg-orange-600 text-white border-orange-600 dark:bg-orange-700'
                                                        : 'border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                                                } transition-colors`}
                                            >
                                                <IconComponent className="h-3 w-3" />
                                                {type.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
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
                                <FormContainer title="Basic Information" description="Enter the basic details for this report type">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        categoryOptions={categoryOptions}
                                        priorityOptions={priorityOptions}
                                        iconOptions={iconOptions}
                                        colorPresets={colorPresets}
                                        selectedIcon={selectedIcon}
                                        autoGenerateCode={autoGenerateCode}
                                        showIconPicker={showIconPicker}
                                        searchIconTerm={searchIconTerm}
                                        filteredIcons={filteredIcons}
                                        onInputChange={handleInputChange}
                                        onSelectChange={handleSelectChange}
                                        onNumberChange={handleNumberChange}
                                        onCopyCode={handleCopyCode}
                                        onGenerateCode={generateCode}
                                        onAutoGenerateToggle={setAutoGenerateCode}
                                        onIconSelect={handleIconSelect}
                                        onToggleIconPicker={() => setShowIconPicker(!showIconPicker)}
                                        onSearchIconChange={setSearchIconTerm}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.category}
                                    showPrevious={false}
                                    nextLabel="Next: Fields"
                                />
                            </>
                        )}

                        {activeTab === 'fields' && (
                            <>
                                <FormContainer title="Custom Fields" description="Configure the fields required for this report type">
                                    <FieldsTab
                                        formData={formData}
                                        errors={allErrors}
                                        requiredFields={formData.required_fields || []}
                                        newField={newField}
                                        newOption={newOption}
                                        showCustomFieldForm={showCustomFieldForm}
                                        editingFieldIndex={editingFieldIndex}
                                        fieldTypes={fieldTypes}
                                        onAddField={addRequiredField}
                                        onUpdateField={updateRequiredField}
                                        onEditField={editRequiredField}
                                        onRemoveField={removeRequiredField}
                                        onMoveFieldUp={moveFieldUp}
                                        onMoveFieldDown={moveFieldDown}
                                        onCancelFieldForm={cancelFieldForm}
                                        onNewFieldChange={(field, value) => setNewField(prev => ({ ...prev, [field]: value }))}
                                        onAddOption={addOption}
                                        onRemoveOption={removeOption}
                                        onNewOptionChange={setNewOption}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.category}
                                    previousLabel="Back: Basic Info"
                                    nextLabel="Next: Steps"
                                />
                            </>
                        )}

                        {activeTab === 'steps' && (
                            <>
                                <FormContainer title="Resolution Steps" description="Define the steps to resolve this type of report">
                                    <StepsTab
                                        resolutionSteps={formData.resolution_steps || []}
                                        onAddStep={addResolutionStep}
                                        onUpdateStep={updateResolutionStep}
                                        onRemoveStep={removeResolutionStep}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.category}
                                    previousLabel="Back: Fields"
                                    nextLabel="Next: Settings"
                                />
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <FormContainer title="Settings" description="Configure behavior and permissions">
                                    <SettingsTab
                                        formData={formData}
                                        errors={allErrors}
                                        roleOptions={roleOptions}
                                        assignedRoles={formData.assigned_to_roles || []}
                                        onSwitchChange={handleSwitchChange}
                                        onToggleRole={toggleRole}
                                        getRoleLabel={getRoleLabel}
                                        isSubmitting={isSubmitting}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.category}
                                    previousLabel="Back: Steps"
                                    showNext={false}
                                    submitLabel="Create Report Type"
                                />
                            </>
                        )}
                    </div>

                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4 space-y-4">
                                <FormProgress
                                    progress={formProgress}
                                    isComplete={allRequiredFieldsFilled && !!formData.name && !!formData.code && !!formData.category}
                                    missingFields={missingFields}
                                    onMissingFieldClick={(tabId) => setActiveTab(tabId)}
                                />
                                <RequiredFieldsChecklist
                                    fields={requiredFieldsList}
                                    onTabClick={(tabId) => setActiveTab(tabId)}
                                    missingFields={missingFields}
                                />
                                
                                {/* Report Summary Preview Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Report Summary</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div 
                                                className="h-10 w-10 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: formData.color + '20' }}
                                            >
                                                {iconOptions.find(i => i.value === formData.icon)?.icon && React.createElement(
                                                    iconOptions.find(i => i.value === formData.icon)!.icon,
                                                    { className: "h-5 w-5", style: { color: formData.color } }
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium dark:text-gray-200">
                                                    {formData.name || <span className="text-gray-400 italic">Not set</span>}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formData.code || 'No code'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                            <span className="font-medium dark:text-gray-300">
                                                {getCategoryLabel(formData.category)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                                            <span className="font-medium dark:text-gray-300">
                                                {priorityOptions[formData.priority_level] || 'Medium'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Resolution:</span>
                                            <span className="font-medium dark:text-gray-300">{formData.resolution_days} days</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-2 border-t dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                            <span className={`font-medium ${
                                                formData.is_active 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {formData.is_active ? 'Active' : 'Inactive'}
                                            </span>
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
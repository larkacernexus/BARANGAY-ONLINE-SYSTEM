// pages/admin/report-types/edit.tsx
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
import { FileText, ListChecks, Activity, Settings, History, Trash2, RefreshCw, AlertCircle, AlertTriangle, Building, Car, Clock, Droplets, Heart, PawPrint, Shield, Store, Users, Volume2, Waves, Zap, Map, CheckCircle, HelpCircle, MessageCircle, Sparkles } from 'lucide-react';
import { BasicInfoTab } from '@/components/admin/report-types/create/basic-info-tab';
import { FieldsTab } from '@/components/admin/report-types/create/fields-tab';
import { StepsTab } from '@/components/admin/report-types/create/steps-tab';
import { SettingsTab } from '@/components/admin/report-types/create/settings-tab';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';
import type { ReportType } from '@/types/admin/report-types/report-types';

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

interface ReportTypeWithCount extends ReportType {
    category: string;
    subcategory: string;
    community_reports_count: number;
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

const tabs: TabConfig[] = [
    { id: 'basic', label: 'Basic Info', icon: FileText, requiredFields: ['name', 'code'] },
    { id: 'fields', label: 'Fields', icon: ListChecks, requiredFields: [] },
    { id: 'steps', label: 'Steps', icon: Activity, requiredFields: [] },
    { id: 'settings', label: 'Settings', icon: Settings, requiredFields: [] }
];

const requiredFieldsMap = {
    basic: ['name', 'code'],
    fields: [],
    steps: [],
    settings: []
};

// Icon options
const iconOptions = [
    { value: 'alert-circle', label: 'Alert Circle', icon: AlertCircle },
    { value: 'alert-triangle', label: 'Alert Triangle', icon: AlertTriangle },
    { value: 'volume-2', label: 'Volume', icon: Volume2 },
    { value: 'droplets', label: 'Droplets', icon: Droplets },
    { value: 'zap', label: 'Zap', icon: Zap },
    { value: 'map', label: 'Map', icon: Map },
    { value: 'shield', label: 'Shield', icon: Shield },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'heart', label: 'Heart', icon: Heart },
    { value: 'paw-print', label: 'Paw Print', icon: PawPrint },
    { value: 'building', label: 'Building', icon: Building },
    { value: 'car', label: 'Car', icon: Car },
    { value: 'waves', label: 'Waves', icon: Waves },
    { value: 'store', label: 'Store', icon: Store },
    { value: 'file-text', label: 'File Text', icon: FileText },
    { value: 'clock', label: 'Clock', icon: Clock },
];

// Color presets
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

// Category options
const categoryOptionsArray = [
    { value: 'complaint', label: 'Complaint', description: 'Formal complaint about an issue', icon: AlertCircle },
    { value: 'issue', label: 'Community Issue', description: 'General community concern', icon: Users },
    { value: 'request', label: 'Request', description: 'Service or assistance request', icon: FileText },
    { value: 'concern', label: 'Concern', description: 'Safety or welfare concern', icon: Heart },
    { value: 'suggestion', label: 'Suggestion', description: 'Community improvement idea', icon: Sparkles },
    { value: 'incident', label: 'Incident', description: 'Report of an incident', icon: AlertTriangle },
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

export default function EditReportType() {
    const { props } = usePage<{ reportType: ReportTypeWithCount }>();
    const reportType = props.reportType;

    const [showPreview, setShowPreview] = useState(true);
    const [selectedIcon, setSelectedIcon] = useState(reportType.icon || 'alert-circle');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [searchIconTerm, setSearchIconTerm] = useState('');
    const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
    const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
    const [newOption, setNewOption] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
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
        resetForm,
        hasUnsavedChanges
    } = useFormManager<FormData>({
        initialData: {
            code: reportType.code || '',
            name: reportType.name || '',
            description: reportType.description || '',
            category: reportType.category || '',
            subcategory: reportType.subcategory || '',
            icon: reportType.icon || 'alert-circle',
            color: reportType.color || '#3B82F6',
            priority_level: reportType.priority_level || 3,
            resolution_days: reportType.resolution_days || 7,
            is_active: reportType.is_active,
            requires_immediate_action: reportType.requires_immediate_action,
            requires_evidence: reportType.requires_evidence,
            allows_anonymous: reportType.allows_anonymous,
            required_fields: reportType.required_fields || [],
            resolution_steps: reportType.resolution_steps || [],
            assigned_to_roles: reportType.assigned_to_roles || [],
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
            
            router.put(route('admin.report-types.update', reportType.id), data as any, {
                onSuccess: () => {
                    toast.success('Report type updated successfully');
                    router.visit(route('admin.report-types.show', reportType.id));
                },
                onError: (errs) => {
                    setValidationErrors(errs);
                    toast.error('Failed to update report type');
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

    // Handle number change
    const handleNumberChange = useCallback((name: string, value: string) => {
        updateFormData({ [name]: parseInt(value) || 0 });
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

    // Handle copy to clipboard
    const handleCopy = useCallback((text: string, field: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
            toast.success(`${field} copied to clipboard`);
        });
    }, []);

    // Generate code from name
    const generateCode = useCallback(() => {
        if (formData.name) {
            const code = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            updateFormData({ code });
            setCodeManuallyEdited(false);
            toast.success('Code generated from name');
        } else {
            toast.error('Please enter a name first');
        }
    }, [formData.name, updateFormData]);

    // Reset auto-generate
    const resetAutoGenerate = useCallback(() => {
        setCodeManuallyEdited(false);
        if (formData.name) {
            const generatedCode = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            updateFormData({ code: generatedCode });
            toast.success('Auto-generation re-enabled');
        }
    }, [formData.name, updateFormData]);

    // Handle icon select
    const handleIconSelect = useCallback((iconValue: string) => {
        handleSelectChange('icon', iconValue);
        setSelectedIcon(iconValue);
        setShowIconPicker(false);
        setSearchIconTerm('');
    }, [handleSelectChange]);

    // Role selection
    const toggleRole = useCallback((role: string) => {
        const current = formData.assigned_to_roles || [];
        if (current.includes(role)) {
            updateFormData({ assigned_to_roles: current.filter((r: string) => r !== role) });
        } else {
            updateFormData({ assigned_to_roles: [...current, role] });
        }
    }, [formData.assigned_to_roles, updateFormData]);

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

    // Handle reset
    const handleReset = useCallback(() => {
        if (confirm('Reset all changes to the original values?')) {
            resetForm();
            setSelectedIcon(reportType.icon || 'alert-circle');
            setCodeManuallyEdited(false);
            setValidationErrors({});
            toast.info('Form reset to original values');
        }
    }, [resetForm, reportType.icon]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                router.visit(route('admin.report-types.show', reportType.id));
            }
        } else {
            router.visit(route('admin.report-types.show', reportType.id));
        }
    }, [hasUnsavedChanges, reportType.id]);

    // Handle delete
    const handleDelete = useCallback(() => {
        setShowDeleteDialog(true);
    }, []);

    const confirmDelete = useCallback(() => {
        router.delete(route('admin.report-types.destroy', reportType.id), {
            onSuccess: () => {
                toast.success('Report type deleted successfully');
                router.visit(route('admin.report-types.index'));
            },
            onError: () => {
                toast.error('Failed to delete report type');
                setShowDeleteDialog(false);
            }
        });
    }, [reportType.id]);

    // Format date
    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    // Get priority color
    const getPriorityColor = useCallback((priority: number): string => {
        switch (priority) {
            case 1: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 2: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 3: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 4: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    }, []);

    // Get category label
    const getCategoryLabel = useCallback((categoryValue: string): string => {
        const category = categoryOptionsArray.find(c => c.value === categoryValue);
        return category?.label || 'Not selected';
    }, []);

    // Get role label
    const getRoleLabel = useCallback((roleValue: string): string => {
        return roleOptions[roleValue] || roleValue;
    }, []);

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
    ];

    const tabOrder = ['basic', 'fields', 'steps', 'settings'];

    // Count changed fields
    const changedFieldsCount = useMemo(() => {
        let count = 0;
        if (formData.code !== reportType.code) count++;
        if (formData.name !== reportType.name) count++;
        if (formData.description !== (reportType.description || '')) count++;
        if (formData.category !== (reportType.category || '')) count++;
        if (formData.subcategory !== (reportType.subcategory || '')) count++;
        if (formData.icon !== reportType.icon) count++;
        if (formData.color !== reportType.color) count++;
        if (formData.priority_level !== reportType.priority_level) count++;
        if (formData.resolution_days !== reportType.resolution_days) count++;
        if (formData.is_active !== reportType.is_active) count++;
        if (formData.requires_immediate_action !== reportType.requires_immediate_action) count++;
        if (formData.requires_evidence !== reportType.requires_evidence) count++;
        if (formData.allows_anonymous !== reportType.allows_anonymous) count++;
        if (JSON.stringify(formData.required_fields) !== JSON.stringify(reportType.required_fields || [])) count++;
        if (JSON.stringify(formData.resolution_steps) !== JSON.stringify(reportType.resolution_steps || [])) count++;
        if (JSON.stringify(formData.assigned_to_roles) !== JSON.stringify(reportType.assigned_to_roles || [])) count++;
        return count;
    }, [formData, reportType]);

    return (
        <AppLayout
            title={`Edit Report Type: ${reportType.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Report Types', href: '/admin/report-types' },
                { title: reportType.name, href: route('admin.report-types.show', reportType.id) },
                { title: 'Edit', href: route('admin.report-types.edit', reportType.id) }
            ]}
        >
            <div className="space-y-6">
                <FormHeader
                    title="Edit Report Type"
                    description={`Editing ${reportType.name}`}
                    onBack={handleCancel}
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowHistory(true)}
                                className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1"
                            >
                                <History className="h-4 w-4" />
                                History
                            </button>
                            {hasUnsavedChanges && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reset
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
                                disabled={reportType.community_reports_count > 0}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                            <div className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800">
                                ID: {reportType.id}
                            </div>
                            <div className={`px-2 py-1 rounded-md text-xs ${
                                formData.is_active 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                                {formData.is_active ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                    }
                />

                {/* Last Updated & Changes Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <History className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Last updated: {formatDate(reportType.updated_at)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Created: {formatDate(reportType.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {hasUnsavedChanges && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                                    <span className="font-medium text-blue-800 dark:text-blue-300">
                                        {changedFieldsCount} field{changedFieldsCount !== 1 ? 's' : ''} modified
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

                {/* Inactive Alert */}
                {!reportType.is_active && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-800 dark:text-red-300">Report Type is Inactive</p>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    This report type is currently inactive and won't be available for submission.
                                    Toggle the active status to enable it.
                                </p>
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
                                <FormContainer title="Basic Information" description="Update the core details for this report type">
                                    <BasicInfoTab
                                        formData={formData}
                                        errors={allErrors}
                                        categoryOptions={categoryOptionsArray}
                                        priorityOptions={priorityOptions}
                                        iconOptions={iconOptions}
                                        colorPresets={colorPresets}
                                        selectedIcon={selectedIcon}
                                        showIconPicker={showIconPicker}
                                        searchIconTerm={searchIconTerm}
                                        filteredIcons={filteredIcons}
                                        codeManuallyEdited={codeManuallyEdited}
                                        copiedField={copiedField}
                                        originalName={reportType.name}
                                        originalCode={reportType.code}
                                        onInputChange={handleInputChange}
                                        onSelectChange={handleSelectChange}
                                        onNumberChange={handleNumberChange}
                                        onCopyCode={() => handleCopy(formData.code, 'Code')}
                                        onGenerateCode={generateCode}
                                        onResetAutoGenerate={resetAutoGenerate}
                                        onIconSelect={handleIconSelect}
                                        onToggleIconPicker={() => setShowIconPicker(!showIconPicker)}
                                        onSearchIconChange={setSearchIconTerm}
                                        isSubmitting={isSubmitting}
                                        autoGenerateCode={!codeManuallyEdited}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
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
                                        onCancelFieldForm={cancelFieldForm}
                                        onNewFieldChange={(field, value) => setNewField(prev => ({ ...prev, [field]: value }))}
                                        onAddOption={addOption}
                                        onRemoveOption={removeOption}
                                        onNewOptionChange={setNewOption}
                                        isSubmitting={isSubmitting} onMoveFieldUp={function (index: number): void {
                                            throw new Error('Function not implemented.');
                                        } } onMoveFieldDown={function (index: number): void {
                                            throw new Error('Function not implemented.');
                                        } }                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onNext={() => goToNextTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
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
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
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
                                        originalIsActive={reportType.is_active}
                                        originalRequiresImmediateAction={reportType.requires_immediate_action}
                                        originalRequiresEvidence={reportType.requires_evidence}
                                        originalAllowsAnonymous={reportType.allows_anonymous}
                                    />
                                </FormContainer>
                                <FormNavigation
                                    onPrevious={() => goToPrevTab(tabOrder)}
                                    onCancel={handleCancel}
                                    onSubmit={handleSubmit}
                                    isSubmitting={isSubmitting}
                                    isSubmittable={allRequiredFieldsFilled && !!formData.name && !!formData.code}
                                    previousLabel="Back: Steps"
                                    showNext={false}
                                    submitLabel="Update Report Type"
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

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                                <span className="font-medium dark:text-gray-300">
                                                    {getCategoryLabel(formData.category)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                                                <span className={`font-medium px-2 py-0.5 rounded ${getPriorityColor(formData.priority_level)}`}>
                                                    {priorityOptions[formData.priority_level] || `Level ${formData.priority_level}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Resolution Days:</span>
                                                <span className="font-medium dark:text-gray-300">{formData.resolution_days} days</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t dark:border-gray-700">
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
                            Delete Report Type
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete "{reportType.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {reportType.community_reports_count > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                This report type has {reportType.community_reports_count} associated report(s). 
                                You cannot delete it while reports exist.
                            </p>
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                            disabled={reportType.community_reports_count > 0}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* History Dialog */}
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogContent className="sm:max-w-[425px] dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="dark:text-gray-100">Report Type History</DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            Creation and modification details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">Created</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(reportType.created_at)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">Last Updated</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(reportType.updated_at)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">Total Reports</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {reportType.community_reports_count}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowHistory(false)} className="dark:bg-gray-700 dark:text-white">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
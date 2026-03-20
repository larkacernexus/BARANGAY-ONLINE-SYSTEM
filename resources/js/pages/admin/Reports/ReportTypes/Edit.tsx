// app/pages/admin/Reports/ReportTypes/Edit.tsx
import React from 'react';
import { router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2,
    AlertCircle,
    CheckCircle,
    FileText,
    HelpCircle,
    Sparkles,
    Copy,
    Settings,
    ListChecks,
    Activity,
    Users,
    Clock,
    Zap,
    Image,
    Eye,
    History,
    GripVertical,
    ChevronUp,
    ChevronDown,
    AlertTriangle,
    Volume2,
    Droplets,
    Map,
    Shield,
    Heart,
    PawPrint,
    Building,
    Car,
    Waves,
    Store,
    RefreshCw,
    Target,
    Camera,
    EyeOff,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface ReportType {
    id: number;
    code: string;
    name: string;
    category: string | null;
    subcategory: string | null;
    description: string | null;
    icon: string;
    color: string;
    priority_level: number;
    resolution_days: number;
    is_active: boolean;
    requires_immediate_action: boolean;
    requires_evidence: boolean;
    allows_anonymous: boolean;
    required_fields: any[];
    resolution_steps: any[];
    assigned_to_roles: string[];
    created_at: string;
    updated_at: string;
    community_reports_count: number;
}

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

interface PageProps {
    reportType: ReportType;
    priorityOptions: Record<number, string>;
    roleOptions: Record<string, string>;
    fieldTypes: Record<string, string>;
    categoryOptions: Record<string, string>;
}

// Icon options with valid Lucide React icons
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
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
    '#6B7280', '#0EA5E9', '#F97316', '#DC2626', '#7C3AED', '#DB2777',
];

export default function ReportTypeEdit() {
    const { props } = usePage<PageProps>();
    const { 
        reportType, 
        priorityOptions = {}, 
        roleOptions = {},
        fieldTypes = {},
        categoryOptions = {}
    } = props;

    // Form state
    const [formData, setFormData] = useState({
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
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedIcon, setSelectedIcon] = useState(reportType.icon || 'alert-circle');
    const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
    const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
    const [newField, setNewField] = useState<RequiredField>({
        key: '',
        label: '',
        type: 'text',
        required: true,
        placeholder: '',
        options: [],
    });
    const [newOption, setNewOption] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [searchIconTerm, setSearchIconTerm] = useState('');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [formProgress, setFormProgress] = useState(50);
    
    // Track if code was manually edited
    const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const codeInputRef = useRef<HTMLInputElement>(null);

    // Category options array
    const categoryOptionsArray = Object.entries(categoryOptions).map(([value, label]) => ({
        value, label
    }));

    // Update progress based on completed sections
    useEffect(() => {
        let progress = 25;
        
        if (formData.code && formData.name) progress += 15;
        if (formData.category) progress += 15;
        if (formData.required_fields.length > 0) progress += 15;
        if (formData.resolution_steps.length > 0) progress += 15;
        if (formData.assigned_to_roles.length > 0) progress += 15;
        
        setFormProgress(Math.min(progress, 100));
    }, [formData]);

    // Auto-generate code from name when name changes, but only if code hasn't been manually edited
    useEffect(() => {
        // Only auto-generate if:
        // 1. There is a name value
        // 2. Code hasn't been manually edited
        // 3. Code is empty OR code matches the auto-generated value from previous name
        if (formData.name && !codeManuallyEdited) {
            const generatedCode = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            
            // Only update if the generated code is different from current code
            if (generatedCode !== formData.code) {
                setFormData(prev => ({ ...prev, code: generatedCode }));
            }
        }
    }, [formData.name, codeManuallyEdited]);

    // Filter icons based on search
    const filteredIcons = searchIconTerm
        ? iconOptions.filter(icon => 
            icon.label.toLowerCase().includes(searchIconTerm.toLowerCase())
          )
        : iconOptions;

    // Handle manual code edit - set the flag to true
    const handleCodeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, code: value }));
        setCodeManuallyEdited(true);
        
        // Clear error for this field
        if (errors.code) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.code;
                return newErrors;
            });
        }
    };

    // Handle name edit - update name and potentially reset manual edit flag
    const handleNameEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, name: value }));
        
        // If code becomes empty, we can auto-generate again
        if (!formData.code) {
            setCodeManuallyEdited(false);
        }
        
        // Clear error for this field
        if (errors.name) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.name;
                return newErrors;
            });
        }
    };

    // Handle input changes (for non-code/name fields)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle select changes
    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle number changes
    const handleNumberChange = (name: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setFormData(prev => ({ ...prev, [name]: numValue }));
    };

    // Handle switch changes
    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    // Handle role selection
    const toggleRole = (role: string) => {
        setFormData(prev => {
            const current = prev.assigned_to_roles;
            if (current.includes(role)) {
                return { ...prev, assigned_to_roles: current.filter(r => r !== role) };
            } else {
                return { ...prev, assigned_to_roles: [...current, role] };
            }
        });
    };

    // Generate code from name (manual trigger)
    const generateCode = () => {
        if (formData.name) {
            const code = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            setFormData(prev => ({ ...prev, code }));
            // Reset manual edit flag when manually generating
            setCodeManuallyEdited(false);
            toast.success('Code generated from name');
        }
    };

    // Reset manual edit flag (allow auto-generation again)
    const resetAutoGenerate = () => {
        setCodeManuallyEdited(false);
        if (formData.name) {
            const generatedCode = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            setFormData(prev => ({ ...prev, code: generatedCode }));
            toast.success('Auto-generation re-enabled');
        }
    };

    // Required Fields Management
    const addRequiredField = () => {
        if (!newField.key || !newField.label) {
            toast.error('Key and label are required');
            return;
        }

        // Generate key from label if not provided
        if (!newField.key) {
            newField.key = newField.label
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
        }

        setFormData(prev => ({
            ...prev,
            required_fields: [...prev.required_fields, { ...newField }]
        }));

        setNewField({
            key: '',
            label: '',
            type: 'text',
            required: true,
            placeholder: '',
            options: [],
        });
        setShowCustomFieldForm(false);
        setEditingFieldIndex(null);
        toast.success('Field added successfully');
    };

    const updateRequiredField = () => {
        if (editingFieldIndex === null) return;

        if (!newField.key || !newField.label) {
            toast.error('Key and label are required');
            return;
        }

        const updatedFields = [...formData.required_fields];
        updatedFields[editingFieldIndex] = { ...newField };

        setFormData(prev => ({
            ...prev,
            required_fields: updatedFields
        }));

        setNewField({
            key: '',
            label: '',
            type: 'text',
            required: true,
            placeholder: '',
            options: [],
        });
        setShowCustomFieldForm(false);
        setEditingFieldIndex(null);
        toast.success('Field updated successfully');
    };

    const editRequiredField = (index: number) => {
        setNewField({ ...formData.required_fields[index] });
        setEditingFieldIndex(index);
        setShowCustomFieldForm(true);
    };

    const removeRequiredField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            required_fields: prev.required_fields.filter((_, i) => i !== index)
        }));
        toast.success('Field removed');
    };

    const moveFieldUp = (index: number) => {
        if (index === 0) return;
        const newFields = [...formData.required_fields];
        [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
        setFormData(prev => ({ ...prev, required_fields: newFields }));
    };

    const moveFieldDown = (index: number) => {
        if (index === formData.required_fields.length - 1) return;
        const newFields = [...formData.required_fields];
        [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
        setFormData(prev => ({ ...prev, required_fields: newFields }));
    };

    const addOption = () => {
        if (!newOption.trim()) return;
        setNewField(prev => ({
            ...prev,
            options: [...(prev.options || []), newOption.trim()]
        }));
        setNewOption('');
    };

    const removeOption = (index: number) => {
        setNewField(prev => ({
            ...prev,
            options: prev.options?.filter((_, i) => i !== index)
        }));
    };

    // Resolution Steps Management
    const addResolutionStep = () => {
        const nextStep = formData.resolution_steps.length + 1;
        const newStep: ResolutionStep = {
            step: nextStep,
            action: `Step ${nextStep}`,
            description: '',
        };
        setFormData(prev => ({
            ...prev,
            resolution_steps: [...prev.resolution_steps, newStep]
        }));
    };

    const updateResolutionStep = (index: number, field: keyof ResolutionStep, value: string) => {
        const updatedSteps = [...formData.resolution_steps];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };
        setFormData(prev => ({ ...prev, resolution_steps: updatedSteps }));
    };

    const removeResolutionStep = (index: number) => {
        setFormData(prev => ({
            ...prev,
            resolution_steps: prev.resolution_steps.filter((_, i) => i !== index)
        }));
        // Reorder steps
        setTimeout(() => {
            const reordered = formData.resolution_steps
                .filter((_, i) => i !== index)
                .map((step, idx) => ({ ...step, step: idx + 1 }));
            setFormData(prev => ({ ...prev, resolution_steps: reordered }));
        }, 0);
    };

    // Validate form
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Code is required';
        } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
            newErrors.code = 'Code must contain only uppercase letters, numbers, and underscores';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (formData.priority_level < 1 || formData.priority_level > 4) {
            newErrors.priority_level = 'Priority level must be between 1 and 4';
        }

        if (formData.resolution_days < 1) {
            newErrors.resolution_days = 'Resolution days must be at least 1';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setActiveTab('basic');
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        router.put(route('admin.report-types.update', reportType.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Report type updated successfully');
                router.visit(route('admin.report-types.show', reportType.id));
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error('Failed to update report type');

                if (errors.code || errors.name || errors.category) {
                    setActiveTab('basic');
                } else if (errors.required_fields) {
                    setActiveTab('fields');
                } else if (errors.resolution_steps) {
                    setActiveTab('steps');
                } else if (errors.assigned_to_roles) {
                    setActiveTab('settings');
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    // Handle delete
    const handleDelete = () => {
        setIsSubmitting(true);
        router.delete(route('admin.report-types.destroy', reportType.id), {
            onSuccess: () => {
                toast.success('Report type deleted successfully');
                router.visit(route('admin.report-types.index'));
            },
            onError: () => {
                toast.error('Failed to delete report type');
                setIsSubmitting(false);
                setShowDeleteDialog(false);
            }
        });
    };

    // Handle cancel
    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(route('admin.report-types.show', reportType.id));
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get icon component
    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = {
            'alert-circle': AlertCircle,
            'alert-triangle': AlertTriangle,
            'volume-2': Volume2,
            'droplets': Droplets,
            'zap': Zap,
            'map': Map,
            'shield': Shield,
            'users': Users,
            'heart': Heart,
            'paw-print': PawPrint,
            'building': Building,
            'car': Car,
            'waves': Waves,
            'store': Store,
            'file-text': FileText,
            'clock': Clock,
        };
        return icons[iconName] || AlertCircle;
    };

    return (
        <AppLayout
            title={`Edit: ${reportType.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Report Types', href: '/report-types' },
                { title: reportType.name, href: `/report-types/${reportType.id}` },
                { title: 'Edit', href: `/report-types/${reportType.id}/edit` }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header with Progress */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCancel}
                                type="button"
                                className="h-8 w-8 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <div 
                                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: formData.color + '20', color: formData.color }}
                                >
                                    {React.createElement(getIconComponent(formData.icon), { className: "h-5 w-5" })}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight dark:text-white">Edit Report Type</h1>
                                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                                        Update the details for "{reportType.name}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(route('admin.report-types.show', reportType.id))}
                                disabled={isSubmitting}
                                type="button"
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowHistory(true)}
                                disabled={isSubmitting}
                                type="button"
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                            >
                                <History className="h-4 w-4 mr-2" />
                                History
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                type="button"
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="report-type-form"
                                size="sm"
                                disabled={isSubmitting}
                                className="gap-2 min-w-[100px] dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Saving...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="dark:text-gray-300">Form Completion</span>
                            <span className="font-medium dark:text-white">{formProgress}%</span>
                        </div>
                        <Progress value={formProgress} className="h-2 dark:bg-gray-700" />
                    </div>

                    {/* Status Alert */}
                    {!reportType.is_active && (
                        <Alert variant="destructive" className="dark:bg-red-950 dark:border-red-800">
                            <AlertCircle className="h-4 w-4 dark:text-red-400" />
                            <AlertTitle className="dark:text-red-300">Report Type is Inactive</AlertTitle>
                            <AlertDescription className="dark:text-red-400">
                                This report type is currently inactive and won't be available for submission.
                                Toggle the active status to enable it.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Main Form */}
                    <form 
                        id="report-type-form" 
                        onSubmit={handleSubmit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                            <TabsList className="grid w-full grid-cols-4 lg:w-auto ">
                                <TabsTrigger value="basic" className="gap-2 " type="button">
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Basic Info</span>
                                </TabsTrigger>
                                <TabsTrigger value="fields" className="gap-2 " type="button">
                                    <ListChecks className="h-4 w-4" />
                                    <span className="hidden sm:inline">Required Fields</span>
                                    {formData.required_fields.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 dark:bg-gray-700 dark:text-gray-300">
                                            {formData.required_fields.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="steps" className="gap-2 " type="button">
                                    <Activity className="h-4 w-4" />
                                    <span className="hidden sm:inline">Resolution Steps</span>
                                    {formData.resolution_steps.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 dark:bg-gray-700 dark:text-gray-300">
                                            {formData.resolution_steps.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="gap-2 " type="button">
                                    <Settings className="h-4 w-4" />
                                    <span className="hidden sm:inline">Settings</span>
                                    {formData.assigned_to_roles.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 dark:bg-gray-700 dark:text-gray-300">
                                            {formData.assigned_to_roles.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            {/* Basic Information Tab */}
                            <TabsContent value="basic" className="space-y-4">
                                <Card className="dark:bg-gray-900 dark:border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="dark:text-white">Basic Information</CardTitle>
                                        <CardDescription className="dark:text-gray-400">
                                            Edit the basic details for this report type
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Code and Name */}
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="code" className="flex items-center gap-1 dark:text-gray-300">
                                                    Code
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <HelpCircle className="h-4 w-4 text-muted-foreground dark:text-gray-500 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="dark:bg-gray-900 dark:border-gray-700">
                                                                <p className="dark:text-gray-300">Unique identifier (uppercase letters, numbers, underscores)</p>
                                                                {codeManuallyEdited && (
                                                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                                                        Auto-generation disabled (manual edit detected)
                                                                    </p>
                                                                )}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="code"
                                                        name="code"
                                                        value={formData.code}
                                                        onChange={handleCodeEdit}
                                                        placeholder="e.g., NOISE_COMPLAINT"
                                                        className={`${errors.code ? 'border-destructive dark:border-red-800' : ''} ${codeManuallyEdited ? 'border-yellow-500 dark:border-yellow-600' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                                        disabled={isSubmitting}
                                                        ref={codeInputRef}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={generateCode}
                                                        disabled={!formData.name || isSubmitting}
                                                        title="Generate from name"
                                                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                                    >
                                                        <Sparkles className="h-4 w-4" />
                                                    </Button>
                                                    {codeManuallyEdited && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={resetAutoGenerate}
                                                            disabled={isSubmitting}
                                                            title="Re-enable auto-generation"
                                                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                {errors.code && (
                                                    <p className="text-sm text-destructive dark:text-red-400">{errors.code}</p>
                                                )}
                                                {codeManuallyEdited && !errors.code && (
                                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                                        Manual edit - auto-generation disabled
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="dark:text-gray-300">Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleNameEdit}
                                                    placeholder="e.g., Noise Complaint"
                                                    className={`${errors.name ? 'border-destructive dark:border-red-800' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                                    disabled={isSubmitting}
                                                    ref={nameInputRef}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-destructive dark:text-red-400">{errors.name}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Category and Subcategory */}
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="category" className="dark:text-gray-300">Category</Label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={(value) => handleSelectChange('category', value)}
                                                    disabled={isSubmitting}
                                                >
                                                    <SelectTrigger className={`${errors.category ? 'border-destructive dark:border-red-800' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                        {categoryOptionsArray.map((option) => (
                                                            <SelectItem key={option.value} value={option.value} className="dark:text-white dark:focus:bg-gray-700">
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="subcategory" className="dark:text-gray-300">Subcategory (Optional)</Label>
                                                <Input
                                                    id="subcategory"
                                                    name="subcategory"
                                                    value={formData.subcategory}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., neighbor, animals, parking"
                                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Enter a description for this report type"
                                                rows={4}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        {/* Icon and Color */}
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="icon" className="dark:text-gray-300">Icon</Label>
                                                <div className="relative">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full justify-start gap-2 h-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                                        onClick={() => setShowIconPicker(!showIconPicker)}
                                                    >
                                                        {selectedIcon && (
                                                            <>
                                                                {iconOptions.find(i => i.value === selectedIcon)?.icon && (
                                                                    <>
                                                                        {React.createElement(
                                                                            iconOptions.find(i => i.value === selectedIcon)!.icon,
                                                                            { className: "h-4 w-4" }
                                                                        )}
                                                                    </>
                                                                )}
                                                                <span className="flex-1 text-left">
                                                                    {iconOptions.find(i => i.value === selectedIcon)?.label || 'Select an icon'}
                                                                </span>
                                                            </>
                                                        )}
                                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                                    </Button>

                                                    {showIconPicker && (
                                                        <Card className="absolute z-50 mt-1 w-full max-h-[400px] overflow-hidden dark:bg-gray-900 dark:border-gray-700">
                                                            <div className="p-2 border-b dark:border-gray-700">
                                                                <Input
                                                                    placeholder="Search icons..."
                                                                    value={searchIconTerm}
                                                                    onChange={(e) => setSearchIconTerm(e.target.value)}
                                                                    className="h-8 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                                />
                                                            </div>
                                                            <ScrollArea className="h-[300px]">
                                                                <div className="p-2 grid grid-cols-4 gap-1">
                                                                    {filteredIcons.map((icon) => (
                                                                        <Button
                                                                            key={icon.value}
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className={`h-auto py-2 flex-col gap-1 dark:hover:bg-gray-700 ${
                                                                                selectedIcon === icon.value ? 'bg-primary/10 border-primary dark:bg-primary/20' : ''
                                                                            }`}
                                                                            onClick={() => {
                                                                                handleSelectChange('icon', icon.value);
                                                                                setSelectedIcon(icon.value);
                                                                                setShowIconPicker(false);
                                                                                setSearchIconTerm('');
                                                                            }}
                                                                        >
                                                                            <icon.icon className="h-5 w-5" />
                                                                            <span className="text-[10px] text-center line-clamp-2 dark:text-gray-400">
                                                                                {icon.label}
                                                                            </span>
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            </ScrollArea>
                                                        </Card>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="color" className="dark:text-gray-300">Color</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="color"
                                                        name="color"
                                                        type="color"
                                                        value={formData.color}
                                                        onChange={handleInputChange}
                                                        className="w-20 h-10 p-1 dark:bg-gray-900 dark:border-gray-700"
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="flex-1 grid grid-cols-6 gap-1">
                                                        {colorPresets.map((color) => (
                                                            <TooltipProvider key={color}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                                                                            style={{ 
                                                                                backgroundColor: color,
                                                                                borderColor: formData.color === color ? '#000' : 'transparent'
                                                                            }}
                                                                            onClick={() => handleSelectChange('color', color)}
                                                                            disabled={isSubmitting}
                                                                        />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="bottom" className="dark:bg-gray-900 dark:border-gray-700">
                                                                        <p className="dark:text-gray-300">{color}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Priority and Resolution */}
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="priority_level" className="dark:text-gray-300">Priority Level</Label>
                                                <Select
                                                    value={formData.priority_level.toString()}
                                                    onValueChange={(value) => handleNumberChange('priority_level', value)}
                                                    disabled={isSubmitting}
                                                >
                                                    <SelectTrigger className={`${errors.priority_level ? 'border-destructive dark:border-red-800' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}>
                                                        <SelectValue placeholder="Select priority level" />
                                                    </SelectTrigger>
                                                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                        {Object.entries(priorityOptions).map(([value, label]) => (
                                                            <SelectItem key={value} value={value} className="dark:text-white dark:focus:bg-gray-700">
                                                                <div className="flex items-center gap-2">
                                                                    {value === '1' && <Zap className="h-4 w-4 text-red-500" />}
                                                                    {value === '2' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                                                                    {value === '3' && <Clock className="h-4 w-4 text-yellow-500" />}
                                                                    {value === '4' && <Target className="h-4 w-4 text-green-500" />}
                                                                    {label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.priority_level && (
                                                    <p className="text-sm text-destructive dark:text-red-400">{errors.priority_level}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="resolution_days" className="dark:text-gray-300">Resolution Days</Label>
                                                <Input
                                                    id="resolution_days"
                                                    name="resolution_days"
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={formData.resolution_days}
                                                    onChange={(e) => handleNumberChange('resolution_days', e.target.value)}
                                                    className={`${errors.resolution_days ? 'border-destructive dark:border-red-800' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                                    disabled={isSubmitting}
                                                />
                                                {errors.resolution_days && (
                                                    <p className="text-sm text-destructive dark:text-red-400">{errors.resolution_days}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Required Fields Tab */}
                            <TabsContent value="fields" className="space-y-4">
                                <Card className="dark:bg-gray-900 dark:border-gray-700">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="dark:text-white">Required Fields</CardTitle>
                                                <CardDescription className="dark:text-gray-400">
                                                    Configure the fields required for this report type
                                                </CardDescription>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setNewField({
                                                        key: '',
                                                        label: '',
                                                        type: 'text',
                                                        required: true,
                                                        placeholder: '',
                                                        options: [],
                                                    });
                                                    setEditingFieldIndex(null);
                                                    setShowCustomFieldForm(true);
                                                }}
                                                disabled={isSubmitting}
                                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Field
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Custom Field Form */}
                                        {showCustomFieldForm && (
                                            <Card className="border border-primary/20 bg-primary/5 dark:bg-primary/10">
                                                <CardContent className="pt-6 space-y-4">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="field_key" className="dark:text-gray-300">Field Key *</Label>
                                                            <Input
                                                                id="field_key"
                                                                value={newField.key}
                                                                onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                                                                placeholder="e.g., complainant_name"
                                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                                disabled={isSubmitting}
                                                            />
                                                            <p className="text-xs text-muted-foreground dark:text-gray-400">
                                                                Unique identifier (lowercase, underscores)
                                                            </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="field_label" className="dark:text-gray-300">Field Label *</Label>
                                                            <Input
                                                                id="field_label"
                                                                value={newField.label}
                                                                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                                                placeholder="e.g., Full Name"
                                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                                disabled={isSubmitting}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="field_type" className="dark:text-gray-300">Field Type</Label>
                                                            <Select
                                                                value={newField.type}
                                                                onValueChange={(value) => setNewField({ ...newField, type: value })}
                                                                disabled={isSubmitting}
                                                            >
                                                                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                                                    <SelectValue placeholder="Select field type" />
                                                                </SelectTrigger>
                                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                                    {Object.entries(fieldTypes).map(([value, label]) => (
                                                                        <SelectItem key={value} value={value} className="dark:text-white dark:focus:bg-gray-700">
                                                                            {label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="field_placeholder" className="dark:text-gray-300">Placeholder (Optional)</Label>
                                                            <Input
                                                                id="field_placeholder"
                                                                value={newField.placeholder || ''}
                                                                onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                                                                placeholder="Enter placeholder text"
                                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                                disabled={isSubmitting}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Options for select/radio fields */}
                                                    {(newField.type === 'select' || newField.type === 'radio') && (
                                                        <div className="space-y-2">
                                                            <Label className="dark:text-gray-300">Options</Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    value={newOption}
                                                                    onChange={(e) => setNewOption(e.target.value)}
                                                                    placeholder="Add an option"
                                                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                                    disabled={isSubmitting}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={addOption}
                                                                    disabled={!newOption.trim() || isSubmitting}
                                                                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                                                >
                                                                    Add
                                                                </Button>
                                                            </div>
                                                            {newField.options && newField.options.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {newField.options.map((opt, idx) => (
                                                                        <Badge key={idx} variant="secondary" className="gap-1 dark:bg-gray-700 dark:text-gray-300">
                                                                            {opt}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeOption(idx)}
                                                                                className="ml-1 hover:text-destructive dark:hover:text-red-400"
                                                                            >
                                                                                <X className="h-3 w-3" />
                                                                            </button>
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Rows for textarea */}
                                                    {newField.type === 'textarea' && (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="field_rows" className="dark:text-gray-300">Rows</Label>
                                                            <Input
                                                                id="field_rows"
                                                                type="number"
                                                                min="1"
                                                                max="10"
                                                                value={newField.rows || 4}
                                                                onChange={(e) => setNewField({ ...newField, rows: parseInt(e.target.value) || 4 })}
                                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                                disabled={isSubmitting}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={newField.required}
                                                                onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                                                                disabled={isSubmitting}
                                                                className="dark:data-[state=checked]:bg-blue-600"
                                                            />
                                                            <Label className="dark:text-gray-300">Required field</Label>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setShowCustomFieldForm(false);
                                                                    setEditingFieldIndex(null);
                                                                }}
                                                                disabled={isSubmitting}
                                                                className="dark:text-gray-400 dark:hover:text-white"
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="default"
                                                                size="sm"
                                                                onClick={editingFieldIndex !== null ? updateRequiredField : addRequiredField}
                                                                disabled={isSubmitting}
                                                                className="dark:bg-blue-600 dark:hover:bg-blue-700"
                                                            >
                                                                {editingFieldIndex !== null ? 'Update' : 'Add'} Field
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Fields List */}
                                        {formData.required_fields.length > 0 ? (
                                            <div className="space-y-2">
                                                {formData.required_fields.map((field, index) => (
                                                    <Card key={index} className="border border-muted hover:border-primary/20 transition-colors dark:bg-gray-900 dark:border-gray-700">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <GripVertical className="h-4 w-4 text-muted-foreground dark:text-gray-500 cursor-move" />
                                                                        <span className="font-medium dark:text-white">{field.label}</span>
                                                                        {field.required && (
                                                                            <Badge variant="destructive" className="text-xs dark:bg-red-900 dark:text-red-200">Required</Badge>
                                                                        )}
                                                                        <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                                            {field.type}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground dark:text-gray-400 ml-6">
                                                                        <code className="px-1 py-0.5 bg-muted rounded dark:bg-gray-700 dark:text-gray-300">
                                                                            {field.key}
                                                                        </code>
                                                                        {field.placeholder && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>"{field.placeholder}"</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    {field.options && field.options.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-2 ml-6">
                                                                            {field.options.map((opt, optIdx) => (
                                                                                <Badge key={optIdx} variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                                                                    {opt}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 dark:text-gray-400 dark:hover:text-white"
                                                                        onClick={() => moveFieldUp(index)}
                                                                        disabled={index === 0 || isSubmitting}
                                                                        title="Move up"
                                                                    >
                                                                        <ChevronUp className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 dark:text-gray-400 dark:hover:text-white"
                                                                        onClick={() => moveFieldDown(index)}
                                                                        disabled={index === formData.required_fields.length - 1 || isSubmitting}
                                                                        title="Move down"
                                                                    >
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 dark:text-gray-400 dark:hover:text-white"
                                                                        onClick={() => editRequiredField(index)}
                                                                        disabled={isSubmitting}
                                                                        title="Edit field"
                                                                    >
                                                                        <Settings className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-destructive hover:text-destructive dark:text-red-400 dark:hover:text-red-300"
                                                                        onClick={() => removeRequiredField(index)}
                                                                        disabled={isSubmitting}
                                                                        title="Remove field"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 border-2 border-dashed rounded-lg dark:border-gray-700">
                                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
                                                    <ListChecks className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2 dark:text-white">No Custom Fields</h3>
                                                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4 max-w-md mx-auto">
                                                    This report type will use default fields. Add custom fields to collect specific information.
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setNewField({
                                                            key: '',
                                                            label: '',
                                                            type: 'text',
                                                            required: true,
                                                            placeholder: '',
                                                            options: [],
                                                        });
                                                        setShowCustomFieldForm(true);
                                                    }}
                                                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Your First Field
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Resolution Steps Tab */}
                            <TabsContent value="steps" className="space-y-4">
                                <Card className="dark:bg-gray-900 dark:border-gray-700">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="dark:text-white">Resolution Steps</CardTitle>
                                                <CardDescription className="dark:text-gray-400">
                                                    Define the steps to resolve this type of report
                                                </CardDescription>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addResolutionStep}
                                                disabled={isSubmitting}
                                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Step
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {formData.resolution_steps.length > 0 ? (
                                            <div className="space-y-4">
                                                {formData.resolution_steps.map((step, index) => (
                                                    <Card key={index} className="border border-muted hover:border-primary/20 transition-colors dark:bg-gray-900 dark:border-gray-700">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start gap-4">
                                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center dark:bg-primary/20">
                                                                    <span className="text-sm font-bold text-primary dark:text-primary-400">{step.step}</span>
                                                                </div>
                                                                <div className="flex-1 space-y-2">
                                                                    <Input
                                                                        value={step.action}
                                                                        onChange={(e) => updateResolutionStep(index, 'action', e.target.value)}
                                                                        placeholder="Action title (e.g., 'Initial Assessment')"
                                                                        disabled={isSubmitting}
                                                                        className="font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                                    />
                                                                    <Textarea
                                                                        value={step.description}
                                                                        onChange={(e) => updateResolutionStep(index, 'description', e.target.value)}
                                                                        placeholder="Step description - explain what happens in this step"
                                                                        rows={2}
                                                                        disabled={isSubmitting}
                                                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                                    />
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:text-destructive dark:text-red-400 dark:hover:text-red-300"
                                                                    onClick={() => removeResolutionStep(index)}
                                                                    disabled={isSubmitting}
                                                                    title="Remove step"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 border-2 border-dashed rounded-lg dark:border-gray-700">
                                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
                                                    <Activity className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2 dark:text-white">No Resolution Steps</h3>
                                                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4 max-w-md mx-auto">
                                                    Add steps to define how this report type should be resolved from submission to closure.
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addResolutionStep}
                                                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add First Step
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Settings Tab */}
                            <TabsContent value="settings" className="space-y-4">
                                <Card className="dark:bg-gray-900 dark:border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="dark:text-white">Report Type Settings</CardTitle>
                                        <CardDescription className="dark:text-gray-400">
                                            Configure behavior and permissions
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Toggle Switches */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700/50">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                                                        <Label className="text-base dark:text-white">Active Status</Label>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                                                        Enable this report type for submission
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.is_active}
                                                    onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                                                    disabled={isSubmitting}
                                                    className="dark:data-[state=checked]:bg-blue-600"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700/50">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                                                        <Label className="text-base dark:text-white">Requires Immediate Action</Label>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                                                        Mark this report type as high priority requiring immediate response
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.requires_immediate_action}
                                                    onCheckedChange={(checked) => handleSwitchChange('requires_immediate_action', checked)}
                                                    disabled={isSubmitting}
                                                    className="dark:data-[state=checked]:bg-blue-600"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700/50">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Camera className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                                        <Label className="text-base dark:text-white">Requires Evidence</Label>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                                                        Require photo/video evidence when submitting reports
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.requires_evidence}
                                                    onCheckedChange={(checked) => handleSwitchChange('requires_evidence', checked)}
                                                    disabled={isSubmitting}
                                                    className="dark:data-[state=checked]:bg-blue-600"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700/50">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <EyeOff className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                                                        <Label className="text-base dark:text-white">Allows Anonymous Reports</Label>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                                                        Allow residents to submit reports anonymously
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.allows_anonymous}
                                                    onCheckedChange={(checked) => handleSwitchChange('allows_anonymous', checked)}
                                                    disabled={isSubmitting}
                                                    className="dark:data-[state=checked]:bg-blue-600"
                                                />
                                            </div>
                                        </div>

                                        <Separator className="dark:bg-gray-700" />

                                        {/* Assigned Roles */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-5 w-5 dark:text-gray-300" />
                                                <Label className="text-base dark:text-white">Assigned Roles</Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                                Select which personnel roles should handle this type of report
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                {Object.entries(roleOptions).map(([value, label]) => (
                                                    <Button
                                                        key={value}
                                                        type="button"
                                                        variant={formData.assigned_to_roles.includes(value) ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => toggleRole(value)}
                                                        disabled={isSubmitting}
                                                        className={`justify-start h-auto py-2 px-3 ${
                                                            formData.assigned_to_roles.includes(value) 
                                                                ? 'dark:bg-blue-600 dark:hover:bg-blue-700' 
                                                                : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                                                        }`}
                                                    >
                                                        <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                                                        <span className="text-sm truncate">{label}</span>
                                                        {formData.assigned_to_roles.includes(value) && (
                                                            <CheckCircle className="h-4 w-4 ml-auto flex-shrink-0" />
                                                        )}
                                                    </Button>
                                                ))}
                                            </div>
                                            {formData.assigned_to_roles.length === 0 && (
                                                <p className="text-sm text-muted-foreground dark:text-gray-400 text-center py-4 border rounded-lg bg-muted/50 dark:bg-gray-900/50 dark:border-gray-700">
                                                    No roles selected. This report type will use default assignment.
                                                </p>
                                            )}
                                        </div>

                                        <Separator className="dark:bg-gray-700" />

                                        {/* Danger Zone */}
                                        <div className="space-y-4">
                                            <Label className="text-destructive dark:text-red-400">Danger Zone</Label>
                                            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5 dark:border-red-900 dark:bg-red-950/20">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="h-5 w-5 text-destructive dark:text-red-400 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium dark:text-gray-300">Delete Report Type</p>
                                                        <p className="text-xs text-muted-foreground dark:text-gray-400">
                                                            Once deleted, this action cannot be undone.
                                                            {reportType.community_reports_count > 0 && (
                                                                <span className="text-destructive dark:text-red-400 block mt-1">
                                                                    Has {reportType.community_reports_count} associated report(s). Cannot delete.
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setShowDeleteDialog(true)}
                                                    disabled={isSubmitting || reportType.community_reports_count > 0}
                                                    className="dark:bg-red-900 dark:hover:bg-red-800"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </form>

                    {/* Form Tips */}
                    <Card className="bg-muted/50 dark:bg-gray-900/50 dark:border-gray-700">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2 dark:text-gray-300">
                                <HelpCircle className="h-4 w-4" />
                                Form Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-primary/20">
                                        <span className="text-xs font-bold text-primary dark:text-primary-400">1</span>
                                    </div>
                                    <p className="text-muted-foreground dark:text-gray-400">
                                        <span className="font-medium text-foreground dark:text-white">Code:</span> Auto-generated from name, but you can edit it manually
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-primary/20">
                                        <span className="text-xs font-bold text-primary dark:text-primary-400">2</span>
                                    </div>
                                    <p className="text-muted-foreground dark:text-gray-400">
                                        <span className="font-medium text-foreground dark:text-white">Priority Level:</span> 1=Critical, 2=High, 3=Medium, 4=Low
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-primary/20">
                                        <span className="text-xs font-bold text-primary dark:text-primary-400">3</span>
                                    </div>
                                    <p className="text-muted-foreground dark:text-gray-400">
                                        <span className="font-medium text-foreground dark:text-white">Required Fields:</span> Add custom fields specific to this report type
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-primary/20">
                                        <span className="text-xs font-bold text-primary dark:text-primary-400">4</span>
                                    </div>
                                    <p className="text-muted-foreground dark:text-gray-400">
                                        <span className="font-medium text-foreground dark:text-white">Resolution Steps:</span> Define the process from submission to closure
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TooltipProvider>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">Delete Report Type</DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            Are you sure you want to delete "{reportType.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {reportType.community_reports_count > 0 && (
                        <div className="bg-destructive/10 p-3 rounded-lg dark:bg-red-950/30">
                            <p className="text-sm text-destructive dark:text-red-400">
                                <AlertCircle className="h-4 w-4 inline mr-1" />
                                This report type has {reportType.community_reports_count} associated report(s). 
                                You cannot delete it while reports exist.
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isSubmitting}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSubmitting || reportType.community_reports_count > 0}
                            className="dark:bg-red-900 dark:hover:bg-red-800"
                        >
                            {isSubmitting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">Report Type History</DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                            Creation and modification details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">Created</p>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                {formatDate(reportType.created_at)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">Last Updated</p>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                {formatDate(reportType.updated_at)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">ID</p>
                            <p className="text-sm font-mono text-muted-foreground dark:text-gray-400">
                                {reportType.id}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium dark:text-gray-300">Total Reports</p>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                                {reportType.community_reports_count}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowHistory(false)} type="button" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
// pages/admin/document-types/create.tsx

import { router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2,
    FileCode,
    HardDrive,
    ListOrdered,
    AlertCircle,
    CheckCircle,
    FileText,
    Folder,
    HelpCircle,
    Copy,
    Sparkles,
    Hash
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Import types from centralized location
import type { CategoryOption } from '@/types/admin/document-types/document-types';

// Extend PageProps with index signature to satisfy Inertia's constraint
interface CreatePageProps extends Record<string, any> {
    categories: CategoryOption[];
    commonFormats: Record<string, string>;
    commonTypes: Array<{
        code: string;
        name: string;
        description: string;
        accepted_formats: string[];
        max_file_size: number;
        sort_order: number;
        is_required: boolean;
        category_id: number;
    }>;
}

export default function DocumentTypeCreate() {
    const { props } = usePage<CreatePageProps>();
    const { categories = [], commonFormats = {}, commonTypes = [] } = props;

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        document_category_id: '',
        is_required: false,
        is_active: true,
        accepted_formats: [] as string[],
        max_file_size: 2048, // Default 2MB in KB
        sort_order: 0,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
    const [customFormat, setCustomFormat] = useState('');
    const [showCustomFormatInput, setShowCustomFormatInput] = useState(false);
    const [fileSizeUnit, setFileSizeUnit] = useState<'KB' | 'MB'>('KB');
    const [fileSizeValue, setFileSizeValue] = useState(formData.max_file_size);

    // Update file size when unit changes
    useEffect(() => {
        if (fileSizeUnit === 'MB') {
            setFileSizeValue(Math.round(formData.max_file_size / 1024));
        } else {
            setFileSizeValue(formData.max_file_size);
        }
    }, [fileSizeUnit, formData.max_file_size]);

    // Update form data when file size value changes
    const handleFileSizeChange = (value: number) => {
        setFileSizeValue(value);
        if (fileSizeUnit === 'MB') {
            setFormData(prev => ({ ...prev, max_file_size: value * 1024 }));
        } else {
            setFormData(prev => ({ ...prev, max_file_size: value }));
        }
    };

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
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

    // Handle switch changes
    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    // Handle format selection
    const toggleFormat = (format: string) => {
        setSelectedFormats(prev => {
            const newFormats = prev.includes(format)
                ? prev.filter(f => f !== format)
                : [...prev, format];
            
            setFormData(prevData => ({ ...prevData, accepted_formats: newFormats }));
            return newFormats;
        });
    };

    // Handle custom format add
    const addCustomFormat = () => {
        if (customFormat.trim()) {
            const format = customFormat.trim().toLowerCase();
            if (!selectedFormats.includes(format)) {
                setSelectedFormats(prev => {
                    const newFormats = [...prev, format];
                    setFormData(prevData => ({ ...prevData, accepted_formats: newFormats }));
                    return newFormats;
                });
                setCustomFormat('');
                setShowCustomFormatInput(false);
            } else {
                toast.error('Format already exists');
            }
        }
    };

    // Remove format
    const removeFormat = (format: string) => {
        setSelectedFormats(prev => {
            const newFormats = prev.filter(f => f !== format);
            setFormData(prevData => ({ ...prevData, accepted_formats: newFormats }));
            return newFormats;
        });
    };

    // Load common type template
    const loadCommonType = (typeCode: string) => {
        const commonType = commonTypes.find(t => t.code === typeCode);
        if (commonType) {
            setFormData({
                code: commonType.code,
                name: commonType.name,
                description: commonType.description,
                document_category_id: commonType.category_id.toString(),
                is_required: commonType.is_required,
                is_active: true,
                accepted_formats: commonType.accepted_formats,
                max_file_size: commonType.max_file_size,
                sort_order: commonType.sort_order,
            });
            setSelectedFormats(commonType.accepted_formats);
            setFileSizeValue(commonType.max_file_size);
            toast.success('Template loaded successfully');
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
            setFormData(prev => ({ ...prev, code }));
        }
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

        if (!formData.document_category_id) {
            newErrors.document_category_id = 'Category is required';
        }

        if (formData.max_file_size <= 0) {
            newErrors.max_file_size = 'File size must be greater than 0';
        } else if (formData.max_file_size > 10240) { // 10MB max
            newErrors.max_file_size = 'File size cannot exceed 10MB';
        }

        if (formData.sort_order < 0) {
            newErrors.sort_order = 'Sort order must be 0 or greater';
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

        router.post(route('document-types.store'), formData, {
            onSuccess: () => {
                toast.success('Document type created successfully');
                router.visit(route('admin.document-types.index'));
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error('Failed to create document type');
                setIsSubmitting(false);
                
                // Switch to tab with errors
                if (errors.document_category_id || errors.code || errors.name) {
                    setActiveTab('basic');
                } else if (errors.accepted_formats || errors.max_file_size) {
                    setActiveTab('specs');
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    // Handle cancel
    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            router.visit(route('admin.document-types.index'));
        }
    };

    return (
        <AppLayout
            title="Create Document Type"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Document Types', href: '/admin/document-types' },
                { title: 'Create', href: '/admin/document-types/create' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                type="button"
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">Create Document Type</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Add a new document type to the system
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                type="button"
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                size="sm"
                                disabled={isSubmitting}
                                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700"
                                type="button"
                            >
                                {isSubmitting ? (
                                    <>Creating...</>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Create Document Type
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Template Selection */}
                    {commonTypes.length > 0 && (
                        <Card className="border-l-4 border-l-blue-500 dark:bg-gray-900">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-blue-800 dark:text-blue-300">Quick start with templates</h3>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                            Choose from common document type templates to get started quickly.
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {commonTypes.map((type) => (
                                                <Button
                                                    key={type.code}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => loadCommonType(type.code)}
                                                    className="gap-2 dark:border-gray-600 dark:text-gray-300"
                                                    type="button"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                    {type.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Error Alert */}
                    {Object.keys(errors).length > 0 && (
                        <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-800 dark:text-red-300">Please fix the following errors:</p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            {Object.entries(errors).map(([field, message]) => (
                                                <li key={field} className="text-sm text-red-600 dark:text-red-400">
                                                    <span className="font-medium capitalize">{field.replace('_', ' ')}:</span> {message}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Main Form */}
                    <div className="space-y-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                                <TabsTrigger value="basic" className="gap-2 dark:text-gray-400 dark:data-[state=active]:text-white">
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Basic Information</span>
                                </TabsTrigger>
                                <TabsTrigger value="specs" className="gap-2 dark:text-gray-400 dark:data-[state=active]:text-white">
                                    <HardDrive className="h-4 w-4" />
                                    <span className="hidden sm:inline">File Specifications</span>
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="gap-2 dark:text-gray-400 dark:data-[state=active]:text-white">
                                    <ListOrdered className="h-4 w-4" />
                                    <span className="hidden sm:inline">Settings</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Basic Information Tab */}
                            <TabsContent value="basic" className="space-y-4">
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="dark:text-gray-100">Basic Information</CardTitle>
                                        <CardDescription className="dark:text-gray-400">
                                            Enter the basic details for this document type
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Code and Name */}
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="code" className="flex items-center gap-1 dark:text-gray-300">
                                                    Code
                                                    <Tooltip>
                                                        <TooltipTrigger type="button">
                                                            <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="dark:bg-gray-900 dark:text-gray-300">
                                                            <p>Unique identifier (uppercase letters, numbers, underscores)</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </Label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                        <Input
                                                            id="code"
                                                            name="code"
                                                            value={formData.code}
                                                            onChange={handleInputChange}
                                                            placeholder="e.g., BARANGAY_CLEARANCE"
                                                            className={`pl-10 ${errors.code ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                                                            disabled={isSubmitting}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={generateCode}
                                                        disabled={!formData.name || isSubmitting}
                                                        title="Generate from name"
                                                        className="dark:border-gray-600 dark:text-gray-300"
                                                    >
                                                        <Sparkles className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {errors.code && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="dark:text-gray-300">Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Barangay Clearance"
                                                    className={`${errors.name ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                                                    disabled={isSubmitting}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                                )}
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
                                                placeholder="Enter a description for this document type"
                                                rows={4}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        {/* Category */}
                                        <div className="space-y-2">
                                            <Label htmlFor="category" className="dark:text-gray-300">Category</Label>
                                            <Select
                                                value={formData.document_category_id}
                                                onValueChange={(value) => handleSelectChange('document_category_id', value)}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger className={`${errors.document_category_id ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                            <div className="flex items-center gap-2">
                                                                <Folder className="h-4 w-4" />
                                                                {category.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.document_category_id && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.document_category_id}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* File Specifications Tab */}
                            <TabsContent value="specs" className="space-y-4">
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="dark:text-gray-100">File Specifications</CardTitle>
                                        <CardDescription className="dark:text-gray-400">
                                            Configure accepted file formats and size limits
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Accepted Formats */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="dark:text-gray-300">Accepted File Formats</Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowCustomFormatInput(true)}
                                                    disabled={showCustomFormatInput || isSubmitting}
                                                    className="dark:border-gray-600 dark:text-gray-300"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Custom Format
                                                </Button>
                                            </div>

                                            {/* Common Formats Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                {Object.entries(commonFormats).map(([format, label]) => (
                                                    <Button
                                                        key={format}
                                                        type="button"
                                                        variant={selectedFormats.includes(format) ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => toggleFormat(format)}
                                                        disabled={isSubmitting}
                                                        className={`justify-start ${
                                                            selectedFormats.includes(format)
                                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-blue-700 dark:to-indigo-700'
                                                                : 'dark:border-gray-600 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        <FileCode className="h-4 w-4 mr-2" />
                                                        {label}
                                                        {selectedFormats.includes(format) && (
                                                            <CheckCircle className="h-4 w-4 ml-auto" />
                                                        )}
                                                    </Button>
                                                ))}
                                            </div>

                                            {/* Custom Format Input */}
                                            {showCustomFormatInput && (
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={customFormat}
                                                        onChange={(e) => setCustomFormat(e.target.value)}
                                                        placeholder="Enter format (e.g., psd, ai)"
                                                        className="flex-1 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                        disabled={isSubmitting}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="default"
                                                        size="sm"
                                                        onClick={addCustomFormat}
                                                        disabled={!customFormat.trim() || isSubmitting}
                                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700"
                                                    >
                                                        Add
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowCustomFormatInput(false);
                                                            setCustomFormat('');
                                                        }}
                                                        disabled={isSubmitting}
                                                        className="dark:text-gray-400 dark:hover:text-white"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Selected Formats */}
                                            {selectedFormats.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="dark:text-gray-300">Selected Formats</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedFormats.map((format) => (
                                                            <Badge key={format} variant="secondary" className="gap-1 dark:bg-gray-700 dark:text-gray-300">
                                                                {format.toUpperCase()}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFormat(format)}
                                                                    className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                                                                    disabled={isSubmitting}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <Separator className="dark:bg-gray-700" />

                                        {/* Max File Size */}
                                        <div className="space-y-4">
                                            <Label className="dark:text-gray-300">Maximum File Size</Label>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max={fileSizeUnit === 'MB' ? '10' : '10240'}
                                                        value={fileSizeValue}
                                                        onChange={(e) => handleFileSizeChange(parseInt(e.target.value) || 0)}
                                                        className={`${errors.max_file_size ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                                <Select
                                                    value={fileSizeUnit}
                                                    onValueChange={(value: 'KB' | 'MB') => setFileSizeUnit(value)}
                                                    disabled={isSubmitting}
                                                >
                                                    <SelectTrigger className="w-24 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                        <SelectItem value="KB" className="dark:text-gray-300 dark:focus:bg-gray-700">KB</SelectItem>
                                                        <SelectItem value="MB" className="dark:text-gray-300 dark:focus:bg-gray-700">MB</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {errors.max_file_size && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.max_file_size}</p>
                                            )}
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Maximum file size: 10MB (10240 KB)
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Settings Tab */}
                            <TabsContent value="settings" className="space-y-4">
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="dark:text-gray-100">Document Type Settings</CardTitle>
                                        <CardDescription className="dark:text-gray-400">
                                            Configure behavior and display settings
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Sort Order */}
                                        <div className="space-y-2">
                                            <Label htmlFor="sort_order" className="dark:text-gray-300">Sort Order</Label>
                                            <Input
                                                id="sort_order"
                                                name="sort_order"
                                                type="number"
                                                min="0"
                                                value={formData.sort_order}
                                                onChange={handleInputChange}
                                                className={`${errors.sort_order ? 'border-destructive' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300`}
                                                disabled={isSubmitting}
                                            />
                                            {errors.sort_order && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.sort_order}</p>
                                            )}
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Lower numbers appear first in lists
                                            </p>
                                        </div>

                                        <Separator className="dark:bg-gray-700" />

                                        {/* Toggle Switches */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                                <div className="space-y-0.5">
                                                    <Label className="dark:text-gray-300">Required Document</Label>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Mark this document as required for all clearance types
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.is_required}
                                                    onCheckedChange={(checked) => handleSwitchChange('is_required', checked)}
                                                    disabled={isSubmitting}
                                                    className="dark:data-[state=checked]:bg-green-600"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                                <div className="space-y-0.5">
                                                    <Label className="dark:text-gray-300">Active Status</Label>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Enable this document type for use
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.is_active}
                                                    onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                                                    disabled={isSubmitting}
                                                    className="dark:data-[state=checked]:bg-green-600"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Help Card */}
                                <Card className="dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                            <HelpCircle className="h-4 w-4" />
                                            Need help?
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm dark:text-gray-400">
                                            <p><strong className="dark:text-gray-300">Code:</strong> Unique identifier used in the system. Use uppercase letters, numbers, and underscores.</p>
                                            <p><strong className="dark:text-gray-300">Name:</strong> Display name for the document type.</p>
                                            <p><strong className="dark:text-gray-300">Category:</strong> Group this document type under a category.</p>
                                            <p><strong className="dark:text-gray-300">Accepted Formats:</strong> Select which file formats are allowed for upload.</p>
                                            <p><strong className="dark:text-gray-300">Max File Size:</strong> Maximum file size allowed for upload.</p>
                                            <p><strong className="dark:text-gray-300">Sort Order:</strong> Controls the display order in lists.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </TooltipProvider>
        </AppLayout>
    );
}
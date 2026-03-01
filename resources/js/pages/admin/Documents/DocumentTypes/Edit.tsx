// app/pages/admin/document-types/edit.tsx
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
    Sparkles,
    Eye,
    History
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

interface DocumentType {
    id: number;
    code: string;
    name: string;
    description: string | null;
    document_category_id: number;
    is_required: boolean;
    is_active: boolean;
    accepted_formats: string[];
    max_file_size: number;
    max_file_size_mb: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
    category?: {
        id: number;
        name: string;
        slug: string;
    };
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
}

interface CommonFormat {
    [key: string]: string;
}

interface PageProps {
    documentType: DocumentType;
    categories: Category[];
    commonFormats: CommonFormat;
}

export default function DocumentTypeEdit() {
    const { props } = usePage<PageProps>();
    const { documentType, categories = [], commonFormats = {} } = props;

    // Form state
    const [formData, setFormData] = useState({
        code: documentType.code || '',
        name: documentType.name || '',
        description: documentType.description || '',
        document_category_id: documentType.document_category_id?.toString() || '',
        is_required: documentType.is_required || false,
        is_active: documentType.is_active || true,
        accepted_formats: documentType.accepted_formats || [],
        max_file_size: documentType.max_file_size || 2048,
        sort_order: documentType.sort_order || 0,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedFormats, setSelectedFormats] = useState<string[]>(documentType.accepted_formats || []);
    const [customFormat, setCustomFormat] = useState('');
    const [showCustomFormatInput, setShowCustomFormatInput] = useState(false);
    const [fileSizeUnit, setFileSizeUnit] = useState<'KB' | 'MB'>(documentType.max_file_size > 1024 ? 'MB' : 'KB');
    const [fileSizeValue, setFileSizeValue] = useState(
        documentType.max_file_size > 1024 
            ? Math.round(documentType.max_file_size / 1024) 
            : documentType.max_file_size
    );
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

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
                toast.success(`Format "${format}" added`);
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
        toast.success(`Format "${format}" removed`);
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
            toast.success('Code generated from name');
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

    // Handle form submit - ONLY triggered by button click
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            // Find which tab has errors and switch to it
            if (errors.document_category_id || errors.code || errors.name) {
                setActiveTab('basic');
            } else if (errors.accepted_formats || errors.max_file_size) {
                setActiveTab('specs');
            } else if (errors.sort_order) {
                setActiveTab('settings');
            }
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        // Prepare data for submission
        const submitData = {
            ...formData,
            // Ensure boolean values are properly formatted
            is_required: Boolean(formData.is_required),
            is_active: Boolean(formData.is_active),
        };

        router.put(route('document-types.update', documentType.id), submitData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Document type updated successfully');
                router.visit(route('admin.document-types.show', documentType.id));
            },
            onError: (errors) => {
                setErrors(errors);
                toast.error('Failed to update document type');
                
                // Switch to tab with errors
                if (errors.document_category_id || errors.code || errors.name) {
                    setActiveTab('basic');
                } else if (errors.accepted_formats || errors.max_file_size) {
                    setActiveTab('specs');
                } else if (errors.sort_order) {
                    setActiveTab('settings');
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
            router.visit(route('admin.document-types.show', documentType.id));
        }
    };

    // Handle delete
    const handleDelete = () => {
        setIsSubmitting(true);
        router.delete(route('document-types.destroy', documentType.id), {
            onSuccess: () => {
                toast.success('Document type deleted successfully');
                router.visit(route('admin.document-types.index'));
            },
            onError: () => {
                toast.error('Failed to delete document type');
                setIsSubmitting(false);
                setShowDeleteDialog(false);
            }
        });
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

    return (
        <AppLayout
            title={`Edit: ${documentType.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Document Types', href: '/document-types' },
                { title: documentType.name, href: `/document-types/${documentType.id}` },
                { title: 'Edit', href: `/document-types/${documentType.id}/edit` }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCancel}
                                type="button"
                                className="h-8 w-8"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Edit Document Type</h1>
                                <p className="text-sm text-muted-foreground">
                                    Update the details for "{documentType.name}"
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(route('admin.document-types.show', documentType.id))}
                                disabled={isSubmitting}
                                type="button"
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
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="document-type-form"
                                size="sm"
                                disabled={isSubmitting}
                                className="gap-2"
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

                    {/* Status Alert */}
                    {!documentType.is_active && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Document Type is Inactive</AlertTitle>
                            <AlertDescription>
                                This document type is currently inactive and won't be available for use.
                                Toggle the active status to enable it.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* SINGLE FORM WRAPPER - contains all tabs */}
                    <form 
                        id="document-type-form" 
                        onSubmit={handleSubmit}
                        onKeyDown={(e) => {
                            // Prevent form submission on Enter key
                            if (e.key === 'Enter') {
                                e.preventDefault();
                            }
                        }}
                    >
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                                <TabsTrigger value="basic" className="gap-2" type="button">
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Basic Information</span>
                                </TabsTrigger>
                                <TabsTrigger value="specs" className="gap-2" type="button">
                                    <HardDrive className="h-4 w-4" />
                                    <span className="hidden sm:inline">File Specifications</span>
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="gap-2" type="button">
                                    <ListOrdered className="h-4 w-4" />
                                    <span className="hidden sm:inline">Settings</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Basic Information Tab */}
                            <TabsContent value="basic">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                        <CardDescription>
                                            Edit the basic details for this document type
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Code and Name */}
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="code" className="flex items-center gap-1">
                                                    Code
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Unique identifier (uppercase letters, numbers, underscores)</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="code"
                                                        name="code"
                                                        value={formData.code}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., BARANGAY_CLEARANCE"
                                                        className={errors.code ? 'border-destructive' : ''}
                                                        disabled={isSubmitting}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={generateCode}
                                                        disabled={!formData.name || isSubmitting}
                                                        title="Generate from name"
                                                    >
                                                        <Sparkles className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {errors.code && (
                                                    <p className="text-sm text-destructive">{errors.code}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Barangay Clearance"
                                                    className={errors.name ? 'border-destructive' : ''}
                                                    disabled={isSubmitting}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-destructive">{errors.name}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Enter a description for this document type"
                                                rows={4}
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        {/* Category */}
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category</Label>
                                            <Select
                                                value={formData.document_category_id}
                                                onValueChange={(value) => handleSelectChange('document_category_id', value)}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger className={errors.document_category_id ? 'border-destructive' : ''}>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <Folder className="h-4 w-4" />
                                                                {category.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.document_category_id && (
                                                <p className="text-sm text-destructive">{errors.document_category_id}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* File Specifications Tab */}
                            <TabsContent value="specs">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>File Specifications</CardTitle>
                                        <CardDescription>
                                            Update accepted file formats and size limits
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Accepted Formats */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label>Accepted File Formats</Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowCustomFormatInput(true)}
                                                    disabled={showCustomFormatInput || isSubmitting}
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
                                                        className="justify-start"
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
                                                        className="flex-1"
                                                        disabled={isSubmitting}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="default"
                                                        size="sm"
                                                        onClick={addCustomFormat}
                                                        disabled={!customFormat.trim() || isSubmitting}
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
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Selected Formats */}
                                            {selectedFormats.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label>Selected Formats</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedFormats.map((format) => (
                                                            <Badge key={format} variant="secondary" className="gap-1">
                                                                {format.toUpperCase()}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFormat(format)}
                                                                    className="ml-1 hover:text-destructive focus:outline-none"
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

                                        <Separator />

                                        {/* Max File Size */}
                                        <div className="space-y-4">
                                            <Label>Maximum File Size</Label>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max={fileSizeUnit === 'MB' ? '10' : '10240'}
                                                        value={fileSizeValue}
                                                        onChange={(e) => handleFileSizeChange(parseInt(e.target.value) || 0)}
                                                        className={errors.max_file_size ? 'border-destructive' : ''}
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                                <Select
                                                    value={fileSizeUnit}
                                                    onValueChange={(value: 'KB' | 'MB') => setFileSizeUnit(value)}
                                                    disabled={isSubmitting}
                                                >
                                                    <SelectTrigger className="w-24">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="KB">KB</SelectItem>
                                                        <SelectItem value="MB">MB</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {errors.max_file_size && (
                                                <p className="text-sm text-destructive">{errors.max_file_size}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Current: {documentType.max_file_size_mb} MB ({documentType.max_file_size} KB)
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Settings Tab */}
                            <TabsContent value="settings">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Document Type Settings</CardTitle>
                                        <CardDescription>
                                            Update behavior and display settings
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Sort Order */}
                                        <div className="space-y-2">
                                            <Label htmlFor="sort_order">Sort Order</Label>
                                            <Input
                                                id="sort_order"
                                                name="sort_order"
                                                type="number"
                                                min="0"
                                                value={formData.sort_order}
                                                onChange={handleInputChange}
                                                className={errors.sort_order ? 'border-destructive' : ''}
                                                disabled={isSubmitting}
                                            />
                                            {errors.sort_order && (
                                                <p className="text-sm text-destructive">{errors.sort_order}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Lower numbers appear first in lists
                                            </p>
                                        </div>

                                        <Separator />

                                        {/* Toggle Switches */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Required Document</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Mark this document as required for all clearance types
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.is_required}
                                                    onCheckedChange={(checked) => handleSwitchChange('is_required', checked)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Active Status</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Enable this document type for use
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.is_active}
                                                    onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Danger Zone */}
                                        <div className="space-y-4">
                                            <Label className="text-destructive">Danger Zone</Label>
                                            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium">Delete Document Type</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Once deleted, this action cannot be undone.
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setShowDeleteDialog(true)}
                                                    disabled={isSubmitting}
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
                </div>
            </TooltipProvider>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Document Type</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{documentType.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isSubmitting}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            type="button"
                        >
                            {isSubmitting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Document Type History</DialogTitle>
                        <DialogDescription>
                            Creation and modification details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Created</p>
                            <p className="text-sm text-muted-foreground">
                                {formatDate(documentType.created_at)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Last Updated</p>
                            <p className="text-sm text-muted-foreground">
                                {formatDate(documentType.updated_at)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">ID</p>
                            <p className="text-sm font-mono text-muted-foreground">
                                {documentType.id}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowHistory(false)} type="button">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
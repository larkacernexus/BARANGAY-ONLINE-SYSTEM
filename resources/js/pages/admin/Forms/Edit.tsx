// resources/js/Pages/Admin/Forms/Edit.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
    ArrowLeft,
    Save,
    Upload,
    FileText,
    Building,
    Eye,
    AlertCircle,
    CheckCircle,
    XCircle,
    Download,
    Trash2
} from 'lucide-react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PageProps } from '@/types';

// Reuse the same constants
const CATEGORIES = [
    'Social Services',
    'Permits & Licenses',
    'Health & Medical',
    'Education',
    'Legal & Police',
    'Employment',
    'Housing',
    'Other',
];

const AGENCIES = [
    'City Mayor\'s Office',
    'DSWD',
    'PNP',
    'SSS',
    'GSIS',
    'PhilHealth',
    'BIR',
    'DENR',
    'DOLE',
    'DepEd',
    'TESDA',
    'LGU',
    'Other',
];

interface FormData {
    title: string;
    description: string;
    category: string;
    issuing_agency: string;
    file?: File | null;  // Optional for edit
    is_active: boolean;
    // Keep track of existing file
    existing_file?: {
        name: string;
        size: string;
        path: string;
        type: string;
    };
}

interface EditFormProps extends PageProps {
    form: {
        id: number;
        title: string;
        description: string | null;
        category: string | null;
        issuing_agency: string | null;
        file_path: string;
        file_name: string;
        file_size: number;
        file_type: string;
        is_active: boolean;
        downloads: number;
        created_at: string;
        updated_at: string;
    };
}

export default function EditForm() {
    const { form } = usePage<EditFormProps>().props;
    
    // Define formatFileSize BEFORE it's used
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        title: form.title || '',
        description: form.description || '',
        category: form.category || '',
        issuing_agency: form.issuing_agency || '',
        file: null,  // New file (optional)
        is_active: form.is_active,
        existing_file: {
            name: form.file_name,
            size: formatFileSize(form.file_size),
            path: form.file_path,
            type: form.file_type,
        },
    });

    const [filePreview, setFilePreview] = useState<{
        name: string;
        size: string;
        type: string;
        isExisting: boolean;
    } | null>(
        // Show existing file as preview initially
        form.file_name ? {
            name: form.file_name,
            size: formatFileSize(form.file_size),
            type: form.file_type,
            isExisting: true,
        } : null
    );

    const [replaceFile, setReplaceFile] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('file', file);
        setReplaceFile(!!file);
        
        if (file) {
            setFilePreview({
                name: file.name,
                size: formatFileSize(file.size),
                type: file.type,
                isExisting: false,
            });
        } else if (!replaceFile && data.existing_file) {
            // Revert to existing file preview
            setFilePreview({
                name: data.existing_file.name,
                size: data.existing_file.size,
                type: data.existing_file.type,
                isExisting: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(`/admin/forms/${form.id}`, {
            forceFormData: true,  // Important for file upload
            preserveScroll: true,
            onSuccess: () => {
                // Optional: Show success message
            },
        });
    };

    const clearForm = () => {
        if (confirm('Reset all changes?')) {
            reset();
            setData({
                title: form.title || '',
                description: form.description || '',
                category: form.category || '',
                issuing_agency: form.issuing_agency || '',
                file: null,
                is_active: form.is_active,
                existing_file: {
                    name: form.file_name,
                    size: formatFileSize(form.file_size),
                    path: form.file_path,
                    type: form.file_type,
                },
            });
            setFilePreview({
                name: form.file_name,
                size: formatFileSize(form.file_size),
                type: form.file_type,
                isExisting: true,
            });
            setReplaceFile(false);
        }
    };

    const removeNewFile = () => {
        setData('file', null);
        setReplaceFile(false);
        setFilePreview({
            name: data.existing_file!.name,
            size: data.existing_file!.size,
            type: data.existing_file!.type,
            isExisting: true,
        });
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return '📄';
        if (type.includes('word') || type.includes('doc')) return '📝';
        if (type.includes('excel') || type.includes('sheet')) return '📊';
        if (type.includes('image')) return '🖼️';
        return '📎';
    };

    const isFormValid = () => {
        return data.title.trim() !== '' && (data.file !== null || data.existing_file !== null);
    };

    const requiredFields = ['title', 'file'];
    const completedRequired = requiredFields.filter(field => {
        if (field === 'file') return data.file !== null || data.existing_file !== null;
        if (field === 'title') return data.title.trim() !== '';
        return false;
    }).length;

    const progressPercentage = Math.round((completedRequired / requiredFields.length) * 100);

    return (
        <AppLayout
            title="Edit Form"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Forms', href: '/admin/forms' },
                { title: 'Edit Form', href: `/admin/forms/${form.id}/edit` }
            ]}
        >
            <div className="space-y-6">
                {/* Header - Different title and back link */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/forms">
                            <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:bg-gray-900">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Forms
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight dark:text-gray-100">Edit Form</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Update form details or replace file
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success Message - Optional */}
                {/* Add success message component if needed */}

                {/* Error Messages */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <p className="font-bold">Please fix the following errors:</p>
                        </div>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            {Object.entries(errors).map(([field, error]) => (
                                <li key={field}><strong>{field.replace('_', ' ')}:</strong> {error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Same UI structure */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information - Same component structure */}
                        <Card className="dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                    <FileText className="h-5 w-5" />
                                    Form Information
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Basic details about the form
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="dark:text-gray-300">
                                        Form Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        id="title" 
                                        placeholder="e.g., DSWD Medical Assistance Application Form"
                                        required 
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Descriptive title for the form
                                    </p>
                                    {errors.title && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="dark:text-gray-300">Description (Optional)</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Brief description of what this form is for..."
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                    />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Explain the purpose and usage of this form
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="dark:text-gray-300">Category (Optional)</Label>
                                        <Select 
                                            value={data.category || undefined}
                                            onValueChange={(value) => setData('category', value)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                <SelectValue placeholder="Select category">
                                                    {data.category || "Select category"}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                <SelectItem value="uncategorized" className="dark:text-gray-300 dark:focus:bg-gray-700">Uncategorized</SelectItem>
                                                {CATEGORIES.map((category) => (
                                                    <SelectItem key={category} value={category} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="issuing_agency" className="dark:text-gray-300">Issuing Agency (Optional)</Label>
                                        <Select 
                                            value={data.issuing_agency || undefined}
                                            onValueChange={(value) => setData('issuing_agency', value)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                                                <SelectValue placeholder="Select agency">
                                                    {data.issuing_agency || "Select agency"}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                                <SelectItem value="not_specified" className="dark:text-gray-300 dark:focus:bg-gray-700">Not specified</SelectItem>
                                                {AGENCIES.map((agency) => (
                                                    <SelectItem key={agency} value={agency} className="dark:text-gray-300 dark:focus:bg-gray-700">
                                                        <div className="flex items-center gap-2">
                                                            <Building className="h-4 w-4" />
                                                            {agency}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* File Upload - Modified for edit */}
                        <Card className="dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                    <Upload className="h-5 w-5" />
                                    File Upload
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    {replaceFile ? 'Replace existing file' : 'Current file shown below'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Show current file if not replacing */}
                                {!replaceFile && data.existing_file && (
                                    <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">
                                                    {getFileIcon(data.existing_file.type)}
                                                </div>
                                                <div>
                                                    <p className="font-medium dark:text-blue-300">Current File</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {data.existing_file.name} ({data.existing_file.size})
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(data.existing_file?.path, '_blank')}
                                                    className="dark:border-gray-600"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setReplaceFile(true)}
                                                    className="text-blue-600 dark:text-blue-400"
                                                >
                                                    Replace
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* File upload section - shown when replacing or if no existing file */}
                                {(replaceFile || !data.existing_file) && (
                                    <div className="space-y-2">
                                        <Label htmlFor="file" className="dark:text-gray-300">
                                            {data.existing_file ? 'New Form File' : 'Form File'} <span className="text-red-500">*</span>
                                        </Label>
                                        <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                                            data.file 
                                                ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/10' 
                                                : 'border-gray-300 dark:border-gray-700'
                                        }`}>
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium dark:text-gray-300">
                                                        {data.file ? 'File Selected' : 'Choose new file to upload'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        PDF, Word, Excel, or Image files up to 10MB
                                                    </p>
                                                </div>
                                                <Input
                                                    id="file"
                                                    name="file"
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                />
                                                <Button
                                                    type="button"
                                                    variant={data.file ? "outline" : "default"}
                                                    className="mt-4 dark:border-gray-600 dark:text-gray-300"
                                                    onClick={() => document.getElementById('file')?.click()}
                                                >
                                                    {data.file ? 'Change File' : 'Choose File'}
                                                </Button>
                                            </div>
                                        </div>
                                        {errors.file && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.file}</p>
                                        )}
                                    </div>
                                )}

                                {/* Preview for new file */}
                                {filePreview && filePreview.isExisting === false && (
                                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">
                                                    {getFileIcon(filePreview.type)}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">NEW FILE</p>
                                                    <p className="font-medium dark:text-gray-100">{filePreview.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {filePreview.size} • {filePreview.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={removeNewFile}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setReplaceFile(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-700 dark:text-blue-300">
                                            <p className="font-medium">Important Notes:</p>
                                            <ul className="list-disc list-inside mt-1 space-y-1">
                                                <li>Only upload forms from legitimate government agencies</li>
                                                <li>Ensure forms are the latest version</li>
                                                <li>Files should be readable and not corrupted</li>
                                                <li>Maximum file size: 10MB</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Modified for edit */}
                    <div className="space-y-6">
                        {/* Progress & Actions */}
                        <Card className="dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="dark:text-gray-100">Update Progress</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="dark:text-gray-400">Required fields</span>
                                        <span className="font-medium dark:text-gray-300">
                                            {completedRequired}/{requiredFields.length}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-300 ${
                                                progressPercentage === 100 ? 'bg-green-500 dark:bg-green-600' : 'bg-blue-500 dark:bg-blue-600'
                                            }`}
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active" className="dark:text-gray-300">Active Status</Label>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Visible to residents when active
                                            </p>
                                        </div>
                                        <Switch 
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => {
                                                setData('is_active', checked);
                                            }}
                                            className="dark:data-[state=checked]:bg-green-600"
                                        />
                                    </div>

                                    <div className="pt-4 border-t dark:border-gray-700">
                                        <Button 
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700"
                                            disabled={processing || !isFormValid()}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {processing ? 'Updating...' : 'Update Form'}
                                        </Button>
                                        
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            className="w-full mt-2 dark:border-gray-600 dark:text-gray-300"
                                            onClick={clearForm}
                                        >
                                            Reset Changes
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preview - Shows current data */}
                        <Card className="dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                    <Eye className="h-5 w-5" />
                                    Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded">
                                                {filePreview ? getFileIcon(filePreview.type) : '📎'}
                                            </div>
                                            <div>
                                                <p className="font-medium dark:text-gray-100">
                                                    {data.title || 'Form Title'}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {data.category && data.category !== 'uncategorized' && (
                                                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                                                            {data.category}
                                                        </span>
                                                    )}
                                                    {data.issuing_agency && data.issuing_agency !== 'not_specified' && (
                                                        <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded">
                                                            {data.issuing_agency}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {data.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-3">
                                                {data.description}
                                            </p>
                                        )}
                                        
                                        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Downloads: {form.downloads || 0}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                data.is_active 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                            }`}>
                                                {data.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        
                                        {/* Show last updated */}
                                        <div className="text-xs text-gray-400 dark:text-gray-500 text-right">
                                            Last updated: {new Date(form.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Requirements Checklist - Modified for edit */}
                        <Card className="dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="text-sm dark:text-gray-100">Requirements Checklist</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {data.title ? (
                                                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                                            )}
                                            <span className="dark:text-gray-300">Form Title</span>
                                        </div>
                                        <span className={`font-medium ${data.title ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {data.title ? '✓' : 'Required'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {data.file || data.existing_file ? (
                                                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                                            )}
                                            <span className="dark:text-gray-300">File Uploaded</span>
                                        </div>
                                        <span className={`font-medium ${data.file || data.existing_file ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {(data.file || data.existing_file) ? '✓' : 'Required'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {data.file ? (
                                                data.file.size <= 10 * 1024 * 1024 ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                                                )
                                            ) : data.existing_file ? (
                                                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                                            ) : (
                                                <div className="h-4 w-4" />
                                            )}
                                            <span className="dark:text-gray-300">File size ≤ 10MB</span>
                                        </div>
                                        <span className={`font-medium ${
                                            data.file 
                                                ? (data.file.size <= 10 * 1024 * 1024 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
                                                : data.existing_file
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-gray-400 dark:text-gray-500'
                                        }`}>
                                            {data.file 
                                                ? formatFileSize(data.file.size)
                                                : data.existing_file 
                                                ? data.existing_file.size
                                                : '-'}
                                        </span>
                                    </div>
                                    
                                    <div className="pt-3 border-t dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                                        <p className="font-medium mb-1">Supported file types:</p>
                                        <div className="grid grid-cols-2 gap-1">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded">PDF (.pdf)</span>
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded">Word (.doc/.docx)</span>
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded">Excel (.xls/.xlsx)</span>
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded">Images (.jpg/.png)</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
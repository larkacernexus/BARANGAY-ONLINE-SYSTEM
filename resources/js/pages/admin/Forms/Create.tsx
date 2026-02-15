// resources/js/Pages/Admin/Forms/Create.tsx
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
    XCircle
} from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps } from '@/types';

// Define categories and agencies as constants (matching the Model)
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
    file: File | null;
    is_active: boolean;
}

interface CreateFormProps extends PageProps {
    // No props needed since we're using constants
}

export default function CreateForm() {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        title: '',
        description: '',
        category: '',
        issuing_agency: '',
        file: null,
        is_active: true,
    });

    const [filePreview, setFilePreview] = useState<{
        name: string;
        size: string;
        type: string;
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('file', file);
        
        if (file) {
            setFilePreview({
                name: file.name,
                size: formatFileSize(file.size),
                type: file.type,
            });
        } else {
            setFilePreview(null);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.file) {
            alert('Please select a file to upload');
            return;
        }

        post('/forms', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setFilePreview(null);
            },
        });
    };

    const clearForm = () => {
        // Reset to initial values using type assertion
        reset({
            title: '',
            description: '',
            category: '',
            issuing_agency: '',
            file: null,
            is_active: true,
        } as any);
        setFilePreview(null);
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return '📄';
        if (type.includes('word') || type.includes('doc')) return '📝';
        if (type.includes('excel') || type.includes('sheet')) return '📊';
        if (type.includes('image')) return '🖼️';
        return '📎';
    };

    const isFormValid = () => {
        return data.title.trim() !== '' && data.file !== null;
    };

    // Calculate progress
    const requiredFields = ['title', 'file'];
    const completedRequired = requiredFields.filter(field => {
        if (field === 'file') return data.file !== null;
        // Type-safe access to data fields
        if (field === 'title') return data.title.trim() !== '';
        return false;
    }).length;

    const progressPercentage = Math.round((completedRequired / requiredFields.length) * 100);

    // Handle category change with null instead of empty string
    const handleCategoryChange = (value: string) => {
        setData('category', value);
    };

    // Handle agency change with null instead of empty string
    const handleAgencyChange = (value: string) => {
        setData('issuing_agency', value);
    };

    return (
        <AppLayout
            title="Upload New Form"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Forms', href: '/forms' },
                { title: 'Upload New Form', href: '/forms/create' }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/forms">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Forms
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Upload New Form</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Add downloadable forms for residents
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Messages */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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
                    {/* Left Column - Form Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Form Information
                                </CardTitle>
                                <CardDescription>
                                    Basic details about the form
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Form Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        id="title" 
                                        placeholder="e.g., DSWD Medical Assistance Application Form"
                                        required 
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                    <p className="text-sm text-gray-500">
                                        Descriptive title for the form
                                    </p>
                                    {errors.title && (
                                        <p className="text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Brief description of what this form is for..."
                                        rows={4}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <p className="text-sm text-gray-500">
                                        Explain the purpose and usage of this form
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category (Optional)</Label>
                                        <Select 
                                            value={data.category || undefined}
                                            onValueChange={handleCategoryChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category">
                                                    {data.category || "Select category"}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                                                {CATEGORIES.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="issuing_agency">Issuing Agency (Optional)</Label>
                                        <Select 
                                            value={data.issuing_agency || undefined}
                                            onValueChange={handleAgencyChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select agency">
                                                    {data.issuing_agency || "Select agency"}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="not_specified">Not specified</SelectItem>
                                                {AGENCIES.map((agency) => (
                                                    <SelectItem key={agency} value={agency}>
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

                        {/* File Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5" />
                                    File Upload
                                </CardTitle>
                                <CardDescription>
                                    Upload the form file (PDF, Word, Excel, or Image)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="file">
                                        Form File <span className="text-red-500">*</span>
                                    </Label>
                                    <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                                        data.file 
                                            ? 'border-green-300 bg-green-50 dark:bg-green-900/10' 
                                            : 'border-gray-300 dark:border-gray-700'
                                    }`}>
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <Upload className="h-12 w-12 text-gray-400 mb-4" />
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">
                                                    {data.file ? 'File Selected' : 'Upload form file'}
                                                </p>
                                                <p className="text-xs text-gray-500">
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
                                                className="mt-4"
                                                onClick={() => document.getElementById('file')?.click()}
                                            >
                                                {data.file ? 'Change File' : 'Choose File'}
                                            </Button>
                                        </div>
                                    </div>
                                    {errors.file && (
                                        <p className="text-sm text-red-600">{errors.file}</p>
                                    )}
                                </div>

                                {filePreview && (
                                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">
                                                    {getFileIcon(filePreview.type)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{filePreview.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {filePreview.size} • {filePreview.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setData('file', null);
                                                    setFilePreview(null);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
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

                    {/* Right Column - Preview & Actions */}
                    <div className="space-y-6">
                        {/* Progress & Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Progress</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Required fields</span>
                                        <span className="font-medium">
                                            {completedRequired}/{requiredFields.length}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-300 ${
                                                progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                                            }`}
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active">Active Status</Label>
                                            <p className="text-sm text-gray-500">
                                                Visible to residents when active
                                            </p>
                                        </div>
                                        <Switch 
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => {
                                                setData('is_active', checked);
                                            }}
                                        />
                                    </div>

                                    <div className="pt-4 border-t">
                                        <Button 
                                            type="submit"
                                            className="w-full"
                                            disabled={processing || !isFormValid()}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {processing ? 'Uploading...' : 'Upload Form'}
                                        </Button>
                                        
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            className="w-full mt-2"
                                            onClick={clearForm}
                                        >
                                            Clear Form
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                                {filePreview ? getFileIcon(filePreview.type) : '📎'}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {data.title || 'Form Title'}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {data.category && data.category !== 'uncategorized' && (
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            {data.category}
                                                        </span>
                                                    )}
                                                    {data.issuing_agency && data.issuing_agency !== 'not_specified' && (
                                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                            {data.issuing_agency}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {data.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 border-t pt-3">
                                                {data.description}
                                            </p>
                                        )}
                                        
                                        <div className="flex items-center justify-between pt-3 border-t">
                                            <span className="text-xs text-gray-500">
                                                Downloads: 0
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                data.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {data.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Requirements Checklist */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Requirements Checklist</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {data.title ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-gray-300" />
                                            )}
                                            <span>Form Title</span>
                                        </div>
                                        <span className={`font-medium ${data.title ? 'text-green-600' : 'text-gray-400'}`}>
                                            {data.title ? '✓' : 'Required'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {data.file ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-gray-300" />
                                            )}
                                            <span>File Uploaded</span>
                                        </div>
                                        <span className={`font-medium ${data.file ? 'text-green-600' : 'text-red-600'}`}>
                                            {data.file ? '✓' : 'Required'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {data.file && data.file.size <= 10 * 1024 * 1024 ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : data.file ? (
                                                <XCircle className="h-4 w-4 text-red-500" />
                                            ) : (
                                                <div className="h-4 w-4" />
                                            )}
                                            <span>File size ≤ 10MB</span>
                                        </div>
                                        <span className={`font-medium ${
                                            data.file 
                                                ? (data.file.size <= 10 * 1024 * 1024 ? 'text-green-600' : 'text-red-600')
                                                : 'text-gray-400'
                                        }`}>
                                            {data.file ? formatFileSize(data.file.size) : '-'}
                                        </span>
                                    </div>
                                    
                                    <div className="pt-3 border-t text-xs text-gray-500">
                                        <p className="font-medium mb-1">Supported file types:</p>
                                        <div className="grid grid-cols-2 gap-1">
                                            <span className="px-2 py-1 bg-gray-100 rounded">PDF (.pdf)</span>
                                            <span className="px-2 py-1 bg-gray-100 rounded">Word (.doc/.docx)</span>
                                            <span className="px-2 py-1 bg-gray-100 rounded">Excel (.xls/.xlsx)</span>
                                            <span className="px-2 py-1 bg-gray-100 rounded">Images (.jpg/.png)</span>
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
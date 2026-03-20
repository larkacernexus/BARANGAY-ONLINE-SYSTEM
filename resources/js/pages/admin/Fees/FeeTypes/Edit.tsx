// pages/admin/fee-types/[id]/edit.tsx

import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft,
    Save,
    DollarSign,
    Calendar,
    Percent,
    FileText,
    Tag,
    Users,
    Clock,
    Hash,
    Sparkles,
    Copy,
    RefreshCw,
    Info,
    AlertCircle,
    Trash2,
    X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FeeTypesEditProps {
    feeType: {
        id: number;
        code: string;
        name: string;
        short_name: string | null;
        category: string;
        base_amount: number;
        amount_type: string;
        unit: string | null;
        description: string | null;
        frequency: string;
        validity_days: number | null;
        applicable_to: string;
        applicable_puroks: any; // Could be array or string
        requirements: any; // Could be array or string
        effective_date: string;
        expiry_date: string | null;
        is_active: boolean;
        is_mandatory: boolean;
        auto_generate: boolean;
        due_day: number | null;
        sort_order: number;
        
        // Discount fields
        has_senior_discount: boolean;
        senior_discount_percentage: number | null;
        
        has_pwd_discount: boolean;
        pwd_discount_percentage: number | null;
        
        has_solo_parent_discount: boolean;
        solo_parent_discount_percentage: number | null;
        
        has_indigent_discount: boolean;
        indigent_discount_percentage: number | null;
        
        // Late payment fields
        has_surcharge: boolean;
        surcharge_percentage: number | null;
        surcharge_fixed: number | null;
        has_penalty: boolean;
        penalty_percentage: number | null;
        penalty_fixed: number | null;
        notes: string | null;
    };
    categories?: Record<string, string>;
    amountTypes?: Record<string, string>;
    frequencies?: Record<string, string>;
    applicableTo?: Record<string, string>;
    puroks?: string[];
    errors?: Record<string, string>;
}

interface FeeFormData {
    code: string;
    name: string;
    short_name: string;
    category: string;
    base_amount: number;
    amount_type: string;
    unit: string;
    description: string;
    frequency: string;
    validity_days: number | null;
    applicable_to: string;
    applicable_puroks: string[];
    requirements: string[];
    effective_date: string;
    expiry_date: string;
    is_active: boolean;
    is_mandatory: boolean;
    auto_generate: boolean;
    due_day: number | null;
    sort_order: number;
    
    // Separate discount fields for each type
    has_senior_discount: boolean;
    senior_discount_percentage: number | null;
    
    has_pwd_discount: boolean;
    pwd_discount_percentage: number | null;
    
    has_solo_parent_discount: boolean;
    solo_parent_discount_percentage: number | null;
    
    has_indigent_discount: boolean;
    indigent_discount_percentage: number | null;
    
    has_surcharge: boolean;
    surcharge_percentage: number | null;
    surcharge_fixed: number | null;
    has_penalty: boolean;
    penalty_percentage: number | null;
    penalty_fixed: number | null;
    notes: string;
}

// Philippine standard discount rates
const PHILIPPINE_STANDARD_DISCOUNTS = {
    senior: 20,
    pwd: 20,
    solo_parent: 10,
    indigent: 50
};

// Generate a fee code based on category and name
function generateFeeCode(name: string, category: string): string {
    const categoryPrefixes: Record<string, string> = {
        'tax': 'TAX',
        'clearance': 'CLR',
        'certificate': 'CERT',
        'service': 'SVC',
        'rental': 'RNT',
        'fine': 'FINE'
    };
    
    const prefix = categoryPrefixes[category] || 'FEE';
    
    // Get initials from name
    const nameInitials = name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3);
    
    // Add timestamp
    const timestamp = Date.now().toString().slice(-4);
    
    return `${prefix}-${nameInitials}-${timestamp}`;
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(dateString: string | null | undefined): string {
    if (!dateString) return '';
    
    try {
        // If it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        // Parse the date - handle different formats
        let date: Date;
        
        // Try to parse as ISO string
        if (dateString.includes('T')) {
            date = new Date(dateString);
        } else if (dateString.includes(' ')) {
            // Handle "YYYY-MM-DD HH:MM:SS" format
            const datePart = dateString.split(' ')[0];
            date = new Date(datePart);
        } else {
            // Try direct parsing
            date = new Date(dateString);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date:', dateString);
            return '';
        }
        
        // Format to YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
}

// Helper function to safely parse array data - FIXED for the json_decode error
function parseArrayData(data: any): string[] {
    if (!data) return [];
    
    // If it's already an array, return it
    if (Array.isArray(data)) {
        return data;
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            // If it's not JSON, treat as comma-separated string
            if (data.includes(',')) {
                return data.split(',').map(item => item.trim()).filter(item => item);
            }
            // Otherwise, return empty array
            return [];
        }
    }
    
    return [];
}

export default function FeeTypesEdit({ 
    feeType,
    categories = {}, 
    amountTypes = {}, 
    frequencies = {}, 
    applicableTo = {}, 
    puroks = [],
    errors: serverErrors = {}
}: FeeTypesEditProps) {
    // Safely parse array data from backend - FIXED for the json_decode error
    const initialPuroks = parseArrayData(feeType?.applicable_puroks);
    const initialRequirements = parseArrayData(feeType?.requirements);
    
    const [selectedPuroks, setSelectedPuroks] = useState<string[]>(initialPuroks);
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>(initialRequirements);
    const [newRequirement, setNewRequirement] = useState('');
    const [autoGenerateCode, setAutoGenerateCode] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [showDiscountInfo, setShowDiscountInfo] = useState<boolean>(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    
    // Format dates for the form
    const formattedEffectiveDate = formatDateForInput(feeType?.effective_date);
    const formattedExpiryDate = formatDateForInput(feeType?.expiry_date);
    
    const { data, setData, put, processing, delete: destroy } = useForm<FeeFormData>({
        code: feeType?.code || '',
        name: feeType?.name || '',
        short_name: feeType?.short_name || '',
        category: feeType?.category || '',
        base_amount: Number(feeType?.base_amount) || 0,
        amount_type: feeType?.amount_type || '',
        unit: feeType?.unit || '',
        description: feeType?.description || '',
        frequency: feeType?.frequency || '',
        validity_days: feeType?.validity_days || null,
        applicable_to: feeType?.applicable_to || '',
        applicable_puroks: initialPuroks,
        requirements: initialRequirements,
        effective_date: formattedEffectiveDate || new Date().toISOString().split('T')[0],
        expiry_date: formattedExpiryDate || '',
        is_active: feeType?.is_active ?? true,
        is_mandatory: feeType?.is_mandatory ?? false,
        auto_generate: feeType?.auto_generate ?? false,
        due_day: feeType?.due_day || null,
        sort_order: Number(feeType?.sort_order) || 0,
        
        // Discounts with default values
        has_senior_discount: feeType?.has_senior_discount ?? false,
        senior_discount_percentage: feeType?.senior_discount_percentage || PHILIPPINE_STANDARD_DISCOUNTS.senior,
        
        has_pwd_discount: feeType?.has_pwd_discount ?? false,
        pwd_discount_percentage: feeType?.pwd_discount_percentage || PHILIPPINE_STANDARD_DISCOUNTS.pwd,
        
        has_solo_parent_discount: feeType?.has_solo_parent_discount ?? false,
        solo_parent_discount_percentage: feeType?.solo_parent_discount_percentage || PHILIPPINE_STANDARD_DISCOUNTS.solo_parent,
        
        has_indigent_discount: feeType?.has_indigent_discount ?? false,
        indigent_discount_percentage: feeType?.indigent_discount_percentage || PHILIPPINE_STANDARD_DISCOUNTS.indigent,
        
        // Late payment
        has_surcharge: feeType?.has_surcharge ?? false,
        surcharge_percentage: feeType?.surcharge_percentage || null,
        surcharge_fixed: feeType?.surcharge_fixed || null,
        has_penalty: feeType?.has_penalty ?? false,
        penalty_percentage: feeType?.penalty_percentage || null,
        penalty_fixed: feeType?.penalty_fixed || null,
        notes: feeType?.notes || '',
    });

    // Combine server and validation errors
    const errors = { ...serverErrors, ...validationErrors };

    // Auto-generate code when name or category changes (only if auto-generate is enabled)
    useEffect(() => {
        if (autoGenerateCode && data.name?.trim() && data.category) {
            const generatedCode = generateFeeCode(data.name, data.category);
            setData('code', generatedCode);
        }
    }, [data.name, data.category, autoGenerateCode, setData]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        const newErrors: Record<string, string> = {};
        
        if (!data.code?.trim()) {
            newErrors.code = 'Code is required';
        }
        if (!data.name?.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!data.category) {
            newErrors.category = 'Category is required';
        }
        if (!data.base_amount || data.base_amount < 0) {
            newErrors.base_amount = 'Base amount must be a positive number';
        }
        if (!data.amount_type) {
            newErrors.amount_type = 'Amount type is required';
        }
        if (!data.frequency) {
            newErrors.frequency = 'Frequency is required';
        }
        if (!data.applicable_to) {
            newErrors.applicable_to = 'Applicability is required';
        }
        if (data.applicable_to === 'specific_purok' && selectedPuroks.length === 0) {
            newErrors.applicable_puroks = 'Please select at least one purok';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            return;
        }
        
        // If code is empty but auto-generation is on, generate one
        if (!data.code.trim() && autoGenerateCode) {
            const generatedCode = generateFeeCode(data.name || 'New Fee', data.category);
            setData('code', generatedCode);
        }
        
        put(`/admin/fee-types/${feeType.id}`);
    };

    const handleDelete = () => {
        destroy(`/admin/fee-types/${feeType.id}`, {
            onSuccess: () => {
                // Redirect happens in the controller
                window.location.href = '/admin/fee-types';
            },
        });
    };

    const handleGenerateCode = () => {
        setIsGenerating(true);
        const generatedCode = generateFeeCode(data.name || feeType.name, data.category || feeType.category);
        setData('code', generatedCode);
        
        setTimeout(() => setIsGenerating(false), 500);
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(data.code);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const addRequirement = () => {
        if (newRequirement.trim()) {
            const updatedRequirements = [...selectedRequirements, newRequirement.trim()];
            setSelectedRequirements(updatedRequirements);
            setData('requirements', updatedRequirements);
            setNewRequirement('');
        }
    };

    const removeRequirement = (index: number) => {
        const newRequirements = selectedRequirements.filter((_, i) => i !== index);
        setSelectedRequirements(newRequirements);
        setData('requirements', newRequirements);
    };

    const handlePurokChange = (purok: string, checked: boolean) => {
        let newPuroks: string[];
        if (checked) {
            newPuroks = [...selectedPuroks, purok];
        } else {
            newPuroks = selectedPuroks.filter(p => p !== purok);
        }
        setSelectedPuroks(newPuroks);
        setData('applicable_puroks', newPuroks);
        
        // Clear validation error if any
        if (newPuroks.length > 0 && validationErrors.applicable_puroks) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.applicable_puroks;
                return newErrors;
            });
        }
    };

    // Discount handlers
    const handleSeniorDiscountChange = (checked: boolean) => {
        setData('has_senior_discount', checked);
        if (checked) {
            setData('senior_discount_percentage', data.senior_discount_percentage || PHILIPPINE_STANDARD_DISCOUNTS.senior);
        } else {
            setData('senior_discount_percentage', null);
        }
    };

    const handlePwdDiscountChange = (checked: boolean) => {
        setData('has_pwd_discount', checked);
        if (checked) {
            setData('pwd_discount_percentage', data.pwd_discount_percentage || PHILIPPINE_STANDARD_DISCOUNTS.pwd);
        } else {
            setData('pwd_discount_percentage', null);
        }
    };

    const handleSoloParentDiscountChange = (checked: boolean) => {
        setData('has_solo_parent_discount', checked);
        if (checked) {
            setData('solo_parent_discount_percentage', data.solo_parent_discount_percentage || PHILIPPINE_STANDARD_DISCOUNTS.solo_parent);
        } else {
            setData('solo_parent_discount_percentage', null);
        }
    };

    const handleIndigentDiscountChange = (checked: boolean) => {
        setData('has_indigent_discount', checked);
        if (checked) {
            setData('indigent_discount_percentage', data.indigent_discount_percentage || PHILIPPINE_STANDARD_DISCOUNTS.indigent);
        } else {
            setData('indigent_discount_percentage', null);
        }
    };

    const safeCategories = categories || {};
    const safeAmountTypes = amountTypes || {};
    const safeFrequencies = frequencies || {};
    const safeApplicableTo = applicableTo || {};

    // If no feeType, show loading
    if (!feeType) {
        return (
            <AppLayout
                title="Edit Fee Type"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/admin/dashboard' },
                    { title: 'Fee Types', href: '/admin/fee-types' },
                    { title: 'Edit', href: '#' }
                ]}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-white mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading fee type...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title={`Edit Fee Type: ${feeType.name}`}
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Fee Types', href: '/admin/fee-types' },
                { title: `Edit: ${feeType.name}`, href: `/admin/fee-types/${feeType.id}/edit` }
            ]}
        >
            <Head title={`Edit Fee Type: ${feeType.name}`} />
            
            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/fee-types">
                                <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight dark:text-white">Edit Fee Type</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Code: {feeType.code}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setShowDeleteDialog(true)}
                                disabled={processing}
                                className="dark:bg-red-900 dark:hover:bg-red-800"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                            <Button type="submit" disabled={processing} className="dark:bg-blue-600 dark:hover:bg-blue-700">
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Update Fee Type'}
                            </Button>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive" className="dark:bg-red-950 dark:border-red-800">
                            <AlertCircle className="h-4 w-4 dark:text-red-400" />
                            <AlertDescription className="dark:text-red-400">
                                <div className="font-medium mb-1">Please fix the following errors:</div>
                                <ul className="list-disc pl-4 space-y-1">
                                    {Object.entries(errors).map(([field, message]) => (
                                        <li key={field}>{message}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Basic Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <FileText className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Edit basic details about the fee type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Code Field */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="code" className={`${errors.code ? 'text-red-500 dark:text-red-400' : 'dark:text-gray-300'}`}>
                                                    Code *
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={autoGenerateCode}
                                                        onCheckedChange={setAutoGenerateCode}
                                                        id="auto-generate-code"
                                                        className="dark:data-[state=checked]:bg-blue-600"
                                                    />
                                                    <Label htmlFor="auto-generate-code" className="text-xs cursor-pointer dark:text-gray-400">
                                                        Auto
                                                    </Label>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <Input
                                                    id="code"
                                                    required
                                                    value={data.code}
                                                    onChange={(e) => {
                                                        setData('code', e.target.value.toUpperCase());
                                                        if (validationErrors.code) {
                                                            setValidationErrors(prev => {
                                                                const newErrors = { ...prev };
                                                                delete newErrors.code;
                                                                return newErrors;
                                                            });
                                                        }
                                                    }}
                                                    placeholder="e.g., TAX-BRT-1234"
                                                    className={`pl-10 pr-24 ${errors.code ? 'border-red-500 dark:border-red-800' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                                    disabled={autoGenerateCode}
                                                />
                                                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleCopyCode}
                                                        disabled={!data.code}
                                                        className="h-7 w-7 p-0 dark:text-gray-400 dark:hover:text-white"
                                                        title="Copy code"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleGenerateCode}
                                                        disabled={autoGenerateCode}
                                                        className="h-7 w-7 p-0 dark:text-gray-400 dark:hover:text-white"
                                                        title="Generate new code"
                                                    >
                                                        <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                                                    </Button>
                                                </div>
                                            </div>
                                            {errors.code && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.code}</p>
                                            )}
                                            {autoGenerateCode && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" />
                                                    Code will be auto-generated based on name and category
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name" className={`${errors.name ? 'text-red-500 dark:text-red-400' : 'dark:text-gray-300'}`}>
                                                Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                required
                                                value={data.name}
                                                onChange={(e) => {
                                                    setData('name', e.target.value);
                                                    if (validationErrors.name) {
                                                        setValidationErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors.name;
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                                placeholder="e.g., Barangay Tax, Business Clearance"
                                                className={`${errors.name ? 'border-red-500 dark:border-red-800' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.name}</p>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="short_name" className="dark:text-gray-300">Short Name</Label>
                                            <Input
                                                id="short_name"
                                                value={data.short_name}
                                                onChange={(e) => setData('short_name', e.target.value)}
                                                placeholder="e.g., Tax, Clearance"
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="category" className={`${errors.category ? 'text-red-500 dark:text-red-400' : 'dark:text-gray-300'}`}>
                                                Category *
                                            </Label>
                                            <select
                                                id="category"
                                                required
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                                    errors.category ? 'border-red-500 dark:border-red-800' : 'dark:border-gray-700'
                                                } dark:bg-gray-900 dark:text-white`}
                                                value={data.category}
                                                onChange={(e) => {
                                                    setData('category', e.target.value);
                                                    if (validationErrors.category) {
                                                        setValidationErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors.category;
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                            >
                                                <option value="">Select a category</option>
                                                {Object.entries(safeCategories).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.category && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.category}</p>
                                            )}
                                        </div>
                                        
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                                            <Textarea
                                                id="description"
                                                rows={3}
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Description of this fee type..."
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <DollarSign className="h-5 w-5" />
                                        Pricing
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Edit pricing details for the fee
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="base_amount" className={`${errors.base_amount ? 'text-red-500 dark:text-red-400' : 'dark:text-gray-300'}`}>
                                                Base Amount *
                                            </Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <Input
                                                    id="base_amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                    className={`pl-10 ${errors.base_amount ? 'border-red-500 dark:border-red-800' : ''} dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                                                    value={data.base_amount}
                                                    onChange={(e) => {
                                                        setData('base_amount', parseFloat(e.target.value) || 0);
                                                        if (validationErrors.base_amount) {
                                                            setValidationErrors(prev => {
                                                                const newErrors = { ...prev };
                                                                delete newErrors.base_amount;
                                                                return newErrors;
                                                            });
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {errors.base_amount && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.base_amount}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amount_type" className={`${errors.amount_type ? 'text-red-500 dark:text-red-400' : 'dark:text-gray-300'}`}>
                                                Amount Type *
                                            </Label>
                                            <select
                                                id="amount_type"
                                                required
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                                    errors.amount_type ? 'border-red-500 dark:border-red-800' : 'dark:border-gray-700'
                                                } dark:bg-gray-900 dark:text-white`}
                                                value={data.amount_type}
                                                onChange={(e) => {
                                                    setData('amount_type', e.target.value);
                                                    if (validationErrors.amount_type) {
                                                        setValidationErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors.amount_type;
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                            >
                                                <option value="">Select amount type</option>
                                                {Object.entries(safeAmountTypes).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.amount_type && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.amount_type}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="unit" className="dark:text-gray-300">Unit (Optional)</Label>
                                            <Input
                                                id="unit"
                                                placeholder="e.g., per square meter, per month"
                                                value={data.unit}
                                                onChange={(e) => setData('unit', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Frequency & Validity */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Calendar className="h-5 w-5" />
                                        Frequency & Validity
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Edit how often this fee is charged and its validity period
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="frequency" className={`${errors.frequency ? 'text-red-500 dark:text-red-400' : 'dark:text-gray-300'}`}>
                                                Frequency *
                                            </Label>
                                            <select
                                                id="frequency"
                                                required
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                                    errors.frequency ? 'border-red-500 dark:border-red-800' : 'dark:border-gray-700'
                                                } dark:bg-gray-900 dark:text-white`}
                                                value={data.frequency}
                                                onChange={(e) => {
                                                    setData('frequency', e.target.value);
                                                    if (validationErrors.frequency) {
                                                        setValidationErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors.frequency;
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                            >
                                                <option value="">Select frequency</option>
                                                {Object.entries(safeFrequencies).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.frequency && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.frequency}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="validity_days" className="dark:text-gray-300">Validity Days (for certificates)</Label>
                                            <Input
                                                id="validity_days"
                                                type="number"
                                                min="1"
                                                value={data.validity_days || ''}
                                                onChange={(e) => setData('validity_days', e.target.value ? parseInt(e.target.value) : null)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="effective_date" className="dark:text-gray-300">Effective Date *</Label>
                                            <Input
                                                id="effective_date"
                                                type="date"
                                                required
                                                value={data.effective_date}
                                                onChange={(e) => setData('effective_date', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry_date" className="dark:text-gray-300">Expiry Date (Optional)</Label>
                                            <Input
                                                id="expiry_date"
                                                type="date"
                                                value={data.expiry_date}
                                                onChange={(e) => setData('expiry_date', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Settings */}
                        <div className="space-y-6">
                            {/* Applicability */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Users className="h-5 w-5" />
                                        Applicability
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Edit who this fee applies to
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="applicable_to" className={`${errors.applicable_to ? 'text-red-500 dark:text-red-400' : 'dark:text-gray-300'}`}>
                                            Applicable To *
                                        </Label>
                                        <select
                                            id="applicable_to"
                                            required
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                                errors.applicable_to ? 'border-red-500 dark:border-red-800' : 'dark:border-gray-700'
                                            } dark:bg-gray-900 dark:text-white`}
                                            value={data.applicable_to}
                                            onChange={(e) => {
                                                setData('applicable_to', e.target.value);
                                                if (e.target.value !== 'specific_purok') {
                                                    setSelectedPuroks([]);
                                                    setData('applicable_puroks', []);
                                                }
                                                if (validationErrors.applicable_to) {
                                                    setValidationErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.applicable_to;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                        >
                                            <option value="">Select applicability</option>
                                            {Object.entries(safeApplicableTo).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.applicable_to && (
                                            <p className="text-sm text-red-500 dark:text-red-400">{errors.applicable_to}</p>
                                        )}
                                    </div>
                                    
                                    {data.applicable_to === 'specific_purok' && (
                                        <div className="space-y-2">
                                            <Label className={`${errors.applicable_puroks ? 'text-red-500 dark:text-red-400' : 'dark:text-gray-300'}`}>
                                                Select Puroks *
                                            </Label>
                                            <div className={`space-y-2 max-h-60 overflow-y-auto p-3 border rounded-md ${
                                                errors.applicable_puroks ? 'border-red-500 dark:border-red-800' : 'dark:border-gray-700'
                                            } dark:bg-gray-900`}>
                                                {puroks.map((purok, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`purok-${index}`}
                                                            checked={selectedPuroks.includes(purok)}
                                                            onCheckedChange={(checked) => 
                                                                handlePurokChange(purok, checked as boolean)
                                                            }
                                                            className="dark:border-gray-600"
                                                        />
                                                        <Label 
                                                            htmlFor={`purok-${index}`}
                                                            className="text-sm cursor-pointer dark:text-gray-300"
                                                        >
                                                            {purok}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.applicable_puroks && (
                                                <p className="text-sm text-red-500 dark:text-red-400">{errors.applicable_puroks}</p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Requirements */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Tag className="h-5 w-5" />
                                        Requirements
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Edit requirements for this fee
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-requirement" className="dark:text-gray-300">Add Requirements</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="new-requirement"
                                                placeholder="e.g., Valid ID, Proof of Residency"
                                                value={newRequirement}
                                                onChange={(e) => setNewRequirement(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addRequirement();
                                                    }
                                                }}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={addRequirement}
                                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="dark:text-gray-300">Selected Requirements</Label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {Array.isArray(selectedRequirements) && selectedRequirements.map((req, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                                    <span className="text-sm dark:text-gray-300">{req}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeRequirement(index)}
                                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                            ))}
                                            {(!Array.isArray(selectedRequirements) || selectedRequirements.length === 0) && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No requirements added</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status & Settings */}
                            <Card className="dark:bg-gray-900 dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-white">
                                        <Clock className="h-5 w-5" />
                                        Status & Settings
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Edit fee status and behavior
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="is_active" className="dark:text-gray-300">Active</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_mandatory"
                                                checked={data.is_mandatory}
                                                onCheckedChange={(checked) => setData('is_mandatory', checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="is_mandatory" className="dark:text-gray-300">Mandatory</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="auto_generate"
                                                checked={data.auto_generate}
                                                onCheckedChange={(checked) => setData('auto_generate', checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="auto_generate" className="dark:text-gray-300">Auto-generate bills</Label>
                                        </div>
                                        {data.auto_generate && (
                                            <div className="space-y-2 pl-6">
                                                <Label htmlFor="due_day" className="dark:text-gray-300">Due Day of Month</Label>
                                                <Input
                                                    id="due_day"
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={data.due_day || ''}
                                                    onChange={(e) => setData('due_day', e.target.value ? parseInt(e.target.value) : null)}
                                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label htmlFor="sort_order" className="dark:text-gray-300">Sort Order</Label>
                                            <Input
                                                id="sort_order"
                                                type="number"
                                                value={data.sort_order}
                                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Discounts Configuration */}
                    <Card className="dark:bg-gray-900 dark:border-gray-700">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="dark:text-white">Discount Configuration</CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Configure different discounts for eligible groups
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDiscountInfo(!showDiscountInfo)}
                                    className="dark:text-gray-400 dark:hover:text-white"
                                >
                                    <Info className="h-4 w-4 mr-1" />
                                    Philippine Guidelines
                                </Button>
                            </div>
                        </CardHeader>
                        
                        {showDiscountInfo && (
                            <div className="px-6 pb-4">
                                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                                    <AlertCircle className="h-4 w-4 dark:text-blue-400" />
                                    <AlertDescription className="text-sm dark:text-blue-300">
                                        <div className="space-y-2">
                                            <p><strong className="dark:text-blue-200">Philippine Discount Rules:</strong></p>
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li><strong>Senior Citizens (RA 9994):</strong> 20% discount mandated</li>
                                                <li><strong>PWD (RA 10754):</strong> 20% discount mandated</li>
                                                <li><strong>Solo Parents (RA 8972):</strong> Typically 10% discount</li>
                                                <li><strong>Indigents:</strong> Varies (50-100% depending on LGU)</li>
                                                <li><strong>Important:</strong> Only highest applicable discount applies</li>
                                            </ul>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                        
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Senior Citizen Discount */}
                                <div className="space-y-4 border rounded-lg p-4 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="has_senior_discount"
                                                checked={data.has_senior_discount}
                                                onCheckedChange={(checked) => handleSeniorDiscountChange(checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <div>
                                                <Label htmlFor="has_senior_discount" className="font-medium dark:text-white">
                                                    Senior Citizen Discount
                                                </Label>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">RA 9994</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800">
                                            Mandatory 20%
                                        </Badge>
                                    </div>
                                    
                                    {data.has_senior_discount && (
                                        <div className="pl-6 space-y-2">
                                            <Label htmlFor="senior_discount_percentage" className="dark:text-gray-300">Discount Percentage</Label>
                                            <div className="relative">
                                                <Input
                                                    id="senior_discount_percentage"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    value={data.senior_discount_percentage || ''}
                                                    onChange={(e) => setData('senior_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                />
                                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Philippine law mandates 20% for senior citizens
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* PWD Discount */}
                                <div className="space-y-4 border rounded-lg p-4 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="has_pwd_discount"
                                                checked={data.has_pwd_discount}
                                                onCheckedChange={(checked) => handlePwdDiscountChange(checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <div>
                                                <Label htmlFor="has_pwd_discount" className="font-medium dark:text-white">
                                                    PWD Discount
                                                </Label>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">RA 10754</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 dark:border-green-800">
                                            Mandatory 20%
                                        </Badge>
                                    </div>
                                    
                                    {data.has_pwd_discount && (
                                        <div className="pl-6 space-y-2">
                                            <Label htmlFor="pwd_discount_percentage" className="dark:text-gray-300">Discount Percentage</Label>
                                            <div className="relative">
                                                <Input
                                                    id="pwd_discount_percentage"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    value={data.pwd_discount_percentage || ''}
                                                    onChange={(e) => setData('pwd_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                />
                                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Solo Parent Discount */}
                                <div className="space-y-4 border rounded-lg p-4 dark:border-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="has_solo_parent_discount"
                                            checked={data.has_solo_parent_discount}
                                            onCheckedChange={(checked) => handleSoloParentDiscountChange(checked as boolean)}
                                            className="dark:border-gray-600"
                                        />
                                        <div>
                                            <Label htmlFor="has_solo_parent_discount" className="font-medium dark:text-white">
                                                Solo Parent Discount
                                            </Label>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">RA 8972</p>
                                        </div>
                                    </div>
                                    
                                    {data.has_solo_parent_discount && (
                                        <div className="pl-6 space-y-2">
                                            <Label htmlFor="solo_parent_discount_percentage" className="dark:text-gray-300">Discount Percentage</Label>
                                            <div className="relative">
                                                <Input
                                                    id="solo_parent_discount_percentage"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    value={data.solo_parent_discount_percentage || ''}
                                                    onChange={(e) => setData('solo_parent_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                />
                                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Typically 10% discount for solo parents
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Indigent Discount */}
                                <div className="space-y-4 border rounded-lg p-4 dark:border-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="has_indigent_discount"
                                            checked={data.has_indigent_discount}
                                            onCheckedChange={(checked) => handleIndigentDiscountChange(checked as boolean)}
                                            className="dark:border-gray-600"
                                        />
                                        <div>
                                            <Label htmlFor="has_indigent_discount" className="font-medium dark:text-white">
                                                Indigent Discount
                                            </Label>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">LGU Ordinance</p>
                                        </div>
                                    </div>
                                    
                                    {data.has_indigent_discount && (
                                        <div className="pl-6 space-y-2">
                                            <Label htmlFor="indigent_discount_percentage" className="dark:text-gray-300">Discount Percentage</Label>
                                            <div className="relative">
                                                <Input
                                                    id="indigent_discount_percentage"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    value={data.indigent_discount_percentage || ''}
                                                    onChange={(e) => setData('indigent_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                />
                                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Often 50-100% depending on LGU classification
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Late Payment Penalties */}
                    <Card className="dark:bg-gray-900 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="dark:text-white">Late Payment Penalties</CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Configure surcharges and penalties for late payments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Surcharge */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-lg dark:text-white">Surcharge</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="has_surcharge"
                                                checked={data.has_surcharge}
                                                onCheckedChange={(checked) => setData('has_surcharge', checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="has_surcharge" className="dark:text-gray-300">Apply Surcharge for Late Payments</Label>
                                        </div>
                                        {data.has_surcharge && (
                                            <div className="space-y-4 pl-6">
                                                <div className="space-y-2">
                                                    <Label className="dark:text-gray-300">Monthly Surcharge Rate</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            placeholder="Percentage per month"
                                                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                            value={data.surcharge_percentage || ''}
                                                            onChange={(e) => setData('surcharge_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Percentage added monthly (e.g., 2% per month)
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="dark:text-gray-300">Fixed Surcharge Amount</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Fixed amount"
                                                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                            value={data.surcharge_fixed || ''}
                                                            onChange={(e) => setData('surcharge_fixed', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Fixed amount charged for late payment
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Penalty */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-lg dark:text-white">Additional Penalty</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="has_penalty"
                                                checked={data.has_penalty}
                                                onCheckedChange={(checked) => setData('has_penalty', checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="has_penalty" className="dark:text-gray-300">Apply Additional Penalty</Label>
                                        </div>
                                        {data.has_penalty && (
                                            <div className="space-y-4 pl-6">
                                                <div className="space-y-2">
                                                    <Label className="dark:text-gray-300">Penalty Percentage</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            placeholder="One-time percentage"
                                                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                            value={data.penalty_percentage || ''}
                                                            onChange={(e) => setData('penalty_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        One-time penalty percentage
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="dark:text-gray-300">Fixed Penalty Amount</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Fixed amount"
                                                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                            value={data.penalty_fixed || ''}
                                                            onChange={(e) => setData('penalty_fixed', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Fixed penalty amount
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Notes */}
                    <Card className="dark:bg-gray-900 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="dark:text-white">Additional Notes</CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Any additional notes or instructions for this fee type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                rows={3}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Any additional notes or instructions for this fee type..."
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                            />
                        </CardContent>
                    </Card>
                </div>
            </form>

            {/* Delete Confirmation Modal */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <Trash2 className="h-5 w-5" />
                                    Delete Fee Type
                                </h3>
                                <button
                                    onClick={() => setShowDeleteDialog(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Are you sure you want to delete "<span className="font-semibold dark:text-white">{feeType.name}</span>"?
                                <br />
                                <span className="text-red-500 dark:text-red-400 font-medium">This action cannot be undone.</span>
                            </p>
                            
                            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                                    <div className="text-sm text-amber-800 dark:text-amber-300">
                                        <p className="font-medium mb-1">Warning</p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li>This will permanently delete the fee type</li>
                                            <li>Associated fee records may be affected</li>
                                            <li>Consider deactivating instead if you want to keep historical data</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowDeleteDialog(false)}
                                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={processing}
                                    className="dark:bg-red-900 dark:hover:bg-red-800"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {processing ? 'Deleting...' : 'Delete Permanently'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
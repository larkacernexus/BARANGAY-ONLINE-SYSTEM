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

// Helper function to safely parse array data
function parseArrayData(data: any): string[] {
    if (Array.isArray(data)) {
        return data;
    }
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
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
    errors
}: FeeTypesEditProps) {
    // Safely parse array data from backend
    const initialPuroks = parseArrayData(feeType.applicable_puroks);
    const initialRequirements = parseArrayData(feeType.requirements);
    
    const [selectedPuroks, setSelectedPuroks] = useState<string[]>(initialPuroks);
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>(initialRequirements);
    const [newRequirement, setNewRequirement] = useState('');
    const [autoGenerateCode, setAutoGenerateCode] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [showDiscountInfo, setShowDiscountInfo] = useState<boolean>(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    
    // Format dates for the form
    const formattedEffectiveDate = formatDateForInput(feeType.effective_date);
    const formattedExpiryDate = formatDateForInput(feeType.expiry_date);
    
    const { data, setData, put, processing, delete: destroy } = useForm<FeeFormData>({
        code: feeType.code,
        name: feeType.name,
        short_name: feeType.short_name || '',
        category: feeType.category,
        base_amount: feeType.base_amount,
        amount_type: feeType.amount_type,
        unit: feeType.unit || '',
        description: feeType.description || '',
        frequency: feeType.frequency,
        validity_days: feeType.validity_days,
        applicable_to: feeType.applicable_to,
        applicable_puroks: initialPuroks,
        requirements: initialRequirements,
        effective_date: formattedEffectiveDate,
        expiry_date: formattedExpiryDate,
        is_active: feeType.is_active,
        is_mandatory: feeType.is_mandatory,
        auto_generate: feeType.auto_generate,
        due_day: feeType.due_day,
        sort_order: feeType.sort_order,
        
        // Discounts with default values
        has_senior_discount: feeType.has_senior_discount,
        senior_discount_percentage: feeType.senior_discount_percentage || PHILIPPINE_STANDARD_DISCOUNTS.senior,
        
        has_pwd_discount: feeType.has_pwd_discount,
        pwd_discount_percentage: feeType.pwd_discount_percentage || PHILIPPINE_STANDARD_DISCOUNTS.pwd,
        
        has_solo_parent_discount: feeType.has_solo_parent_discount,
        solo_parent_discount_percentage: feeType.solo_parent_discount_percentage || PHILIPPINE_STANDARD_DISCOUNTS.solo_parent,
        
        has_indigent_discount: feeType.has_indigent_discount,
        indigent_discount_percentage: feeType.indigent_discount_percentage || PHILIPPINE_STANDARD_DISCOUNTS.indigent,
        
        // Late payment
        has_surcharge: feeType.has_surcharge,
        surcharge_percentage: feeType.surcharge_percentage,
        surcharge_fixed: feeType.surcharge_fixed,
        has_penalty: feeType.has_penalty,
        penalty_percentage: feeType.penalty_percentage,
        penalty_fixed: feeType.penalty_fixed,
        notes: feeType.notes || '',
    });

    // Auto-generate code when name or category changes (only if auto-generate is enabled)
    useEffect(() => {
        if (autoGenerateCode && data.name.trim() && data.category) {
            const generatedCode = generateFeeCode(data.name, data.category);
            setData('code', generatedCode);
        }
    }, [data.name, data.category, autoGenerateCode]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // If code is empty but auto-generation is on, generate one
        if (!data.code.trim() && autoGenerateCode) {
            const generatedCode = generateFeeCode(data.name || 'New Fee', data.category);
            setData('code', generatedCode);
        }
        
        put(`/fee-types/${feeType.id}`);
    };

    const handleDelete = () => {
        destroy(`/fee-types/${feeType.id}`, {
            onSuccess: () => {
                // Redirect happens in the controller
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
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Edit Fee Type</h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    ID: {feeType.code}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setShowDeleteDialog(true)}
                                disabled={processing}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Update Fee Type'}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Basic Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Edit basic details about the fee type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Code Field */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="code">Code *</Label>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={autoGenerateCode}
                                                        onCheckedChange={setAutoGenerateCode}
                                                        id="auto-generate-code"
                                                    />
                                                    <Label htmlFor="auto-generate-code" className="text-xs cursor-pointer">
                                                        Re-generate
                                                    </Label>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                <Input
                                                    id="code"
                                                    required
                                                    value={data.code}
                                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                                    placeholder="e.g., TAX-BRT-1234"
                                                    className="pl-10 pr-24"
                                                    disabled={autoGenerateCode}
                                                />
                                                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleCopyCode}
                                                        disabled={!data.code}
                                                        className="h-7 w-7 p-0"
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
                                                        className="h-7 w-7 p-0"
                                                        title="Generate new code"
                                                    >
                                                        <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                                                    </Button>
                                                </div>
                                            </div>
                                            {errors?.code && (
                                                <p className="text-sm text-red-500">{errors.code}</p>
                                            )}
                                            {autoGenerateCode && (
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" />
                                                    Code will be auto-generated based on name and category
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name *</Label>
                                            <Input
                                                id="name"
                                                required
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Barangay Tax, Business Clearance"
                                            />
                                            {errors?.name && (
                                                <p className="text-sm text-red-500">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="short_name">Short Name</Label>
                                            <Input
                                                id="short_name"
                                                value={data.short_name}
                                                onChange={(e) => setData('short_name', e.target.value)}
                                                placeholder="e.g., Tax, Clearance"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <select
                                                id="category"
                                                required
                                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                value={data.category}
                                                onChange={(e) => setData('category', e.target.value)}
                                            >
                                                {Object.entries(safeCategories).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                rows={3}
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Description of this fee type..."
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Pricing
                                    </CardTitle>
                                    <CardDescription>
                                        Edit pricing details for the fee
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="base_amount">Base Amount *</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                <Input
                                                    id="base_amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                    className="pl-10"
                                                    value={data.base_amount}
                                                    onChange={(e) => setData('base_amount', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            {errors?.base_amount && (
                                                <p className="text-sm text-red-500">{errors.base_amount}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amount_type">Amount Type *</Label>
                                            <select
                                                id="amount_type"
                                                required
                                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                value={data.amount_type}
                                                onChange={(e) => setData('amount_type', e.target.value)}
                                            >
                                                {Object.entries(safeAmountTypes).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="unit">Unit (Optional)</Label>
                                            <Input
                                                id="unit"
                                                placeholder="e.g., per square meter, per month"
                                                value={data.unit}
                                                onChange={(e) => setData('unit', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Frequency & Validity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Frequency & Validity
                                    </CardTitle>
                                    <CardDescription>
                                        Edit how often this fee is charged and its validity period
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="frequency">Frequency *</Label>
                                            <select
                                                id="frequency"
                                                required
                                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                value={data.frequency}
                                                onChange={(e) => setData('frequency', e.target.value)}
                                            >
                                                {Object.entries(safeFrequencies).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="validity_days">Validity Days (for certificates)</Label>
                                            <Input
                                                id="validity_days"
                                                type="number"
                                                min="1"
                                                value={data.validity_days || ''}
                                                onChange={(e) => setData('validity_days', e.target.value ? parseInt(e.target.value) : null)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="effective_date">Effective Date *</Label>
                                            <Input
                                                id="effective_date"
                                                type="date"
                                                required
                                                value={data.effective_date}
                                                onChange={(e) => setData('effective_date', e.target.value)}
                                            />
                                            {errors?.effective_date && (
                                                <p className="text-sm text-red-500">{errors.effective_date}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                                            <Input
                                                id="expiry_date"
                                                type="date"
                                                value={data.expiry_date}
                                                onChange={(e) => setData('expiry_date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Settings */}
                        <div className="space-y-6">
                            {/* Applicability */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Applicability
                                    </CardTitle>
                                    <CardDescription>
                                        Edit who this fee applies to
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="applicable_to">Applicable To *</Label>
                                        <select
                                            id="applicable_to"
                                            required
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            value={data.applicable_to}
                                            onChange={(e) => {
                                                setData('applicable_to', e.target.value);
                                                if (e.target.value !== 'specific_purok') {
                                                    setSelectedPuroks([]);
                                                    setData('applicable_puroks', []);
                                                }
                                            }}
                                        >
                                            {Object.entries(safeApplicableTo).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {data.applicable_to === 'specific_purok' && (
                                        <div className="space-y-2">
                                            <Label>Select Puroks</Label>
                                            <div className="space-y-2 max-h-60 overflow-y-auto p-3 border rounded-md">
                                                {puroks.map((purok, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`purok-${index}`}
                                                            checked={selectedPuroks.includes(purok)}
                                                            onCheckedChange={(checked) => 
                                                                handlePurokChange(purok, checked as boolean)
                                                            }
                                                        />
                                                        <Label 
                                                            htmlFor={`purok-${index}`}
                                                            className="text-sm cursor-pointer"
                                                        >
                                                            {purok}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Requirements */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Tag className="h-5 w-5" />
                                        Requirements
                                    </CardTitle>
                                    <CardDescription>
                                        Edit requirements for this fee
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-requirement">Add Requirements</Label>
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
                                            />
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={addRequirement}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Selected Requirements</Label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {Array.isArray(selectedRequirements) && selectedRequirements.map((req, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                    <span className="text-sm">{req}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeRequirement(index)}
                                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                            ))}
                                            {(!Array.isArray(selectedRequirements) || selectedRequirements.length === 0) && (
                                                <p className="text-sm text-gray-500 italic">No requirements added</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status & Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Status & Settings
                                    </CardTitle>
                                    <CardDescription>
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
                                            />
                                            <Label htmlFor="is_active">Active</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_mandatory"
                                                checked={data.is_mandatory}
                                                onCheckedChange={(checked) => setData('is_mandatory', checked as boolean)}
                                            />
                                            <Label htmlFor="is_mandatory">Mandatory</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="auto_generate"
                                                checked={data.auto_generate}
                                                onCheckedChange={(checked) => setData('auto_generate', checked as boolean)}
                                            />
                                            <Label htmlFor="auto_generate">Auto-generate bills</Label>
                                        </div>
                                        {data.auto_generate && (
                                            <div className="space-y-2 pl-6">
                                                <Label htmlFor="due_day">Due Day of Month</Label>
                                                <Input
                                                    id="due_day"
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={data.due_day || ''}
                                                    onChange={(e) => setData('due_day', e.target.value ? parseInt(e.target.value) : null)}
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2 pl-6">
                                            <Label htmlFor="sort_order">Sort Order</Label>
                                            <Input
                                                id="sort_order"
                                                type="number"
                                                value={data.sort_order}
                                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Discounts Configuration */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Discount Configuration</CardTitle>
                                    <CardDescription>
                                        Configure different discounts for eligible groups
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDiscountInfo(!showDiscountInfo)}
                                >
                                    <Info className="h-4 w-4 mr-1" />
                                    Philippine Guidelines
                                </Button>
                            </div>
                        </CardHeader>
                        
                        {showDiscountInfo && (
                            <div className="px-6 pb-4">
                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                        <div className="space-y-2">
                                            <p><strong>Philippine Discount Rules:</strong></p>
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
                                <div className="space-y-4 border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="has_senior_discount"
                                                checked={data.has_senior_discount}
                                                onCheckedChange={handleSeniorDiscountChange}
                                            />
                                            <div>
                                                <Label htmlFor="has_senior_discount" className="font-medium">
                                                    Senior Citizen Discount
                                                </Label>
                                                <p className="text-sm text-gray-500">RA 9994</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                            Mandatory 20%
                                        </Badge>
                                    </div>
                                    
                                    {data.has_senior_discount && (
                                        <div className="pl-6 space-y-2">
                                            <Label htmlFor="senior_discount_percentage">Discount Percentage</Label>
                                            <div className="relative">
                                                <Input
                                                    id="senior_discount_percentage"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="pl-10"
                                                    value={data.senior_discount_percentage || ''}
                                                    onChange={(e) => setData('senior_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                />
                                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Philippine law mandates 20% for senior citizens
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* PWD Discount */}
                                <div className="space-y-4 border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="has_pwd_discount"
                                                checked={data.has_pwd_discount}
                                                onCheckedChange={handlePwdDiscountChange}
                                            />
                                            <div>
                                                <Label htmlFor="has_pwd_discount" className="font-medium">
                                                    PWD Discount
                                                </Label>
                                                <p className="text-sm text-gray-500">RA 10754</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            Mandatory 20%
                                        </Badge>
                                    </div>
                                    
                                    {data.has_pwd_discount && (
                                        <div className="pl-6 space-y-2">
                                            <Label htmlFor="pwd_discount_percentage">Discount Percentage</Label>
                                            <div className="relative">
                                                <Input
                                                    id="pwd_discount_percentage"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="pl-10"
                                                    value={data.pwd_discount_percentage || ''}
                                                    onChange={(e) => setData('pwd_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                />
                                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Solo Parent Discount */}
                                <div className="space-y-4 border rounded-lg p-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="has_solo_parent_discount"
                                            checked={data.has_solo_parent_discount}
                                            onCheckedChange={handleSoloParentDiscountChange}
                                        />
                                        <div>
                                            <Label htmlFor="has_solo_parent_discount" className="font-medium">
                                                Solo Parent Discount
                                            </Label>
                                            <p className="text-sm text-gray-500">RA 8972</p>
                                        </div>
                                    </div>
                                    
                                    {data.has_solo_parent_discount && (
                                        <div className="pl-6 space-y-2">
                                            <Label htmlFor="solo_parent_discount_percentage">Discount Percentage</Label>
                                            <div className="relative">
                                                <Input
                                                    id="solo_parent_discount_percentage"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="pl-10"
                                                    value={data.solo_parent_discount_percentage || ''}
                                                    onChange={(e) => setData('solo_parent_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                />
                                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Typically 10% discount for solo parents
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Indigent Discount */}
                                <div className="space-y-4 border rounded-lg p-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="has_indigent_discount"
                                            checked={data.has_indigent_discount}
                                            onCheckedChange={handleIndigentDiscountChange}
                                        />
                                        <div>
                                            <Label htmlFor="has_indigent_discount" className="font-medium">
                                                Indigent Discount
                                            </Label>
                                            <p className="text-sm text-gray-500">LGU Ordinance</p>
                                        </div>
                                    </div>
                                    
                                    {data.has_indigent_discount && (
                                        <div className="pl-6 space-y-2">
                                            <Label htmlFor="indigent_discount_percentage">Discount Percentage</Label>
                                            <div className="relative">
                                                <Input
                                                    id="indigent_discount_percentage"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="pl-10"
                                                    value={data.indigent_discount_percentage || ''}
                                                    onChange={(e) => setData('indigent_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                />
                                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Often 50-100% depending on LGU classification
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Late Payment Penalties */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Late Payment Penalties</CardTitle>
                            <CardDescription>
                                Configure surcharges and penalties for late payments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Surcharge */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-lg">Surcharge</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="has_surcharge"
                                                checked={data.has_surcharge}
                                                onCheckedChange={(checked) => setData('has_surcharge', checked as boolean)}
                                            />
                                            <Label htmlFor="has_surcharge">Apply Surcharge for Late Payments</Label>
                                        </div>
                                        {data.has_surcharge && (
                                            <div className="space-y-4 pl-6">
                                                <div className="space-y-2">
                                                    <Label>Monthly Surcharge Rate</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            placeholder="Percentage per month"
                                                            className="pl-10"
                                                            value={data.surcharge_percentage || ''}
                                                            onChange={(e) => setData('surcharge_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        Percentage added monthly (e.g., 2% per month)
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Fixed Surcharge Amount</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Fixed amount"
                                                            className="pl-10"
                                                            value={data.surcharge_fixed || ''}
                                                            onChange={(e) => setData('surcharge_fixed', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        Fixed amount charged for late payment
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Penalty */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-lg">Additional Penalty</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="has_penalty"
                                                checked={data.has_penalty}
                                                onCheckedChange={(checked) => setData('has_penalty', checked as boolean)}
                                            />
                                            <Label htmlFor="has_penalty">Apply Additional Penalty</Label>
                                        </div>
                                        {data.has_penalty && (
                                            <div className="space-y-4 pl-6">
                                                <div className="space-y-2">
                                                    <Label>Penalty Percentage</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            placeholder="One-time percentage"
                                                            className="pl-10"
                                                            value={data.penalty_percentage || ''}
                                                            onChange={(e) => setData('penalty_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        One-time penalty percentage
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Fixed Penalty Amount</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Fixed amount"
                                                            className="pl-10"
                                                            value={data.penalty_fixed || ''}
                                                            onChange={(e) => setData('penalty_fixed', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500">
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Notes</CardTitle>
                            <CardDescription>
                                Any additional notes or instructions for this fee type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                rows={3}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Any additional notes or instructions for this fee type..."
                            />
                        </CardContent>
                    </Card>
                </div>
            </form>

            {/* Simple Delete Confirmation Modal */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600">
                                    <Trash2 className="h-5 w-5" />
                                    Delete Fee Type
                                </h3>
                                <button
                                    onClick={() => setShowDeleteDialog(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to delete "<span className="font-semibold">{feeType.name}</span>"?
                                <br />
                                <span className="text-red-500 font-medium">This action cannot be undone.</span>
                            </p>
                            
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <div className="text-sm text-amber-800">
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
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={processing}
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
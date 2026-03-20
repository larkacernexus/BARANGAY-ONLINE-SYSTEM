// pages/admin/fee-types/create.tsx

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
    X,
    Plus,
    Shield,
    Award,
    HeartHandshake,
    Heart,
    Briefcase,
    Home
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
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FeeTypesCreateProps {
    categories?: Record<string, string>; // Now uses document_category_id (number) as key
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
    document_category_id: string; // Changed from category to document_category_id
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

// Generate a fee code based on category name and fee name
function generateFeeCode(name: string, categoryId: string, categories: Record<string, string>): string {
    // Get category name from ID
    const categoryName = categories[categoryId] || 'FEE';
    
    // Use first 3 letters of category name as prefix
    const prefix = categoryName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3);
    
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

export default function FeeTypesCreate({ 
    categories = {}, 
    amountTypes = {}, 
    frequencies = {}, 
    applicableTo = {}, 
    puroks = [],
    errors
}: FeeTypesCreateProps) {
    const [selectedPuroks, setSelectedPuroks] = useState<string[]>([]);
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
    const [newRequirement, setNewRequirement] = useState('');
    const [autoGenerateCode, setAutoGenerateCode] = useState<boolean>(true);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [showDiscountInfo, setShowDiscountInfo] = useState<boolean>(false);
    
    // Get first category ID for default value
    const firstCategoryId = Object.keys(categories)[0] || '';
    
    const { data, setData, post, processing } = useForm<FeeFormData>({
        code: '',
        name: '',
        short_name: '',
        document_category_id: firstCategoryId, // Changed from category to document_category_id
        base_amount: 0,
        amount_type: 'fixed',
        unit: '',
        description: '',
        frequency: 'one_time',
        validity_days: null,
        applicable_to: 'all_residents',
        applicable_puroks: [],
        requirements: [],
        effective_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        is_active: true,
        is_mandatory: false,
        auto_generate: false,
        due_day: null,
        sort_order: 0,
        
        // Discounts with separate percentages
        has_senior_discount: false,
        senior_discount_percentage: null,
        
        has_pwd_discount: false,
        pwd_discount_percentage: null,
        
        has_solo_parent_discount: false,
        solo_parent_discount_percentage: null,
        
        has_indigent_discount: false,
        indigent_discount_percentage: null,
        
        // Late payment
        has_surcharge: false,
        surcharge_percentage: null,
        surcharge_fixed: null,
        has_penalty: false,
        penalty_percentage: null,
        penalty_fixed: null,
        notes: '',
    });

    // Auto-generate code when name or category changes
    useEffect(() => {
        if (autoGenerateCode && data.name.trim() && data.document_category_id) {
            const generatedCode = generateFeeCode(data.name, data.document_category_id, categories);
            setData('code', generatedCode);
        }
    }, [data.name, data.document_category_id, autoGenerateCode, categories]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // If code is empty but auto-generation is on, generate one
        if (!data.code.trim() && autoGenerateCode) {
            const generatedCode = generateFeeCode(data.name || 'New Fee', data.document_category_id, categories);
            setData('code', generatedCode);
        }
        
        post('/admin/fee-types');
    };

    const handleGenerateCode = () => {
        setIsGenerating(true);
        const generatedCode = generateFeeCode(data.name || 'New Fee', data.document_category_id, categories);
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
            setData('senior_discount_percentage', PHILIPPINE_STANDARD_DISCOUNTS.senior);
        } else {
            setData('senior_discount_percentage', null);
        }
    };

    const handlePwdDiscountChange = (checked: boolean) => {
        setData('has_pwd_discount', checked);
        if (checked) {
            setData('pwd_discount_percentage', PHILIPPINE_STANDARD_DISCOUNTS.pwd);
        } else {
            setData('pwd_discount_percentage', null);
        }
    };

    const handleSoloParentDiscountChange = (checked: boolean) => {
        setData('has_solo_parent_discount', checked);
        if (checked) {
            setData('solo_parent_discount_percentage', PHILIPPINE_STANDARD_DISCOUNTS.solo_parent);
        } else {
            setData('solo_parent_discount_percentage', null);
        }
    };

    const handleIndigentDiscountChange = (checked: boolean) => {
        setData('has_indigent_discount', checked);
        if (checked) {
            setData('indigent_discount_percentage', PHILIPPINE_STANDARD_DISCOUNTS.indigent);
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
            title="Create Fee Type"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Fee Types', href: '/admin/fee-types' },
                { title: 'Create Fee Type', href: '/admin/fee-types/create' }
            ]}
        >
            <Head title="Create Fee Type" />
            
            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/fee-types">
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                        Create Fee Type
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Define a new fee type for barangay collections
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Fee Type'}
                        </Button>
                    </div>

                    {/* Error Alert */}
                    {errors && Object.keys(errors).length > 0 && (
                        <Card className="border-l-4 border-l-red-500 dark:bg-gray-900">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-800 dark:text-red-300">Please fix the following errors:</p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            {Object.entries(errors).map(([field, message]) => (
                                                <li key={field} className="text-sm text-red-600 dark:text-red-400">
                                                    <span className="font-medium capitalize">{field.replace('_', ' ')}:</span> {message as string}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Basic Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                                            <FileText className="h-3 w-3 text-white" />
                                        </div>
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Enter basic details about the fee type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Code Field */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="code" className="dark:text-gray-300">Code</Label>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={autoGenerateCode}
                                                        onCheckedChange={setAutoGenerateCode}
                                                        id="auto-generate-code"
                                                        className="dark:data-[state=checked]:bg-blue-600"
                                                    />
                                                    <Label htmlFor="auto-generate-code" className="text-xs cursor-pointer dark:text-gray-400">
                                                        Auto-generate
                                                    </Label>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input
                                                    id="code"
                                                    value={data.code}
                                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                                    placeholder="e.g., TAX-BRT-1234"
                                                    className="pl-10 pr-24 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                            {errors?.code && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                                            )}
                                            {autoGenerateCode && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" />
                                                    Code will be auto-generated based on name and category
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="dark:text-gray-300">Name *</Label>
                                            <Input
                                                id="name"
                                                required
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Barangay Tax, Business Clearance"
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                            {errors?.name && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="short_name" className="dark:text-gray-300">Short Name</Label>
                                            <Input
                                                id="short_name"
                                                value={data.short_name}
                                                onChange={(e) => setData('short_name', e.target.value)}
                                                placeholder="e.g., Tax, Clearance"
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="document_category_id" className="dark:text-gray-300">Category *</Label>
                                            <select
                                                id="document_category_id"
                                                required
                                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                value={data.document_category_id}
                                                onChange={(e) => setData('document_category_id', e.target.value)}
                                            >
                                                <option value="">Select a category</option>
                                                {Object.entries(safeCategories).map(([id, label]) => (
                                                    <option key={id} value={id}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors?.document_category_id && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.document_category_id}</p>
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
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center">
                                            <DollarSign className="h-3 w-3 text-white" />
                                        </div>
                                        Pricing
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Configure pricing details for the fee
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="base_amount" className="dark:text-gray-300">Base Amount *</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <Input
                                                    id="base_amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    value={data.base_amount}
                                                    onChange={(e) => setData('base_amount', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            {errors?.base_amount && (
                                                <p className="text-sm text-red-600 dark:text-red-400">{errors.base_amount}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amount_type" className="dark:text-gray-300">Amount Type *</Label>
                                            <select
                                                id="amount_type"
                                                required
                                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                            <Label htmlFor="unit" className="dark:text-gray-300">Unit (Optional)</Label>
                                            <Input
                                                id="unit"
                                                placeholder="e.g., per square meter, per month"
                                                value={data.unit}
                                                onChange={(e) => setData('unit', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Frequency & Validity */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                                            <Calendar className="h-3 w-3 text-white" />
                                        </div>
                                        Frequency & Validity
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Set how often this fee is charged and its validity period
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="frequency" className="dark:text-gray-300">Frequency *</Label>
                                            <select
                                                id="frequency"
                                                required
                                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                            <Label htmlFor="validity_days" className="dark:text-gray-300">Validity Days (for certificates)</Label>
                                            <Input
                                                id="validity_days"
                                                type="number"
                                                min="1"
                                                value={data.validity_days || ''}
                                                onChange={(e) => setData('validity_days', e.target.value ? parseInt(e.target.value) : null)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry_date" className="dark:text-gray-300">Expiry Date (Optional)</Label>
                                            <Input
                                                id="expiry_date"
                                                type="date"
                                                value={data.expiry_date}
                                                onChange={(e) => setData('expiry_date', e.target.value)}
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Settings */}
                        <div className="space-y-6">
                            {/* Applicability */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-center">
                                            <Users className="h-3 w-3 text-white" />
                                        </div>
                                        Applicability
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Define who this fee applies to
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="applicable_to" className="dark:text-gray-300">Applicable To *</Label>
                                        <select
                                            id="applicable_to"
                                            required
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                            <Label className="dark:text-gray-300">Select Puroks</Label>
                                            <div className="space-y-2 max-h-60 overflow-y-auto p-3 border rounded-md dark:border-gray-700">
                                                {puroks.map((purok, index) => (
                                                    <div key={index} className="flex items-center space-x-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-900 rounded">
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
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Requirements */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-700 dark:to-blue-700 flex items-center justify-center">
                                            <Tag className="h-3 w-3 text-white" />
                                        </div>
                                        Requirements
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Add requirements for this fee
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
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                                className="dark:border-gray-600 dark:text-gray-300"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="dark:text-gray-300">Selected Requirements</Label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {selectedRequirements.map((req, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                                                    <span className="text-sm dark:text-gray-300">{req}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeRequirement(index)}
                                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {selectedRequirements.length === 0 && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No requirements added</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status & Settings */}
                            <Card className="dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700 flex items-center justify-center">
                                            <Clock className="h-3 w-3 text-white" />
                                        </div>
                                        Status & Settings
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">
                                        Configure fee status and behavior
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2 p-2 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                            <Checkbox
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="is_active" className="cursor-pointer dark:text-gray-300">Active</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 p-2 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                            <Checkbox
                                                id="is_mandatory"
                                                checked={data.is_mandatory}
                                                onCheckedChange={(checked) => setData('is_mandatory', checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="is_mandatory" className="cursor-pointer dark:text-gray-300">Mandatory</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 p-2 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                            <Checkbox
                                                id="auto_generate"
                                                checked={data.auto_generate}
                                                onCheckedChange={(checked) => setData('auto_generate', checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="auto_generate" className="cursor-pointer dark:text-gray-300">Auto-generate bills</Label>
                                        </div>
                                        {data.auto_generate && (
                                            <div className="space-y-2 pl-6 pt-2">
                                                <Label htmlFor="due_day" className="dark:text-gray-300">Due Day of Month</Label>
                                                <Input
                                                    id="due_day"
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={data.due_day || ''}
                                                    onChange={(e) => setData('due_day', e.target.value ? parseInt(e.target.value) : null)}
                                                    className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Discounts Configuration */}
                    <Card className="dark:bg-gray-900">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-700 dark:to-amber-700 flex items-center justify-center">
                                            <Award className="h-3 w-3 text-white" />
                                        </div>
                                        Discount Configuration
                                    </CardTitle>
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
                                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <AlertDescription className="text-sm text-blue-700 dark:text-blue-400">
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
                                    </div>
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
                                                onCheckedChange={handleSeniorDiscountChange}
                                                className="dark:border-gray-600"
                                            />
                                            <div>
                                                <Label htmlFor="has_senior_discount" className="font-medium dark:text-gray-200">
                                                    Senior Citizen Discount
                                                </Label>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">RA 9994</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
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
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    value={data.senior_discount_percentage || ''}
                                                    onChange={(e) => setData('senior_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                />
                                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                                                onCheckedChange={handlePwdDiscountChange}
                                                className="dark:border-gray-600"
                                            />
                                            <div>
                                                <Label htmlFor="has_pwd_discount" className="font-medium dark:text-gray-200">
                                                    PWD Discount
                                                </Label>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">RA 10754</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
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
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    value={data.pwd_discount_percentage || ''}
                                                    onChange={(e) => setData('pwd_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                />
                                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                                            onCheckedChange={handleSoloParentDiscountChange}
                                            className="dark:border-gray-600"
                                        />
                                        <div>
                                            <Label htmlFor="has_solo_parent_discount" className="font-medium dark:text-gray-200">
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
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    value={data.solo_parent_discount_percentage || ''}
                                                    onChange={(e) => setData('solo_parent_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                />
                                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                                            onCheckedChange={handleIndigentDiscountChange}
                                            className="dark:border-gray-600"
                                        />
                                        <div>
                                            <Label htmlFor="has_indigent_discount" className="font-medium dark:text-gray-200">
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
                                                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                    value={data.indigent_discount_percentage || ''}
                                                    onChange={(e) => setData('indigent_discount_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                />
                                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                    <Card className="dark:bg-gray-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700 flex items-center justify-center">
                                    <AlertCircle className="h-3 w-3 text-white" />
                                </div>
                                Late Payment Penalties
                            </CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Configure surcharges and penalties for late payments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Surcharge */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-lg dark:text-gray-200">Surcharge</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2 p-2 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                            <Checkbox
                                                id="has_surcharge"
                                                checked={data.has_surcharge}
                                                onCheckedChange={(checked) => setData('has_surcharge', checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="has_surcharge" className="cursor-pointer dark:text-gray-300">Apply Surcharge for Late Payments</Label>
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
                                                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                            value={data.surcharge_percentage || ''}
                                                            onChange={(e) => setData('surcharge_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Percentage added monthly (e.g., 2% per month)
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="dark:text-gray-300">Fixed Surcharge Amount</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Fixed amount"
                                                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                                    <h3 className="font-medium text-lg dark:text-gray-200">Additional Penalty</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2 p-2 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                            <Checkbox
                                                id="has_penalty"
                                                checked={data.has_penalty}
                                                onCheckedChange={(checked) => setData('has_penalty', checked as boolean)}
                                                className="dark:border-gray-600"
                                            />
                                            <Label htmlFor="has_penalty" className="cursor-pointer dark:text-gray-300">Apply Additional Penalty</Label>
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
                                                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                                                            value={data.penalty_percentage || ''}
                                                            onChange={(e) => setData('penalty_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                        />
                                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        One-time penalty percentage
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="dark:text-gray-300">Fixed Penalty Amount</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Fixed amount"
                                                            className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
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
                    <Card className="dark:bg-gray-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700 flex items-center justify-center">
                                    <FileText className="h-3 w-3 text-white" />
                                </div>
                                Additional Notes
                            </CardTitle>
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
                                className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                            />
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AppLayout>
    );
}
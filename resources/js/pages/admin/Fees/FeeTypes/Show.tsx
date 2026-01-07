import { Head, Link, router } from '@inertiajs/react';
import { 
    ChevronLeft,
    Edit,
    Copy,
    Trash2,
    MoreVertical,
    FileText,
    DollarSign,
    Calendar,
    Users,
    AlertCircle,
    AlertTriangle,
    Activity,
    Check,
    X,
    BarChart3,
    StickyNote,
    Tag,
    Eye,
    Clock,
    Home,
    PersonStanding,
    ShieldCheck,
    Percent,
    Calculator,
    Archive,
    CalendarDays,
    CreditCard,
    Download,
    Upload,
    RefreshCw,
    ArrowUpDown,
    Filter,
    Search,
    Plus,
    Hash,
    CheckCircle,
    XCircle,
    Settings,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { route } from 'ziggy-js';

interface DiscountFeeType {
    id: number;
    fee_type_id: number;
    discount_type_id: number;
    percentage: number | string;
    is_active: boolean;
    sort_order: number | null;
    notes: string | null;
    discount_type?: {
        id: number;
        code: string;
        name: string;
        description: string | null;
        default_percentage: number | string;
        legal_basis: string | null;
        requirements: string[] | null;
        is_active: boolean;
        is_mandatory: boolean;
        sort_order: number | null;
    };
}

interface FeeType {
    id: number;
    code: string;
    name: string;
    short_name: string | null;
    category: string;
    base_amount: number | string;
    amount_type: string;
    computation_formula: Record<string, any> | null;
    unit: string | null;
    has_senior_discount: boolean;
    has_pwd_discount: boolean;
    has_solo_parent_discount: boolean;
    has_indigent_discount: boolean;
    discount_percentage: number | string | null;
    has_surcharge: boolean;
    surcharge_percentage: number | string | null;
    surcharge_fixed: number | string | null;
    has_penalty: boolean;
    penalty_percentage: number | string | null;
    penalty_fixed: number | string | null;
    frequency: string;
    validity_days: number | null;
    applicable_to: string;
    applicable_puroks: string[] | string | null;
    requirements: string[] | string | null;
    approval_needed: boolean;
    effective_date: string;
    expiry_date: string | null;
    is_active: boolean;
    is_mandatory: boolean;
    auto_generate: boolean;
    due_day: number | null;
    sort_order: number | null;
    description: string | null;
    notes: string | null;
    fees_count: number;
    discount_fee_types?: DiscountFeeType[];
    
    // Added properties (these were missing from the original interface)
    senior_discount_percentage?: number | string | null;
    pwd_discount_percentage?: number | string | null;
    solo_parent_discount_percentage?: number | string | null;
    indigent_discount_percentage?: number | string | null;
    created_at: string;
    updated_at: string;
}

interface Fee {
    id: number;
    code: string;
    amount: number | string;
    status: string;
    due_date: string;
    resident?: {
        full_name: string;
        purok: string;
    };
    household?: {
        household_number: string;
        purok: string;
    };
}

interface PageProps {
    feeType: FeeType;
    recentFees?: Fee[];
    statistics?: {
        total_collected?: number;
        total_pending?: number;
        total_overdue?: number;
        average_amount?: number;
    };
}

// Format currency
function formatCurrency(amount: any): string {
    if (amount === null || amount === undefined || amount === '') {
        return '₱0.00';
    }
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(numAmount)) {
        return '₱0.00';
    }
    return `₱${numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

// Format date
function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
}

// Format date with time
function formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Invalid date';
    }
}

// Get category icon
const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
        tax: DollarSign,
        clearance: FileText,
        certificate: FileText,
        service: FileText,
        rental: Calendar,
        fine: AlertTriangle,
        contribution: Users,
        other: Tag,
    };
    return icons[category] || Tag;
};

// Get category color
const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        tax: 'bg-blue-100 text-blue-800 border-blue-200',
        clearance: 'bg-green-100 text-green-800 border-green-200',
        certificate: 'bg-purple-100 text-purple-800 border-purple-200',
        service: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        rental: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        fine: 'bg-red-100 text-red-800 border-red-200',
        contribution: 'bg-orange-100 text-orange-800 border-orange-200',
        other: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Get category label
const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
        tax: 'Taxes',
        clearance: 'Clearances',
        certificate: 'Certificates',
        service: 'Services',
        rental: 'Rentals',
        fine: 'Fines',
        contribution: 'Contributions',
        other: 'Other',
    };
    return labels[category] || category;
};

// Get amount type label
const getAmountTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        fixed: 'Fixed Amount',
        per_unit: 'Per Unit',
        computed: 'Computed',
    };
    return labels[type] || type;
};

// Get applicable to label - Updated to match your model
const getApplicableToLabel = (type: string): string => {
    const labels: Record<string, string> = {
        all_residents: 'All Residents',
        property_owners: 'Property Owners',
        business_owners: 'Business Owners',
        households: 'Households',
        specific_purok: 'Specific Purok',
        specific_zone: 'Specific Zone',
        visitors: 'Visitors',
        other: 'Other',
    };
    return labels[type] || type;
};

// Get frequency label - Updated to match your model
const getFrequencyLabel = (frequency: string): string => {
    const labels: Record<string, string> = {
        one_time: 'One Time',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        semi_annual: 'Semi-Annual',
        annual: 'Annual',
        bi_annual: 'Bi-Annual',
        custom: 'Custom',
        as_needed: 'As Needed',
    };
    return labels[frequency] || frequency.replace('_', ' ');
};

// Helper function to safely convert field to array
const getArrayFromField = <T,>(field: any): T[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
        try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            // If it's a comma-separated string
            if (field.includes(',')) {
                return field.split(',').map(item => item.trim()).filter(Boolean) as T[];
            }
            // If it's a single value
            return [field] as T[];
        }
    }
    return [];
};

// Helper function to safely get discount percentage
const getDiscountPercentage = (specific: any, general: any): string => {
    if (specific !== null && specific !== undefined && specific !== '') {
        return `${specific}%`;
    }
    if (general !== null && general !== undefined && general !== '') {
        return `${general}%`;
    }
    return '0%';
};

export default function FeeTypeShow({ feeType, recentFees = [], statistics = {} }: PageProps) {
    const [togglingStatus, setTogglingStatus] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Safely convert applicable_puroks and requirements to arrays
    const applicablePuroks = useMemo(() => 
        getArrayFromField<string>(feeType.applicable_puroks), 
        [feeType.applicable_puroks]
    );
    
    const requirements = useMemo(() => 
        getArrayFromField<string>(feeType.requirements), 
        [feeType.requirements]
    );

    // Check if fee type is expired
    const isExpired = useMemo(() => {
        if (!feeType.expiry_date) return false;
        const expiryDate = new Date(feeType.expiry_date);
        return new Date() > expiryDate;
    }, [feeType.expiry_date]);

    // Check if any discount is enabled
    const hasAnyDiscount = useMemo(() => {
        // Check direct discount properties
        if (feeType.has_senior_discount || feeType.has_pwd_discount || 
            feeType.has_solo_parent_discount || feeType.has_indigent_discount) {
            return true;
        }
        
        // Check discount_fee_types relationship
        if (feeType.discount_fee_types && feeType.discount_fee_types.some(dft => dft.is_active)) {
            return true;
        }
        
        // Check general discount
        if (feeType.discount_percentage && parseFloat(feeType.discount_percentage as string) > 0) {
            return true;
        }
        
        return false;
    }, [feeType]);

    // Get active discount fee types
    const activeDiscountFeeTypes = useMemo(() => {
        if (feeType.discount_fee_types) {
            return feeType.discount_fee_types.filter(dft => 
                dft.is_active && dft.discount_type
            );
        }
        return [];
    }, [feeType]);

    // Get fee status class
    const getFeeStatusClass = (status: string): string => {
        const classes: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            overdue: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
            partial: 'bg-blue-100 text-blue-800',
        };
        return classes[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    // Toggle status
    const toggleStatus = () => {
        if (confirm(`Are you sure you want to ${feeType.is_active ? 'deactivate' : 'activate'} this fee type?`)) {
            setTogglingStatus(true);
            router.put(route('fee-types.toggle-status', feeType.id), {}, {
                onFinish: () => {
                    setTogglingStatus(false);
                },
            });
        }
    };

    // Confirm delete
    const confirmDelete = () => {
        if (confirm('Are you sure you want to delete this fee type? This action cannot be undone.')) {
            router.delete(route('fee-types.destroy', feeType.id));
        }
    };

    // Duplicate fee type
    const duplicateFeeType = () => {
        router.post(route('fee-types.duplicate', feeType.id));
    };

    // Breadcrumbs
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Fee Types', href: route('fee-types.index') },
        { title: feeType.name, href: route('fee-types.show', feeType.id) },
    ];

    // Tab content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Fee Type Code</Label>
                                            <div className="font-mono mt-1 p-2 bg-gray-50 rounded-md">
                                                {feeType.code}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Short Name</Label>
                                            <div className="mt-1 p-2 bg-gray-50 rounded-md">
                                                {feeType.short_name || '—'}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Description</Label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-md text-gray-700 whitespace-pre-line">
                                            {feeType.description || 'No description provided'}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Category</Label>
                                            <div className="mt-1 flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                                <Badge className={getCategoryColor(feeType.category)}>
                                                    {getCategoryLabel(feeType.category)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Amount Type</Label>
                                            <div className="mt-1 p-2 bg-gray-50 rounded-md">
                                                {getAmountTypeLabel(feeType.amount_type)}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Frequency</Label>
                                            <div className="mt-1 p-2 bg-gray-50 rounded-md capitalize">
                                                {getFrequencyLabel(feeType.frequency)}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Applicability Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Applicability
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Applicable To</Label>
                                        <div className="mt-1 p-2 bg-gray-50 rounded-md">
                                            {getApplicableToLabel(feeType.applicable_to)}
                                        </div>
                                    </div>

                                    {applicablePuroks.length > 0 && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Specific Puroks</Label>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {applicablePuroks.map((purok, index) => (
                                                    <Badge key={index} variant="outline">
                                                        <Home className="h-3 w-3 mr-1" />
                                                        {purok}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {requirements.length > 0 && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Requirements</Label>
                                            <div className="mt-2 space-y-2">
                                                {requirements.map((requirement, index) => (
                                                    <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-md">
                                                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span>{requirement}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {feeType.approval_needed && (
                                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-yellow-600" />
                                                <span className="font-medium">Approval Required</span>
                                            </div>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                This fee type requires approval before it can be applied.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right column */}
                        <div className="space-y-6">
                            {/* Status Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Status & Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Active Status</span>
                                        <Badge className={feeType.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {feeType.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Mandatory</span>
                                        {feeType.is_mandatory ? (
                                            <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <X className="h-4 w-4 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Auto-generate</span>
                                        {feeType.auto_generate ? (
                                            <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <X className="h-4 w-4 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Unit</span>
                                        <span className="font-medium">{feeType.unit || 'None'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Sort Order</span>
                                        <span className="font-medium">{feeType.sort_order || 'Default'}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dates Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Dates
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-gray-500">Effective Date</Label>
                                        <div className="font-medium">{formatDate(feeType.effective_date)}</div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-500">Expiry Date</Label>
                                        <div className="font-medium flex items-center gap-2">
                                            {feeType.expiry_date ? formatDate(feeType.expiry_date) : 'No expiry'}
                                            {isExpired && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Expired
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {feeType.validity_days && (
                                        <div>
                                            <Label className="text-xs text-gray-500">Validity Period</Label>
                                            <div className="font-medium">{feeType.validity_days} days</div>
                                        </div>
                                    )}
                                    {feeType.due_day && (
                                        <div>
                                            <Label className="text-xs text-gray-500">Due Day of Month</Label>
                                            <div className="font-medium">{feeType.due_day}th</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Computation Card */}
                            {feeType.computation_formula && Object.keys(feeType.computation_formula).length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calculator className="h-5 w-5" />
                                            Computation Formula
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap break-words">
                                                {JSON.stringify(feeType.computation_formula, null, 2)}
                                            </pre>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                );

            case 'pricing':
                return (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Base Amount Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Base Amount
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-primary">
                                        {formatCurrency(feeType.base_amount)}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {getAmountTypeLabel(feeType.amount_type)}
                                        {feeType.unit && ` • ${feeType.unit}`}
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium">Amount Type</span>
                                        <Badge variant="outline">
                                            {getAmountTypeLabel(feeType.amount_type)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium">Unit</span>
                                        <span className="font-medium">{feeType.unit || 'None'}</span>
                                    </div>
                                    {feeType.discount_percentage && (
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <span className="text-sm font-medium">General Discount</span>
                                            <span className="font-bold text-blue-700">
                                                {feeType.discount_percentage}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Discounts Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Percent className="h-5 w-5" />
                                    Discounts
                                </CardTitle>
                                <CardDescription>
                                    Special discounts for specific groups
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {hasAnyDiscount ? (
                                    <div className="space-y-3">
                                        {feeType.has_senior_discount && (
                                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <PersonStanding className="h-4 w-4 text-green-600" />
                                                    <div>
                                                        <div className="font-medium">Senior Citizen</div>
                                                        <div className="text-xs text-gray-600">For senior citizens aged 60+</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-green-700">
                                                        {getDiscountPercentage(feeType.senior_discount_percentage, feeType.discount_percentage)}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        Discount from base amount
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {feeType.has_pwd_discount && (
                                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <PersonStanding className="h-4 w-4 text-blue-600" />
                                                    <div>
                                                        <div className="font-medium">PWD</div>
                                                        <div className="text-xs text-gray-600">For persons with disabilities</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-blue-700">
                                                        {getDiscountPercentage(feeType.pwd_discount_percentage, feeType.discount_percentage)}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        Discount from base amount
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {feeType.has_solo_parent_discount && (
                                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <PersonStanding className="h-4 w-4 text-purple-600" />
                                                    <div>
                                                        <div className="font-medium">Solo Parent</div>
                                                        <div className="text-xs text-gray-600">For solo parents</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-purple-700">
                                                        {getDiscountPercentage(feeType.solo_parent_discount_percentage, feeType.discount_percentage)}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        Discount from base amount
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {feeType.has_indigent_discount && (
                                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <PersonStanding className="h-4 w-4 text-orange-600" />
                                                    <div>
                                                        <div className="font-medium">Indigent</div>
                                                        <div className="text-xs text-gray-600">For indigent families</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-orange-700">
                                                        {getDiscountPercentage(feeType.indigent_discount_percentage, feeType.discount_percentage)}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        Discount from base amount
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Dynamic discounts from discount_fee_types */}
                                        {activeDiscountFeeTypes.map((discountFeeType) => (
                                            <div 
                                                key={discountFeeType.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <PersonStanding className="h-4 w-4 text-gray-600" />
                                                    <div>
                                                        <div className="font-medium">{discountFeeType.discount_type!.name}</div>
                                                        <div className="text-xs text-gray-600">
                                                            {discountFeeType.discount_type!.description || 
                                                            `Discount for ${discountFeeType.discount_type!.name.toLowerCase()}`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-700">
                                                        {discountFeeType.percentage}%
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        Discount from base amount
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Percent className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <h3 className="text-lg font-medium text-gray-700">No discounts configured</h3>
                                        <p className="text-gray-500 mt-1">
                                            This fee type doesn't have any special discounts
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Late Payment Fees Card */}
                        {(feeType.has_surcharge || feeType.has_penalty) && (
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Late Payment Fees
                                    </CardTitle>
                                    <CardDescription>
                                        Additional charges for late payments
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {feeType.has_surcharge && (
                                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="rounded-full bg-yellow-100 p-3">
                                                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">Surcharge</h3>
                                                        <p className="text-sm text-gray-600">Applied for late payments</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {feeType.surcharge_percentage && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Percentage:</span>
                                                            <span className="font-bold text-yellow-700">
                                                                {feeType.surcharge_percentage}%
                                                            </span>
                                                        </div>
                                                    )}
                                                    {feeType.surcharge_fixed && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Fixed Amount:</span>
                                                            <span className="font-bold text-yellow-700">
                                                                {formatCurrency(feeType.surcharge_fixed)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {feeType.has_penalty && (
                                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="rounded-full bg-red-100 p-3">
                                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">Penalty</h3>
                                                        <p className="text-sm text-gray-600">Additional penalty fees</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {feeType.penalty_percentage && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Percentage:</span>
                                                            <span className="font-bold text-red-700">
                                                                {feeType.penalty_percentage}%
                                                            </span>
                                                        </div>
                                                    )}
                                                    {feeType.penalty_fixed && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Fixed Amount:</span>
                                                            <span className="font-bold text-red-700">
                                                                {formatCurrency(feeType.penalty_fixed)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                );

            case 'settings':
                return (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* System Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    System Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-medium">Active Status</div>
                                            <div className="text-sm text-gray-600">Whether this fee type is active</div>
                                        </div>
                                        <Badge className={feeType.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {feeType.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-medium">Mandatory</div>
                                            <div className="text-sm text-gray-600">Required for all applicable entities</div>
                                        </div>
                                        {feeType.is_mandatory ? (
                                            <Check className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <X className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-medium">Auto-generate</div>
                                            <div className="text-sm text-gray-600">Automatically create fees</div>
                                        </div>
                                        {feeType.auto_generate ? (
                                            <Check className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <X className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-medium">Approval Needed</div>
                                            <div className="text-sm text-gray-600">Requires approval before application</div>
                                        </div>
                                        {feeType.approval_needed ? (
                                            <Check className="h-5 w-5 text-yellow-600" />
                                        ) : (
                                            <X className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-medium">Sort Order</div>
                                            <div className="text-sm text-gray-600">Display order in lists</div>
                                        </div>
                                        <span className="font-mono">{feeType.sort_order || 'Default'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Frequency & Validity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5" />
                                    Frequency & Validity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-medium">Frequency</div>
                                            <div className="text-sm text-gray-600">How often this fee applies</div>
                                        </div>
                                        <Badge variant="outline">
                                            {getFrequencyLabel(feeType.frequency)}
                                        </Badge>
                                    </div>
                                    {feeType.validity_days && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium">Validity Period</div>
                                                <div className="text-sm text-gray-600">How long the fee is valid</div>
                                            </div>
                                            <span className="font-bold">{feeType.validity_days} days</span>
                                        </div>
                                    )}
                                    {feeType.due_day && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium">Due Day</div>
                                                <div className="text-sm text-gray-600">Day of month when due</div>
                                            </div>
                                            <span className="font-bold">{feeType.due_day}th</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dates Information */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Date Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6 md:grid-cols-3">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600 mb-1">Effective Date</div>
                                        <div className="text-2xl font-bold">{formatDate(feeType.effective_date)}</div>
                                        <div className="text-xs text-gray-500 mt-1">When this fee type becomes active</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600 mb-1">Expiry Date</div>
                                        <div className="text-2xl font-bold">
                                            {feeType.expiry_date ? formatDate(feeType.expiry_date) : 'No expiry'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {isExpired ? 'This fee type has expired' : 'When this fee type expires'}
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600 mb-1">Created On</div>
                                        <div className="text-2xl font-bold">{formatDate(feeType.created_at)}</div>
                                        <div className="text-xs text-gray-500 mt-1">When this fee type was created</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'fees':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Recent Fees
                                <Badge variant="secondary">{recentFees.length}</Badge>
                            </CardTitle>
                            <CardDescription>
                                Recently created fees using this fee type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentFees.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Fee ID</TableHead>
                                                <TableHead>Resident/Household</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Due Date</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentFees.map((fee) => (
                                                <TableRow key={fee.id}>
                                                    <TableCell className="font-mono">
                                                        {fee.code || `FEE-${fee.id}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        {fee.resident ? (
                                                            <div>
                                                                <div className="font-medium">{fee.resident.full_name}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    Resident • {fee.resident.purok}
                                                                </div>
                                                            </div>
                                                        ) : fee.household ? (
                                                            <div>
                                                                <div className="font-medium">{fee.household.household_number}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    Household • {fee.household.purok}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-500">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-bold">{formatCurrency(fee.amount)}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getFeeStatusClass(fee.status)}>
                                                            {fee.status.toUpperCase()}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{formatDate(fee.due_date)}</div>
                                                        {new Date(fee.due_date) < new Date() && fee.status === 'pending' && (
                                                            <div className="text-xs text-red-600">Overdue</div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route('fees.show', fee.id)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">No fees created yet</h3>
                                    <p className="text-gray-500 mb-6">
                                        No fees have been created using this fee type
                                    </p>
                                    <Button asChild>
                                        <Link href={route('fees.create', { fee_type: feeType.id })}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create First Fee
                                        </Link>
                                    </Button>
                                </div>
                            )}
                            {recentFees.length > 0 && (
                                <div className="mt-4 flex justify-center">
                                    <Button variant="outline" asChild>
                                        <Link href={route('fees.index', { fee_type: feeType.id })}>
                                            View All Associated Fees
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );

            case 'history':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                History & Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600 mb-1">Created On</div>
                                        <div className="text-lg font-bold">{formatDateTime(feeType.created_at)}</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600 mb-1">Last Updated</div>
                                        <div className="text-lg font-bold">{formatDateTime(feeType.updated_at)}</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm font-medium text-gray-600 mb-1">Total Fees</div>
                                        <div className="text-lg font-bold">{feeType.fees_count || 0}</div>
                                    </div>
                                </div>

                                {/* Statistics if available */}
                                {statistics && Object.keys(statistics).length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Financial Statistics</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-4 md:grid-cols-4">
                                                {statistics.total_collected !== undefined && (
                                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                                        <div className="text-sm font-medium text-gray-600 mb-1">Total Collected</div>
                                                        <div className="text-2xl font-bold text-green-700">
                                                            {formatCurrency(statistics.total_collected)}
                                                        </div>
                                                    </div>
                                                )}
                                                {statistics.total_pending !== undefined && (
                                                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                                        <div className="text-sm font-medium text-gray-600 mb-1">Total Pending</div>
                                                        <div className="text-2xl font-bold text-yellow-700">
                                                            {formatCurrency(statistics.total_pending)}
                                                        </div>
                                                    </div>
                                                )}
                                                {statistics.total_overdue !== undefined && (
                                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                                        <div className="text-sm font-medium text-gray-600 mb-1">Total Overdue</div>
                                                        <div className="text-2xl font-bold text-red-700">
                                                            {formatCurrency(statistics.total_overdue)}
                                                        </div>
                                                    </div>
                                                )}
                                                {statistics.average_amount !== undefined && (
                                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                        <div className="text-sm font-medium text-gray-600 mb-1">Average Amount</div>
                                                        <div className="text-2xl font-bold text-blue-700">
                                                            {formatCurrency(statistics.average_amount)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Notes if available */}
                                {feeType.notes && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <StickyNote className="h-5 w-5" />
                                                Notes
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-line">
                                                {feeType.notes}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <AppLayout
            title={`Fee Type: ${feeType.name}`}
            breadcrumbs={breadcrumbs}
        >
            <Head title={`Fee Type: ${feeType.name}`} />

            <div className="space-y-6">
                {/* Header with actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className={feeType.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {feeType.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge className={getCategoryColor(feeType.category)}>
                                {getCategoryLabel(feeType.category)}
                            </Badge>
                            {feeType.is_mandatory && (
                                <Badge variant="outline" className="text-red-600 border-red-200">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    Mandatory
                                </Badge>
                            )}
                            {feeType.auto_generate && (
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                    <Archive className="h-3 w-3 mr-1" />
                                    Auto-generate
                                </Badge>
                            )}
                            {feeType.approval_needed && (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    Approval Needed
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{feeType.name}</h1>
                        <div className="flex items-center gap-2 mt-1 text-gray-500">
                            <span className="font-mono text-sm">{feeType.code}</span>
                            {feeType.short_name && (
                                <>
                                    <span>•</span>
                                    <span>{feeType.short_name}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleStatus}
                            disabled={togglingStatus}
                        >
                            {togglingStatus ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : feeType.is_active ? (
                                <XCircle className="h-4 w-4 mr-2" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {feeType.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                        >
                            <Link href={route('fee-types.edit', feeType.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                        >
                            <Link href={route('fee-types.index')}>
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Back to List
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={duplicateFeeType}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={route('fees.index', { fee_type: feeType.id })}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        View Associated Fees
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={confirmDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Base Amount</p>
                                    <p className="text-2xl font-bold">{formatCurrency(feeType.base_amount)}</p>
                                </div>
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <DollarSign className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Fees</p>
                                    <p className="text-2xl font-bold">{feeType.fees_count || 0}</p>
                                </div>
                                <div className="rounded-lg bg-green-100 p-3">
                                    <FileText className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Frequency</p>
                                    <p className="text-2xl font-bold capitalize">
                                        {getFrequencyLabel(feeType.frequency)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <CalendarDays className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Applicable To</p>
                                    <p className="text-2xl font-bold text-sm truncate">
                                        {getApplicableToLabel(feeType.applicable_to)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-purple-100 p-3">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Custom Tabs Navigation */}
                <div className="border-b">
                    <div className="flex overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('pricing')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pricing'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Pricing Details
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('fees')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'fees'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Recent Fees
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            History
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {renderTabContent()}
                </div>
            </div>
        </AppLayout>
    );
}
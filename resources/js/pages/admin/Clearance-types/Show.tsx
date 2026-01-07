import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    FileText,
    DollarSign,
    Calendar,
    Clock,
    Users,
    File,
    CheckCircle,
    XCircle,
    Edit,
    Printer,
    ArrowLeft,
    Download,
    Copy,
    Eye,
    History,
    Shield,
    Globe,
    CreditCard,
    AlertCircle
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface DocumentType {
    id: number;
    name: string;
    code: string;
    description: string;
    category: string;
    is_required: boolean;
}

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description: string;
    fee: number | string;
    processing_days: number | string;
    validity_days: number | string;
    is_active: boolean;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    purpose_options: string;
    eligibility_criteria: any; // Changed to any to handle both string and array
    created_at: string;
    updated_at: string;
    clearances_count: number;
    document_types?: DocumentType[];
}

interface ShowClearanceTypeProps {
    clearanceType: ClearanceType;
    recentClearances?: Array<{
        id: number;
        resident_name: string;
        status: string;
        created_at: string;
    }>;
}

const getFieldLabel = (field: string) => {
    const fieldLabels: Record<string, string> = {
        'age': 'Age',
        'civil_status': 'Civil Status',
        'educational_attainment': 'Educational Attainment',
        'occupation': 'Occupation',
        'monthly_income': 'Monthly Income',
        'is_registered_voter': 'Registered Voter',
        'years_in_barangay': 'Years in Barangay',
        'has_pending_case': 'Has Pending Case',
        'is_senior_citizen': 'Senior Citizen',
        'is_pwd': 'Person with Disability',
        'is_single_parent': 'Single Parent',
        'is_indigent': 'Indigent',
    };
    return fieldLabels[field] || field;
};

const getOperatorLabel = (operator: string) => {
    const operatorLabels: Record<string, string> = {
        'equals': '=',
        'not_equals': '≠',
        'greater_than': '>',
        'less_than': '<',
        'greater_than_or_equal': '≥',
        'less_than_or_equal': '≤',
        'in': 'in',
        'not_in': 'not in',
        'contains': 'contains',
    };
    return operatorLabels[operator] || operator;
};

// Helper function to safely format fee
const formatFee = (fee: number | string): string => {
    if (fee === null || fee === undefined) {
        return '0.00';
    }
    
    const numFee = typeof fee === 'string' ? parseFloat(fee) : fee;
    
    if (isNaN(numFee)) {
        return '0.00';
    }
    
    return numFee.toFixed(2);
};

// Helper function to safely get number value
const getNumberValue = (value: number | string): number => {
    if (typeof value === 'number') {
        return value;
    }
    
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
};

// Helper function to safely parse eligibility criteria
const parseEligibilityCriteria = (criteria: any): Array<{
    field: string;
    operator: string;
    value: string;
}> => {
    try {
        // If it's already an array, return it
        if (Array.isArray(criteria)) {
            return criteria;
        }
        
        // If it's a string, try to parse it as JSON
        if (typeof criteria === 'string') {
            const parsed = JSON.parse(criteria);
            return Array.isArray(parsed) ? parsed : [];
        }
        
        // If it's null, undefined, or not an array, return empty array
        return [];
    } catch (error) {
        console.error('Error parsing eligibility criteria:', error);
        return [];
    }
};

// Helper function to safely get purpose options
const getPurposeOptions = (purposeOptions: string): string[] => {
    if (!purposeOptions) return [];
    
    try {
        // Check if it's already an array (might be stringified)
        if (typeof purposeOptions === 'string') {
            // Try to parse as JSON first
            try {
                const parsed = JSON.parse(purposeOptions);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (e) {
                // If not JSON, split by comma
                return purposeOptions.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
            }
        }
        
        // If it's already an array
        if (Array.isArray(purposeOptions)) {
            return purposeOptions;
        }
        
        return [];
    } catch (error) {
        console.error('Error parsing purpose options:', error);
        return [];
    }
};

export default function ShowClearanceType({ clearanceType, recentClearances = [] }: ShowClearanceTypeProps) {
    const [showAllDocuments, setShowAllDocuments] = useState(false);
    const [parsedEligibilityCriteria, setParsedEligibilityCriteria] = useState<Array<{
        field: string;
        operator: string;
        value: string;
    }>>([]);
    const [parsedPurposeOptions, setParsedPurposeOptions] = useState<string[]>([]);
    
    // Convert fee to number for display
    const fee = getNumberValue(clearanceType.fee);
    const processingDays = getNumberValue(clearanceType.processing_days);
    const validityDays = getNumberValue(clearanceType.validity_days);
    
    // Parse eligibility criteria and purpose options on component mount
    useEffect(() => {
        setParsedEligibilityCriteria(parseEligibilityCriteria(clearanceType.eligibility_criteria));
        setParsedPurposeOptions(getPurposeOptions(clearanceType.purpose_options));
    }, [clearanceType.eligibility_criteria, clearanceType.purpose_options]);
    
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };
    
    const formatRelativeTime = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (error) {
            return 'Invalid date';
        }
    };
    
    const displayedDocuments = showAllDocuments ? 
        (clearanceType.document_types || []) : 
        (clearanceType.document_types || []).slice(0, 3);

    return (
        <AppLayout
            title={clearanceType.name}
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearance Types', href: '/clearance-types' },
                { title: clearanceType.name, href: `/clearance-types/${clearanceType.id}` }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/clearance-types">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {clearanceType.name}
                                </h1>
                                <Badge variant={clearanceType.is_active ? "default" : "secondary"} className="ml-2">
                                    {clearanceType.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <code className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {clearanceType.code}
                                </code>
                                <span className="text-gray-500 text-sm">
                                    Created {formatRelativeTime(clearanceType.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                        </Button>
                        <Link href={`/clearance-types/${clearanceType.id}/edit`}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                    <p className="mt-1 text-gray-700 dark:text-gray-300">
                                        {clearanceType.description || 'No description provided.'}
                                    </p>
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Fee</h3>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                            <span className="text-xl font-bold">
                                                ₱{formatFee(clearanceType.fee)}
                                            </span>
                                            {!clearanceType.requires_payment && (
                                                <Badge variant="outline" className="text-xs">
                                                    Free
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Processing Time</h3>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="text-lg">
                                                {processingDays} day
                                                {processingDays !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Validity Period</h3>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-lg">
                                                {validityDays} day
                                                {validityDays !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Document Requirements */}
                        {clearanceType.document_types && clearanceType.document_types.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <File className="h-5 w-5" />
                                            Required Documents
                                            <Badge variant="outline" className="ml-2">
                                                {clearanceType.document_types.length} documents
                                            </Badge>
                                        </div>
                                        {clearanceType.document_types.length > 3 && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => setShowAllDocuments(!showAllDocuments)}
                                            >
                                                {showAllDocuments ? 'Show Less' : 'Show All'}
                                            </Button>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {displayedDocuments.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                        doc.is_required ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        <File className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {doc.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Badge variant="outline" className="text-xs">
                                                                {doc.category}
                                                            </Badge>
                                                            {doc.is_required && (
                                                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                                                    Required
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {doc.code}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Eligibility Criteria */}
                        {parsedEligibilityCriteria.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Eligibility Criteria
                                        <Badge variant="outline" className="ml-2">
                                            {parsedEligibilityCriteria.length} criteria
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        Requirements that applicants must meet
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {parsedEligibilityCriteria.map((criterion, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{getFieldLabel(criterion.field)}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Must be {getOperatorLabel(criterion.operator)} {criterion.value}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Purpose Options */}
                        {parsedPurposeOptions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Purpose Options</CardTitle>
                                    <CardDescription>
                                        Common purposes for this clearance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {parsedPurposeOptions.map((purpose, index) => (
                                            <Badge key={index} variant="secondary">
                                                {purpose}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Summary & Actions */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status & Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <Badge variant={clearanceType.is_active ? "default" : "secondary"}>
                                        {clearanceType.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Payment Required</span>
                                    {clearanceType.requires_payment ? (
                                        <div className="flex items-center gap-1 text-emerald-600">
                                            <CreditCard className="h-4 w-4" />
                                            <span>Yes</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">No</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Approval Required</span>
                                    {clearanceType.requires_approval ? (
                                        <div className="flex items-center gap-1 text-amber-600">
                                            <Shield className="h-4 w-4" />
                                            <span>Yes</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">No</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Online Only</span>
                                    {clearanceType.is_online_only ? (
                                        <div className="flex items-center gap-1 text-blue-600">
                                            <Globe className="h-4 w-4" />
                                            <span>Yes</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">No</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/clearance-types/${clearanceType.id}/edit`} className="w-full">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Clearance Type
                                    </Button>
                                </Link>
                                <Button variant="outline" className="w-full justify-start">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Details
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate Type
                                </Button>
                                <Link href={`/clearances?type=${clearanceType.id}`} className="w-full">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Clearances
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {clearanceType.clearances_count || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Clearances</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <p className="text-xl font-bold">₱{formatFee(clearanceType.fee)}</p>
                                        <p className="text-xs text-gray-600">Fee per Clearance</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <p className="text-xl font-bold">{processingDays}</p>
                                        <p className="text-xs text-gray-600">Processing Days</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        {recentClearances.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="h-5 w-5" />
                                        Recent Clearances
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentClearances.map((clearance) => (
                                            <div key={clearance.id} className="flex items-center justify-between text-sm">
                                                <div className="truncate">
                                                    <p className="font-medium truncate">{clearance.resident_name}</p>
                                                    <p className="text-gray-500 text-xs">
                                                        {formatRelativeTime(clearance.created_at)}
                                                    </p>
                                                </div>
                                                <Badge variant={
                                                    clearance.status === 'approved' ? 'default' :
                                                    clearance.status === 'pending' ? 'outline' :
                                                    clearance.status === 'rejected' ? 'destructive' : 'secondary'
                                                }>
                                                    {clearance.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                    {recentClearances.length >= 5 && (
                                        <Link 
                                            href={`/clearances?type=${clearanceType.id}`}
                                            className="text-sm text-blue-600 hover:underline mt-3 inline-block"
                                        >
                                            View all clearances →
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* System Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>System Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <h3 className="text-xs font-medium text-gray-500">Created</h3>
                                    <p>{formatDate(clearanceType.created_at)}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-medium text-gray-500">Last Updated</h3>
                                    <p>{formatDate(clearanceType.updated_at)}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-medium text-gray-500">Clearance Type ID</h3>
                                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                        {clearanceType.id}
                                    </code>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Danger Zone */}
                <Card className="border-red-200 dark:border-red-800">
                    <CardHeader>
                        <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                        <CardDescription>
                            Irreversible actions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Deactivate Clearance Type</p>
                                <p className="text-sm text-gray-500">
                                    This will make the clearance type unavailable for new applications
                                </p>
                            </div>
                            <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                                {clearanceType.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-red-600">Delete Clearance Type</p>
                                <p className="text-sm text-gray-500">
                                    Permanently remove this clearance type from the system
                                </p>
                                {clearanceType.clearances_count > 0 && (
                                    <div className="flex items-center gap-2 mt-2 text-amber-600 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Cannot delete: {clearanceType.clearances_count} clearances exist</span>
                                    </div>
                                )}
                            </div>
                            <Button 
                                variant="destructive" 
                                size="sm"
                                disabled={clearanceType.clearances_count > 0}
                            >
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
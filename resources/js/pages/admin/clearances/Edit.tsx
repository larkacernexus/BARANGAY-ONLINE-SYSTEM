// resources/js/Pages/Clearances/Edit.tsx
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    ArrowLeft,
    Save,
    FileText,
    User,
    Calendar,
    DollarSign,
    Clock,
    AlertCircle,
    Zap,
    FileCheck,
    Shield,
    Loader2
} from 'lucide-react';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    description: string;
    fee: number;
    formatted_fee: string;
    processing_days: number;
    validity_days: number;
    requires_payment: boolean;
    requires_approval: boolean;
    is_online_only: boolean;
    requirements?: string[];
    purpose_options?: string;
}

interface Resident {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    full_name: string;
    middle_name?: string;
    age?: number;
    contact_number: string;
    address: string;
    purok: string;
    purok_id?: number;
}

interface PageProps {
    clearance: any;
    clearanceTypes: ClearanceType[]; // Fixed: This is now passed from controller
    purposeOptions?: string[];
    activeClearanceTypes?: ClearanceType[];
}

const formatCurrency = (amount: any): string => {
    if (typeof amount === 'number') {
        return `₱${amount.toFixed(2)}`;
    }
    const num = parseFloat(amount);
    return `₱${isNaN(num) ? '0.00' : num.toFixed(2)}`;
};

const getFeeAsNumber = (fee: any): number => {
    if (typeof fee === 'number') {
        return fee;
    }
    if (typeof fee === 'string') {
        // Remove currency symbols and commas
        const cleaned = fee.replace(/[₱,]/g, '').trim();
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }
    return 0;
};

export default function EditClearance() {
    const { props } = usePage<PageProps>();
    const { clearance, clearanceTypes = [], purposeOptions = [] } = props;
    
    // Use clearanceTypes from props (controller returns it)
    const availableTypes = useMemo(() => 
        clearanceTypes || [], 
        [clearanceTypes]
    );
    
    const [selectedClearanceType, setSelectedClearanceType] = useState<ClearanceType | null>(() => {
        // Find the clearance type that matches the clearance's type ID
        if (clearance.clearance_type_id && availableTypes.length > 0) {
            const type = availableTypes.find(t => t.id === clearance.clearance_type_id);
            return type || null;
        }
        return null;
    });
    
    const { data, setData, put, processing, errors } = useForm({
        purpose: clearance.purpose || '',
        specific_purpose: clearance.specific_purpose || '',
        clearance_type_id: clearance.clearance_type_id?.toString() || '',
        urgency: clearance.urgency || 'normal',
        needed_date: clearance.needed_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        additional_requirements: clearance.additional_requirements || '',
        fee_amount: clearance.fee_amount || 0,
        remarks: clearance.remarks || '',
        admin_notes: clearance.admin_notes || '',
    });

    // Update fee amount and auto-calculate urgency fee when clearance type or urgency changes
    useEffect(() => {
        if (selectedClearanceType && (clearance.status === 'pending' || clearance.status === 'pending_payment')) {
            let fee = getFeeAsNumber(selectedClearanceType.fee);
            
            if (data.urgency === 'rush') {
                fee *= 1.5;
            } else if (data.urgency === 'express') {
                fee *= 2.0;
            }
            
            // Only update if the fee changed significantly (more than 0.01 difference)
            const currentFee = typeof data.fee_amount === 'number' ? data.fee_amount : parseFloat(data.fee_amount) || 0;
            if (Math.abs(fee - currentFee) > 0.01) {
                setData('fee_amount', parseFloat(fee.toFixed(2)));
            }
        }
    }, [selectedClearanceType, data.urgency]); // Removed setData and clearance.status from dependencies

    const handleSelectClearanceType = (typeId: string) => {
        const type = availableTypes.find(t => t.id.toString() === typeId);
        setSelectedClearanceType(type || null);
        setData('clearance_type_id', typeId);
    };

    const handleUrgencyChange = (urgency: 'normal' | 'rush' | 'express') => {
        setData('urgency', urgency);
        
        // Recalculate fee when urgency changes (only for editable statuses)
        if (selectedClearanceType && (clearance.status === 'pending' || clearance.status === 'pending_payment')) {
            let fee = getFeeAsNumber(selectedClearanceType.fee);
            
            if (urgency === 'rush') {
                fee *= 1.5;
            } else if (urgency === 'express') {
                fee *= 2.0;
            }
            
            setData('fee_amount', parseFloat(fee.toFixed(2)));
        }
    };

    const calculateEstimatedProcessingDays = () => {
        if (!selectedClearanceType) return 0;
        
        let days = selectedClearanceType.processing_days;
        
        if (data.urgency === 'rush') {
            days = Math.max(1, Math.ceil(days * 0.5));
        } else if (data.urgency === 'express') {
            days = 1;
        }
        
        return days;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Ensure fee_amount is a number
        const formData = {
            ...data,
            fee_amount: parseFloat(data.fee_amount.toString()) || 0
        };
        
        put(`/clearances/${clearance.id}`, formData);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not specified';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    // Get requirements from selected type or use default
    const getRequirements = () => {
        if (selectedClearanceType?.requirements) {
            if (Array.isArray(selectedClearanceType.requirements)) {
                return selectedClearanceType.requirements;
            }
            return [];
        }
        return [
            'Valid ID presented',
            'Proof of residency',
            'Barangay clearance fee payment receipt',
            'Recent 2x2 ID picture',
        ];
    };

    // Get purpose options from clearance type or use default
    const getPurposeOptions = () => {
        if (purposeOptions && purposeOptions.length > 0) {
            return purposeOptions;
        }
        
        // Default purpose options
        return [
            'Employment',
            'Business Registration',
            'Travel',
            'School Requirement',
            'Government Transaction',
            'Loan Application',
            'Other',
        ];
    };

    const requirements = getRequirements();
    const purposeOptionsList = getPurposeOptions();

    // Determine which fields can be edited based on status
    const canEditType = ['pending', 'pending_payment'].includes(clearance.status);
    const canEditFee = ['pending', 'pending_payment', 'processing', 'approved'].includes(clearance.status);
    const canEditPurpose = !['issued', 'rejected', 'cancelled', 'expired'].includes(clearance.status);
    const canEditUrgency = ['pending', 'pending_payment'].includes(clearance.status);
    const canEditNeededDate = !['issued', 'rejected', 'cancelled', 'expired'].includes(clearance.status);
    const canEditAdditionalRequirements = !['issued', 'rejected', 'cancelled', 'expired'].includes(clearance.status);
    const canEditSpecificPurpose = !['issued', 'rejected', 'cancelled', 'expired'].includes(clearance.status);
    
    const isIssued = clearance.status === 'issued';
    const isEditable = !['issued', 'rejected', 'cancelled', 'expired'].includes(clearance.status);

    // Show loading state if clearance types aren't loaded yet
    if (availableTypes.length === 0) {
        return (
            <AppLayout
                title="Edit Clearance Request"
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Clearance Requests', href: '/clearances' },
                    { title: clearance.reference_number, href: `/clearances/${clearance.id}` },
                    { title: 'Edit', href: `/clearances/${clearance.id}/edit` }
                ]}
            >
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                        <p className="mt-2 text-gray-600">Loading clearance types...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Edit Clearance Request"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearance Requests', href: '/clearances' },
                { title: clearance.reference_number, href: `/clearances/${clearance.id}` },
                { title: 'Edit', href: `/clearances/${clearance.id}/edit` }
            ]}
        >
            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/clearances/${clearance.id}`}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to View
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Edit Clearance Request
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={
                                        clearance.status === 'issued' ? "default" :
                                        clearance.status === 'approved' ? "secondary" :
                                        clearance.status === 'pending_payment' ? "outline" :
                                        clearance.status === 'pending' ? "outline" :
                                        clearance.status === 'processing' ? "outline" :
                                        clearance.status === 'rejected' ? "destructive" :
                                        clearance.status === 'cancelled' ? "destructive" :
                                        "outline"
                                    }>
                                        {clearance.status_display || clearance.status}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                        {clearance.reference_number}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button type="submit" disabled={processing || !isEditable}>
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Status Alert */}
                    {!isEditable && (
                        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                            <AlertTitle>Editing Restricted</AlertTitle>
                            <AlertDescription className="mt-2">
                                This clearance request is in <strong>{clearance.status_display}</strong> status and cannot be edited. 
                                Only administrative notes can be updated.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Alert */}
                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-lg bg-rose-50 p-4 dark:bg-rose-900/20">
                            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
                                <AlertCircle className="h-5 w-5" />
                                <span className="font-medium">Please fix the following errors:</span>
                            </div>
                            <ul className="mt-2 ml-7 list-disc text-sm text-rose-700 dark:text-rose-400">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Request Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Applicant Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Applicant Information
                                    </CardTitle>
                                    <CardDescription>
                                        Resident details for this clearance request
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {clearance.resident ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-lg">{clearance.resident.full_name || clearance.resident.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {clearance.resident.id} • {clearance.resident.contact_number || 'No contact'}
                                                    </div>
                                                </div>
                                                <Link href={`/residents/${clearance.resident.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        View Profile
                                                    </Button>
                                                </Link>
                                            </div>

                                            <Separator />

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>Contact Number</Label>
                                                    <Input value={clearance.resident.contact_number || 'N/A'} readOnly />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Address</Label>
                                                    <Input value={clearance.resident.address || 'N/A'} readOnly />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <User className="h-8 w-8 mx-auto text-gray-400" />
                                            <p className="text-gray-500 mt-2">Resident information not available</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Clearance Request Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Clearance Request Details
                                    </CardTitle>
                                    {!isEditable && (
                                        <CardDescription className="text-amber-600">
                                            Most fields are locked because this request is in {clearance.status_display} status
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="clearance_type_id">
                                            Clearance Type {canEditType && <span className="text-rose-500">*</span>}
                                        </Label>
                                        <Select
                                            value={data.clearance_type_id}
                                            onValueChange={handleSelectClearanceType}
                                            required={canEditType}
                                            disabled={!canEditType || processing}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableTypes.map(type => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{type.name}</span>
                                                            <span className="text-sm text-gray-500">
                                                                {formatCurrency(type.fee)}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.clearance_type_id && (
                                            <p className="text-sm text-rose-600">{errors.clearance_type_id}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="urgency">
                                                Processing Urgency {canEditUrgency && <span className="text-rose-500">*</span>}
                                            </Label>
                                            <Select
                                                value={data.urgency}
                                                onValueChange={(value: 'normal' | 'rush' | 'express') => handleUrgencyChange(value)}
                                                required={canEditUrgency}
                                                disabled={!canEditUrgency || processing}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="normal">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            <span>Normal ({selectedClearanceType?.processing_days || 3} days)</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="rush">
                                                        <div className="flex items-center gap-2">
                                                            <Zap className="h-4 w-4 text-amber-600" />
                                                            <span>Rush (+50% fee, 50% faster)</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="express">
                                                        <div className="flex items-center gap-2">
                                                            <Zap className="h-4 w-4 text-orange-600" />
                                                            <span>Express (+100% fee, 1-day processing)</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="needed_date">
                                                Needed By Date {canEditNeededDate && <span className="text-rose-500">*</span>}
                                            </Label>
                                            <Input
                                                id="needed_date"
                                                type="date"
                                                value={data.needed_date}
                                                onChange={e => setData('needed_date', e.target.value)}
                                                required={canEditNeededDate}
                                                disabled={!canEditNeededDate || processing}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            {errors.needed_date && (
                                                <p className="text-sm text-rose-600">{errors.needed_date}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="purpose">
                                            Purpose {canEditPurpose && <span className="text-rose-500">*</span>}
                                        </Label>
                                        <Select
                                            value={data.purpose}
                                            onValueChange={value => setData('purpose', value)}
                                            required={canEditPurpose}
                                            disabled={!canEditPurpose || processing}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select purpose" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {purposeOptionsList.map((purpose, index) => (
                                                    <SelectItem key={index} value={purpose}>
                                                        {purpose}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="other">Other (specify below)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {data.purpose === 'other' && (
                                            <Input
                                                placeholder="Please specify purpose..."
                                                onChange={e => setData('purpose', e.target.value)}
                                                className="mt-2"
                                                disabled={!canEditPurpose || processing}
                                            />
                                        )}
                                        {errors.purpose && (
                                            <p className="text-sm text-rose-600">{errors.purpose}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="specific_purpose">Specific Purpose Details (Optional)</Label>
                                        <Textarea
                                            id="specific_purpose"
                                            value={data.specific_purpose}
                                            onChange={e => setData('specific_purpose', e.target.value)}
                                            placeholder="Provide more specific details about the purpose..."
                                            rows={2}
                                            disabled={!canEditSpecificPurpose || processing}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="additional_requirements">Additional Requirements/Special Requests</Label>
                                        <Textarea
                                            id="additional_requirements"
                                            value={data.additional_requirements}
                                            onChange={e => setData('additional_requirements', e.target.value)}
                                            placeholder="Any special requirements or additional documents needed..."
                                            rows={3}
                                            disabled={!canEditAdditionalRequirements || processing}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fee_amount">Fee Amount</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <Input
                                                id="fee_amount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.fee_amount}
                                                onChange={e => setData('fee_amount', parseFloat(e.target.value) || 0)}
                                                className="pl-10"
                                                disabled={!canEditFee || processing}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {selectedClearanceType?.requires_payment ? 
                                                "Fee includes urgency surcharge if applicable" : 
                                                "Free service - no payment required"}
                                        </div>
                                        {errors.fee_amount && (
                                            <p className="text-sm text-rose-600">{errors.fee_amount}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Requirements Checklist */}
                            {requirements.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileCheck className="h-5 w-5" />
                                            Requirements Checklist
                                        </CardTitle>
                                        <CardDescription>
                                            Required documents for this clearance type
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {requirements.map((requirement, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <div className="mt-0.5">•</div>
                                                    <span>{requirement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4 text-sm text-gray-500">
                                            <p>Note: These requirements will need to be verified during processing.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="remarks">Remarks/Notes (Visible to Resident)</Label>
                                        <Textarea
                                            id="remarks"
                                            value={data.remarks}
                                            onChange={e => setData('remarks', e.target.value)}
                                            placeholder="Additional notes or special conditions visible to resident..."
                                            rows={3}
                                            disabled={processing}
                                        />
                                        {errors.remarks && (
                                            <p className="text-sm text-rose-600">{errors.remarks}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="admin_notes" className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            Administrative Notes (Internal Only)
                                        </Label>
                                        <Textarea
                                            id="admin_notes"
                                            value={data.admin_notes}
                                            onChange={e => setData('admin_notes', e.target.value)}
                                            placeholder="Internal notes for administrators only..."
                                            rows={3}
                                            disabled={processing}
                                        />
                                        {errors.admin_notes && (
                                            <p className="text-sm text-rose-600">{errors.admin_notes}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Preview & Summary */}
                        <div className="space-y-6">
                            {/* Request Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Request Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Resident</div>
                                            <div className="font-medium">
                                                {clearance.resident ? (clearance.resident.full_name || clearance.resident.name) : 'Not available'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Clearance Type</div>
                                            <div className="font-medium">
                                                {selectedClearanceType ? selectedClearanceType.name : 'Not selected'}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Urgency</div>
                                                <div className="font-medium flex items-center gap-1">
                                                    {data.urgency === 'rush' ? (
                                                        <>
                                                            <Zap className="h-3 w-3 text-amber-600" />
                                                            <span className="capitalize">{data.urgency} (1.5x)</span>
                                                        </>
                                                    ) : data.urgency === 'express' ? (
                                                        <>
                                                            <Zap className="h-3 w-3 text-orange-600" />
                                                            <span className="capitalize">{data.urgency} (2x)</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="h-3 w-3" />
                                                            <span className="capitalize">{data.urgency}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Fee</div>
                                                <div className="font-medium flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    {formatCurrency(data.fee_amount)}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Processing</div>
                                            <div className="font-medium flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {calculateEstimatedProcessingDays()} days
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Needed By</div>
                                            <div className="font-medium flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(data.needed_date)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Current Status</div>
                                            <div className="font-medium">
                                                <Badge variant={
                                                    clearance.status === 'issued' ? "default" :
                                                    clearance.status === 'approved' ? "secondary" :
                                                    clearance.status === 'pending_payment' ? "outline" :
                                                    clearance.status === 'pending' ? "outline" :
                                                    clearance.status === 'processing' ? "outline" :
                                                    clearance.status === 'rejected' ? "destructive" :
                                                    clearance.status === 'cancelled' ? "destructive" :
                                                    "outline"
                                                }>
                                                    {clearance.status_display || clearance.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Clearance Type Details */}
                            {selectedClearanceType && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Type Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Description</div>
                                                <div className="text-sm font-medium">{selectedClearanceType.description}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Normal Processing</div>
                                                    <div className="text-sm font-medium flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {selectedClearanceType.processing_days} days
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Validity Period</div>
                                                    <div className="text-sm font-medium flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {selectedClearanceType.validity_days} days
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedClearanceType.requires_payment && (
                                                    <Badge variant="default">
                                                        <DollarSign className="h-3 w-3 mr-1" />
                                                        Paid Service
                                                    </Badge>
                                                )}
                                                {selectedClearanceType.requires_approval && (
                                                    <Badge variant="secondary">
                                                        <Shield className="h-3 w-3 mr-1" />
                                                        Needs Approval
                                                    </Badge>
                                                )}
                                                {selectedClearanceType.is_online_only && (
                                                    <Badge variant="outline">
                                                        Online Only
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Processing Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Processing Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Completion</div>
                                            <div className="font-medium">
                                                {calculateEstimatedProcessingDays()} business day{calculateEstimatedProcessingDays() !== 1 ? 's' : ''}
                                            </div>
                                            {calculateEstimatedProcessingDays() > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    By: {(() => {
                                                        const today = new Date();
                                                        const completionDate = new Date(today);
                                                        // Add business days (skip weekends)
                                                        let daysAdded = 0;
                                                        while (daysAdded < calculateEstimatedProcessingDays()) {
                                                            completionDate.setDate(completionDate.getDate() + 1);
                                                            // Skip weekends (0 = Sunday, 6 = Saturday)
                                                            if (completionDate.getDay() !== 0 && completionDate.getDay() !== 6) {
                                                                daysAdded++;
                                                            }
                                                        }
                                                        return completionDate.toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        });
                                                    })()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Current Status</div>
                                            <div className="flex items-center gap-2">
                                                {selectedClearanceType?.requires_payment && data.fee_amount > 0 ? (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                        <DollarSign className="h-3 w-3 mr-1" />
                                                        Pending Payment
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {clearance.status_display}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Payment Requirement</div>
                                            <div className="flex items-center gap-2">
                                                {selectedClearanceType?.requires_payment ? (
                                                    <Badge variant="default" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                        <DollarSign className="h-3 w-3 mr-1" />
                                                        Payment Required
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                        <FileCheck className="h-3 w-3 mr-1" />
                                                        Free Service
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Approval Required</div>
                                            <div className="flex items-center gap-2">
                                                {selectedClearanceType?.requires_approval ? (
                                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                        <Shield className="h-3 w-3 mr-1" />
                                                        Needs Approval
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                        <FileCheck className="h-3 w-3 mr-1" />
                                                        Direct Processing
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {data.additional_requirements && (
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Special Notes</div>
                                                <div className="text-sm font-medium bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                                    <p className="text-blue-700 dark:text-blue-300">{data.additional_requirements}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Processing Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Processing Timeline</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Current Status:</span>
                                                <Badge variant="outline">
                                                    {clearance.status_display}
                                                </Badge>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ 
                                                    width: clearance.status === 'issued' ? '100%' :
                                                           clearance.status === 'approved' ? '75%' :
                                                           clearance.status === 'processing' ? '50%' :
                                                           clearance.status === 'pending_payment' ? '25%' :
                                                           clearance.status === 'pending' ? '10%' : '0%'
                                                }} />
                                            </div>
                                        </div>
                                        
                                        <div className="text-sm space-y-2">
                                            <div className={`flex items-center gap-2 ${['pending', 'pending_payment', 'processing', 'approved', 'issued'].includes(clearance.status) ? 'text-blue-600' : 'text-gray-500'}`}>
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                <span>Request Created ✓</span>
                                            </div>
                                            {selectedClearanceType?.requires_payment && data.fee_amount > 0 && (
                                                <div className={`flex items-center gap-2 ${['processing', 'approved', 'issued'].includes(clearance.status) ? 'text-blue-600' : 'text-gray-500'}`}>
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <span>Payment Processed {['processing', 'approved', 'issued'].includes(clearance.status) ? '✓' : ''}</span>
                                                </div>
                                            )}
                                            <div className={`flex items-center gap-2 ${['approved', 'issued'].includes(clearance.status) ? 'text-blue-600' : 'text-gray-500'}`}>
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                <span>Document Verification {['approved', 'issued'].includes(clearance.status) ? '✓' : ''}</span>
                                            </div>
                                            <div className={`flex items-center gap-2 ${['issued'].includes(clearance.status) ? 'text-blue-600' : 'text-gray-500'}`}>
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                <span>Approval {['issued'].includes(clearance.status) ? '✓' : ''}</span>
                                            </div>
                                            <div className={`flex items-center gap-2 ${['issued'].includes(clearance.status) ? 'text-blue-600' : 'text-gray-500'}`}>
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                <span>Issuance {['issued'].includes(clearance.status) ? '✓' : ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Form Actions */}
                            <Card>
                                <CardContent className="space-y-3 pt-6">
                                    <Button 
                                        type="submit" 
                                        className="w-full"
                                        disabled={processing || !isEditable}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving Changes...
                                            </>
                                        ) : !isEditable ? (
                                            <>
                                                <AlertCircle className="h-4 w-4 mr-2" />
                                                Cannot Edit in Current Status
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                    <Link href={`/clearances/${clearance.id}`}>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            className="w-full"
                                            disabled={processing}
                                        >
                                            Cancel
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
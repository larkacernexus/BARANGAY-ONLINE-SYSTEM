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
    Search,
    Clock,
    AlertCircle,
    Zap,
    Info,
    FileCheck,
    Shield,
    Loader2
} from 'lucide-react';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
    middle_name?: string;
    age?: number;
    contact_number: string;
    address: string;
    purok: string;
    purok_id?: number;
}

interface PageProps {
    residents: Resident[];
    clearanceTypes: ClearanceType[];
    activeClearanceTypes: ClearanceType[];
    purposeOptions: string[];
    requestData?: {
        resident_id?: string;
        clearance_type_id?: string;
        purpose?: string;
        fee_amount?: string;
        reference_number?: string;
        needed_date?: string;
    };
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
    const num = parseFloat(fee);
    return isNaN(num) ? 0 : num;
};

const getUrlParams = () => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
        resident_id: params.get('resident_id') || '',
        clearance_type_id: params.get('clearance_type_id') || '',
        purpose: params.get('purpose') || '',
        fee_amount: params.get('fee_amount') || '',
        reference_number: params.get('reference_number') || '',
        needed_date: params.get('needed_date') || '',
    };
};

export default function CreateClearanceRequest() {
    const { props } = usePage<PageProps>();
    const { residents, clearanceTypes, activeClearanceTypes, purposeOptions } = props;
    
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [selectedClearanceType, setSelectedClearanceType] = useState<ClearanceType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredResidents, setFilteredResidents] = useState<Resident[]>(residents.slice(0, 10));
    const [isFromRequest, setIsFromRequest] = useState(false);
    const [sourceRequestInfo, setSourceRequestInfo] = useState<{
        reference_number?: string;
        needed_date?: string;
    }>({});
    
    // REMOVED: issuing_officer and requested_by_user_id from form data
    const { data, setData, post, processing, errors } = useForm({
        resident_id: '',
        clearance_type_id: '',
        purpose: '',
        specific_purpose: '',
        urgency: 'normal' as 'normal' | 'rush' | 'express',
        needed_date: new Date().toISOString().split('T')[0],
        additional_requirements: '',
        fee_amount: 0,
        remarks: '',
        // issuing_officer REMOVED - will be auto-set by backend
        // requested_by_user_id REMOVED - not needed anymore
    });

    // Check URL parameters on component mount
    useEffect(() => {
        const urlParams = getUrlParams();
        
        // Check if we have request data (for approval flow)
        if (urlParams.resident_id || urlParams.clearance_type_id) {
            setIsFromRequest(true);
            setSourceRequestInfo({
                reference_number: urlParams.reference_number,
                needed_date: urlParams.needed_date,
            });
            
            // Pre-fill resident if ID is provided
            if (urlParams.resident_id) {
                const residentId = urlParams.resident_id;
                const resident = residents.find(r => r.id.toString() === residentId);
                if (resident) {
                    setSelectedResident(resident);
                    setData('resident_id', residentId);
                }
            }
            
            // Pre-fill clearance type if ID is provided
            if (urlParams.clearance_type_id) {
                const typeId = urlParams.clearance_type_id;
                const type = clearanceTypes.find(t => t.id.toString() === typeId);
                if (type) {
                    setSelectedClearanceType(type);
                    setData('clearance_type_id', typeId);
                }
            }
            
            // Pre-fill purpose
            if (urlParams.purpose) {
                setData('purpose', urlParams.purpose);
            }
            
            // Pre-fill fee amount
            if (urlParams.fee_amount) {
                setData('fee_amount', parseFloat(urlParams.fee_amount) || 0);
            }
            
            // Pre-fill needed date
            if (urlParams.needed_date) {
                setData('needed_date', urlParams.needed_date);
            }
            
            // Add remark about source request
            if (urlParams.reference_number) {
                setData('remarks', `Created from online request: ${urlParams.reference_number}`);
            }
        }
    }, []);

    // Filter residents based on search term
    useEffect(() => {
        if (searchTerm.trim()) {
            const results = residents.filter(resident =>
                resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resident.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resident.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resident.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resident.contact_number.includes(searchTerm)
            );
            setFilteredResidents(results);
        } else {
            setFilteredResidents(residents.slice(0, 10));
        }
    }, [searchTerm, residents]);

    // Update fee amount and auto-calculate urgency fee
    useEffect(() => {
        if (selectedClearanceType) {
            let fee = getFeeAsNumber(selectedClearanceType.fee);
            
            // Apply urgency multipliers
            if (data.urgency === 'rush') {
                fee *= 1.5;
            } else if (data.urgency === 'express') {
                fee *= 2.0;
            }
            
            setData('clearance_type_id', selectedClearanceType.id.toString());
            
            // Only update fee if we're not coming from a request
            if (!isFromRequest) {
                setData('fee_amount', fee);
            }
        }
    }, [selectedClearanceType, data.urgency, setData]);

    const handleSelectResident = (resident: Resident) => {
        setSelectedResident(resident);
        setData('resident_id', resident.id.toString());
        setSearchTerm('');
    };

    const handleSelectClearanceType = (typeId: string) => {
        const type = clearanceTypes.find(t => t.id.toString() === typeId);
        setSelectedClearanceType(type || null);
    };

    const handleUrgencyChange = (urgency: 'normal' | 'rush' | 'express') => {
        setData('urgency', urgency);
        
        // Recalculate fee when urgency changes
        if (selectedClearanceType) {
            let fee = getFeeAsNumber(selectedClearanceType.fee);
            
            if (urgency === 'rush') {
                fee *= 1.5;
            } else if (urgency === 'express') {
                fee *= 2.0;
            }
            
            setData('fee_amount', fee);
        }
    };

    const calculateEstimatedProcessingDays = () => {
        if (!selectedClearanceType) return 0;
        
        let days = selectedClearanceType.processing_days;
        
        if (data.urgency === 'rush') {
            days = Math.ceil(days * 0.5);
        } else if (data.urgency === 'express') {
            days = 1;
        }
        
        return days;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // REMOVED: No need to set issuing_officer anymore
        // The backend will automatically use the logged-in admin
        post('/clearances');
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

    const requirements = getRequirements();

    return (
        <AppLayout
            title="Create Clearance Request"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clearance Requests', href: '/clearances' },
                { title: 'Create Request', href: '/clearances/create' }
            ]}
        >
            <form onSubmit={submit}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/clearances">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {isFromRequest ? 'Process Online Request' : 'Create Clearance Request'}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {isFromRequest 
                                        ? 'Review and process an online clearance request'
                                        : 'Create a clearance request for a resident'}
                                </p>
                            </div>
                        </div>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isFromRequest ? 'Process Request' : 'Create Request'}
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Source Request Info Alert */}
                    {isFromRequest && sourceRequestInfo.reference_number && (
                        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                            <AlertTitle>Processing Online Request</AlertTitle>
                            <AlertDescription className="mt-2">
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Reference No:</span>
                                            <div className="text-blue-700 dark:text-blue-300">
                                                {sourceRequestInfo.reference_number}
                                            </div>
                                        </div>
                                        {sourceRequestInfo.needed_date && (
                                            <div>
                                                <span className="font-medium">Requested Needed By:</span>
                                                <div className="text-blue-700 dark:text-blue-300">
                                                    {formatDate(sourceRequestInfo.needed_date)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm text-blue-600 dark:text-blue-400">
                                        This request was submitted online. Details have been pre-filled.
                                    </div>
                                </div>
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
                                        Information about the person requesting clearance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="resident-search">
                                                Select Resident <span className="text-rose-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                <Input 
                                                    id="resident-search"
                                                    placeholder="Search resident by name, address, or contact number..." 
                                                    className="pl-10"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {!selectedResident && filteredResidents.length > 0 && (
                                            <div className="border rounded-lg p-2 space-y-2 max-h-60 overflow-y-auto">
                                                {filteredResidents.map(resident => (
                                                    <div 
                                                        key={resident.id}
                                                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer border"
                                                        onClick={() => handleSelectResident(resident)}
                                                    >
                                                        <div className="font-medium">{resident.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {resident.address} • {resident.contact_number}
                                                            {resident.purok && ` • ${resident.purok}`}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {selectedResident && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-lg">{selectedResident.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {selectedResident.id} • {selectedResident.contact_number}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedResident(null);
                                                            setData('resident_id', '');
                                                            setSearchTerm('');
                                                        }}
                                                    >
                                                        Change
                                                    </Button>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label>Contact Number</Label>
                                                        <Input value={selectedResident.contact_number} readOnly />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Address</Label>
                                                        <Input value={selectedResident.address} readOnly />
                                                    </div>
                                                    {selectedResident.purok && (
                                                        <div className="space-y-2">
                                                            <Label>Purok</Label>
                                                            <Input value={selectedResident.purok} readOnly />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {errors.resident_id && (
                                        <p className="text-sm text-rose-600">{errors.resident_id}</p>
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
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="clearance_type_id">
                                            Clearance Type <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.clearance_type_id}
                                            onValueChange={handleSelectClearanceType}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {activeClearanceTypes.map(type => (
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
                                                Processing Urgency <span className="text-rose-500">*</span>
                                            </Label>
                                            <Select
                                                value={data.urgency}
                                                onValueChange={(value: 'normal' | 'rush' | 'express') => handleUrgencyChange(value)}
                                                required
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
                                                Needed By Date <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="needed_date"
                                                type="date"
                                                value={data.needed_date}
                                                onChange={e => setData('needed_date', e.target.value)}
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            {errors.needed_date && (
                                                <p className="text-sm text-rose-600">{errors.needed_date}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="purpose">
                                            Purpose <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.purpose}
                                            onValueChange={value => setData('purpose', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select purpose" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {purposeOptions.map((purpose, index) => (
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
                                        <Label htmlFor="remarks">Remarks/Notes</Label>
                                        <Textarea
                                            id="remarks"
                                            value={data.remarks}
                                            onChange={e => setData('remarks', e.target.value)}
                                            placeholder="Additional notes or special conditions..."
                                            rows={3}
                                        />
                                        {errors.remarks && (
                                            <p className="text-sm text-rose-600">{errors.remarks}</p>
                                        )}
                                    </div>

                                    {/* REMOVED: issuing_officer input field */}
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
                                                {selectedResident ? selectedResident.name : 'Not selected'}
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
                            Pending Review
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
                                                <span className="text-gray-500">Initial Status:</span>
                                                <Badge variant="outline">
                                                    {selectedClearanceType?.requires_payment && data.fee_amount > 0 
                                                        ? 'Pending Payment' 
                                                        : 'Pending Review'}
                                                </Badge>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                                <div className="h-full bg-blue-500 rounded-full w-20" />
                                            </div>
                                        </div>
                                        
                                        <div className="text-sm space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                <span>Request Created</span>
                                            </div>
                                            {selectedClearanceType?.requires_payment && data.fee_amount > 0 && (
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                                                    <span>Payment Processing</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <div className="h-2 w-2 rounded-full bg-gray-300" />
                                                <span>Document Verification</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <div className="h-2 w-2 rounded-full bg-gray-300" />
                                                <span>Approval</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <div className="h-2 w-2 rounded-full bg-gray-300" />
                                                <span>Issuance</span>
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
                                        disabled={processing || !selectedResident || !selectedClearanceType}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                {isFromRequest ? 'Process Request' : 'Create Request'}
                                            </>
                                        )}
                                    </Button>
                                    <Link href="/clearances">
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
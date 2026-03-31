import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    FileText, 
    Calendar, 
    CalendarDays, 
    User, 
    Phone, 
    Mail, 
    MapPin, 
    FileCheck,
    DollarSign,
    Home,
    Hash,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { ClearanceRequest, ClearanceType, Resident } from '@/types/admin/clearances/clearance-types'; // Fix import

interface DetailsTabProps {
    clearance: ClearanceRequest;
    clearanceType?: ClearanceType;
    resident?: Resident;
    formatDate: (date?: string) => string;
    formatCurrency: (amount?: number) => string;
    getUrgencyVariant: (urgency: string) => any;
}

export function DetailsTab({ 
    clearance, 
    clearanceType, 
    resident, 
    formatDate, 
    formatCurrency, 
    getUrgencyVariant 
}: DetailsTabProps) {
    
    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            'completed': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'paid': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'pending': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            'pending_payment': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            'failed': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
            'refunded': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
            'unpaid': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
            'partially_paid': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    };

    const getPaymentStatusDisplay = () => {
        // Check if payment exists and has status
        if (clearance.payment?.status) {
            const statusMap: Record<string, string> = {
                'completed': 'Paid',
                'pending': 'Pending',
                'failed': 'Failed',
                'refunded': 'Refunded'
            };
            return statusMap[clearance.payment.status] || clearance.payment.status;
        }
        
        // Fallback to payment_status property
        if (clearance.payment_status) {
            const statusMap: Record<string, string> = {
                'completed': 'Paid',
                'pending': 'Pending',
                'failed': 'Failed',
                'refunded': 'Refunded',
                'paid': 'Paid',
                'unpaid': 'Unpaid',
                'partially_paid': 'Partially Paid'
            };
            return statusMap[clearance.payment_status] || clearance.payment_status;
        }
        
        return 'Unpaid';
    };

    const getPaymentStatus = () => {
        if (clearance.payment?.status) return clearance.payment.status;
        if (clearance.payment_status) return clearance.payment_status;
        return 'unpaid';
    };

    const getUrgencyDisplay = (urgency: string): string => {
        const urgencyMap: Record<string, string> = {
            'normal': 'Normal',
            'rush': 'Rush',
            'express': 'Express'
        };
        return urgencyMap[urgency] || urgency;
    };

    return (
        <div className="space-y-6">
            {/* Request Information Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center">
                            <FileText className="h-3 w-3 text-white" />
                        </div>
                        Request Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                Reference Number
                            </p>
                            <p className="font-mono text-sm dark:text-gray-300">{clearance.reference_number}</p>
                        </div>
                        
                        {clearance.clearance_number && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <FileCheck className="h-3 w-3" />
                                    Clearance Number
                                </p>
                                <p className="font-mono text-sm dark:text-gray-300">{clearance.clearance_number}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Clearance Type</p>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-sm bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                    {clearanceType?.name || 'N/A'}
                                </Badge>
                                {clearanceType?.code && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">({clearanceType.code})</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Urgency</p>
                            <Badge variant={getUrgencyVariant(clearance.urgency)} className={
                                clearance.urgency === 'express' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                                clearance.urgency === 'rush' ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' :
                                'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                            }>
                                {getUrgencyDisplay(clearance.urgency)}
                            </Badge>
                        </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    {/* Purpose Section */}
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Purpose</p>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-gray-700 dark:text-gray-300">{clearance.purpose || 'Not specified'}</p>
                                {clearance.specific_purpose && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{clearance.specific_purpose}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    {/* Dates Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Requested Date
                            </p>
                            <p className="text-sm dark:text-gray-300">{formatDate(clearance.created_at)}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                Needed By
                            </p>
                            <p className="text-sm dark:text-gray-300">
                                {clearance.needed_date ? formatDate(clearance.needed_date) : 'Not specified'}
                            </p>
                        </div>
                        {clearance.issue_date && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <FileCheck className="h-3 w-3" />
                                    Issue Date
                                </p>
                                <p className="text-sm dark:text-gray-300">{formatDate(clearance.issue_date)}</p>
                            </div>
                        )}
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    {/* Fee Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Fee Amount
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(clearance.fee_amount)}
                                </p>
                                {clearanceType?.requires_payment === false && (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                        Free
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</p>
                            <Badge variant="outline" className={getStatusColor(getPaymentStatus())}>
                                {getPaymentStatus() === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {getPaymentStatus() === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {getPaymentStatus() === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                {getPaymentStatus() === 'pending_payment' && <Clock className="h-3 w-3 mr-1" />}
                                {getPaymentStatus() === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                                {getPaymentStatus() === 'refunded' && <AlertCircle className="h-3 w-3 mr-1" />}
                                {getPaymentStatus() === 'unpaid' && <Clock className="h-3 w-3 mr-1" />}
                                {getPaymentStatus() === 'partially_paid' && <AlertCircle className="h-3 w-3 mr-1" />}
                                {getPaymentStatusDisplay()}
                            </Badge>
                        </div>
                    </div>

                    {/* Additional Requirements */}
                    {clearance.additional_requirements && (
                        <>
                            <Separator className="dark:bg-gray-700" />
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Additional Requirements</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                    {clearance.additional_requirements}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Rejection Reason */}
                    {clearance.rejection_reason && (
                        <>
                            <Separator className="dark:bg-gray-700" />
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejection Reason</p>
                                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                    {clearance.rejection_reason}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Remarks */}
                    {clearance.remarks && (
                        <>
                            <Separator className="dark:bg-gray-700" />
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Remarks</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                    {clearance.remarks}
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Resident Information Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <div className="h-6 w-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                            <User className="h-3 w-3 text-white" />
                        </div>
                        Resident Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {resident ? (
                        <div className="space-y-6">
                            {/* Resident Header */}
                            <div className="flex items-start gap-4">
                                {resident.profile_photo ? (
                                    <img
                                        src={resident.profile_photo}
                                        alt={resident.full_name}
                                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                                        <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-lg dark:text-gray-100">{resident.full_name}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {resident.contact_number && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {resident.contact_number}
                                            </span>
                                        )}
                                        {resident.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {resident.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator className="dark:bg-gray-700" />

                            {/* Resident Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                                            <p className="text-sm dark:text-gray-300">{resident.address || 'No address provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Add any other resident fields here if they exist in your Resident type */}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <User className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Resident information not available</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
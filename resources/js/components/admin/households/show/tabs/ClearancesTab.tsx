// resources/js/Pages/Admin/Households/Show/tabs/ClearancesTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Calendar, 
    Plus, 
    Eye, 
    Download,
    CheckCircle,
    Clock,
    XCircle,
    Loader2,
    FileText,
    AlertCircle
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useMemo } from 'react';

// Import types from shared types file
import { Clearance, ClearanceStatus, Resident } from '@/types/admin/households/household.types';
import { formatDate, formatDateTime } from '@/types/admin/households/household.types';

// Extended type for display purposes (used internally)
interface DisplayClearance extends Clearance {
    clearance_number?: string;
    clearance_type_display?: {
        id: number;
        name: string;
        code: string;
    };
    resident_display?: Resident & {
        full_name?: string;
    };
}

interface ClearancesTabProps {
    householdId: number;
    clearances: Clearance[]; // Accept the base Clearance type
    totalClearances: number;
    pendingClearances: number;
    approvedClearances: number;
    releasedClearances: number;
}

export const ClearancesTab = ({ 
    householdId, 
    clearances, 
    totalClearances, 
    pendingClearances, 
    approvedClearances, 
    releasedClearances
}: ClearancesTabProps) => {
    // Transform clearances to include display properties
    const displayClearances: DisplayClearance[] = useMemo(() => {
        return clearances.map(clearance => ({
            ...clearance,
            clearance_type_display: typeof clearance.clearance_type === 'string' 
                ? { id: 0, name: clearance.clearance_type, code: clearance.clearance_type }
                : clearance.clearance_type as any,
            resident_display: clearance.resident as any
        }));
    }, [clearances]);

    // Group clearances by status for better organization
    const clearancesByStatus = useMemo(() => {
        return {
            pending: displayClearances.filter(c => c.status === 'pending'),
            approved: displayClearances.filter(c => c.status === 'approved'),
            released: displayClearances.filter(c => c.status === 'released'),
            rejected: displayClearances.filter(c => c.status === 'rejected'),
            expired: displayClearances.filter(c => c.status === 'expired')
        };
    }, [displayClearances]);

    const getStatusBadge = (status: ClearanceStatus) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Approved
                </Badge>;
            case 'released':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Released
                </Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                </Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Rejected
                </Badge>;
            case 'expired':
                return <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Expired
                </Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStatusIcon = (status: ClearanceStatus) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'released':
                return <Download className="h-4 w-4 text-blue-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'expired':
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatDateSafe = (date?: string): string => {
        if (!date) return 'N/A';
        return formatDate(date);
    };

    const getDaysRemaining = (expiryDate?: string): number | null => {
        if (!expiryDate) return null;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getExpiryStatus = (expiryDate?: string): 'valid' | 'expiring' | 'expired' => {
        if (!expiryDate) return 'valid';
        const daysRemaining = getDaysRemaining(expiryDate);
        if (daysRemaining === null) return 'valid';
        if (daysRemaining < 0) return 'expired';
        if (daysRemaining <= 7) return 'expiring';
        return 'valid';
    };

    const getClearanceTypeName = (clearance: DisplayClearance): string => {
        if (clearance.clearance_type_display?.name) {
            return clearance.clearance_type_display.name;
        }
        if (typeof clearance.clearance_type === 'string') {
            return clearance.clearance_type;
        }
        return 'Clearance';
    };

    const getResidentName = (clearance: DisplayClearance): string => {
        if (clearance.resident_display?.full_name) {
            return clearance.resident_display.full_name;
        }
        if (clearance.resident_display?.first_name) {
            return `${clearance.resident_display.first_name} ${clearance.resident_display.last_name}`;
        }
        return 'N/A';
    };

    const renderClearanceList = (clearancesList: DisplayClearance[]) => {
        return (
            <div className="space-y-3">
                {clearancesList.map((clearance) => {
                    const expiryStatus = getExpiryStatus(clearance.expiry_date);
                    const daysRemaining = getDaysRemaining(clearance.expiry_date);
                    
                    return (
                        <div key={clearance.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(clearance.status)}
                                            <h3 className="font-semibold dark:text-gray-100">
                                                {getClearanceTypeName(clearance)}
                                                {clearance.clearance_number && ` #${clearance.clearance_number}`}
                                            </h3>
                                        </div>
                                        {getStatusBadge(clearance.status)}
                                        {expiryStatus === 'expiring' && (
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                                                Expires in {daysRemaining} days
                                            </Badge>
                                        )}
                                        {expiryStatus === 'expired' && (
                                            <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                                Expired
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        {clearance.purpose || 'No purpose specified'}
                                    </p>
                                    
                                    {clearance.notes && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                                            Notes: {clearance.notes}
                                        </p>
                                    )}
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Requested By</p>
                                            <p className="font-medium dark:text-gray-200">
                                                {getResidentName(clearance)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Request Date</p>
                                            <p className="font-medium dark:text-gray-200">
                                                {formatDateSafe(clearance.requested_date)}
                                            </p>
                                        </div>
                                        {clearance.approved_date && (
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Approved Date</p>
                                                <p className="font-medium dark:text-gray-200">
                                                    {formatDateSafe(clearance.approved_date)}
                                                </p>
                                            </div>
                                        )}
                                        {clearance.released_date && (
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Released Date</p>
                                                <p className="font-medium dark:text-gray-200">
                                                    {formatDateSafe(clearance.released_date)}
                                                </p>
                                            </div>
                                        )}
                                        {clearance.expiry_date && (
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Expiry Date</p>
                                                <p className={`font-medium ${
                                                    expiryStatus === 'expired' ? 'text-red-600 dark:text-red-400' :
                                                    expiryStatus === 'expiring' ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'dark:text-gray-200'
                                                }`}>
                                                    {formatDateSafe(clearance.expiry_date)}
                                                    {expiryStatus === 'valid' && daysRemaining && daysRemaining > 0 && (
                                                        <span className="text-xs text-gray-400 ml-1">
                                                            ({daysRemaining} days left)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {clearance.reference_number && (
                                        <p className="text-xs text-gray-400 mt-2">Reference #: {clearance.reference_number}</p>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Link href={route('admin.clearances.show', clearance.id)}>
                                        <Button variant="ghost" size="sm" title="View Details">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    {clearance.status === 'released' && (
                                        <Button variant="ghost" size="sm" title="Download Clearance">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <FileText className="h-8 w-8 text-blue-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{totalClearances}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Clock className="h-8 w-8 text-yellow-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{pendingClearances}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{approvedClearances}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Download className="h-8 w-8 text-blue-500 mx-auto" />
                            <p className="text-2xl font-bold dark:text-gray-100">{releasedClearances}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Released</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Clearances List */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="dark:text-gray-100">Clearance Requests</CardTitle>
                        <Link href={route('admin.clearances.create', { household_id: householdId })}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Request Clearance
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {clearances.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No clearances found</h3>
                            <p className="text-gray-500 dark:text-gray-400">This household has no clearance requests yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Pending Clearances Section */}
                            {clearancesByStatus.pending.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Pending Requests ({clearancesByStatus.pending.length})
                                    </h4>
                                    {renderClearanceList(clearancesByStatus.pending)}
                                </div>
                            )}

                            {/* Approved Clearances Section */}
                            {clearancesByStatus.approved.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Approved ({clearancesByStatus.approved.length})
                                    </h4>
                                    {renderClearanceList(clearancesByStatus.approved)}
                                </div>
                            )}

                            {/* Released Clearances Section */}
                            {clearancesByStatus.released.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Released ({clearancesByStatus.released.length})
                                    </h4>
                                    {renderClearanceList(clearancesByStatus.released)}
                                </div>
                            )}

                            {/* Expired/Rejected Clearances Section */}
                            {(clearancesByStatus.expired.length > 0 || clearancesByStatus.rejected.length > 0) && (
                                <div>
                                    <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Inactive ({clearancesByStatus.expired.length + clearancesByStatus.rejected.length})
                                    </h4>
                                    {renderClearanceList([...clearancesByStatus.expired, ...clearancesByStatus.rejected])}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
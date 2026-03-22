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
    Loader2
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Clearance {
    id: number;
    clearance_number: string;
    clearance_type: {
        id: number;
        name: string;
        code: string;
    };
    resident: {
        id: number;
        full_name: string;
    };
    status: string;
    purpose: string;
    request_date: string;
    release_date: string;
    expiry_date: string;
}

interface ClearancesTabProps {
    householdId: number;
    clearances: Clearance[];
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
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
            case 'released':
                return <Badge className="bg-blue-100 text-blue-800">Released</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="dark:bg-gray-900">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Calendar className="h-8 w-8 text-blue-500 mx-auto" />
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
                            <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No clearances found</h3>
                            <p className="text-gray-500 dark:text-gray-400">This household has no clearance requests yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {clearances.map((clearance) => (
                                <div key={clearance.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow dark:border-gray-700">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <h3 className="font-semibold dark:text-gray-100">
                                                    {clearance.clearance_type?.name || 'Clearance'} #{clearance.clearance_number}
                                                </h3>
                                                {getStatusBadge(clearance.status)}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                {clearance.purpose || 'No purpose specified'}
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">Requested By</p>
                                                    <p className="font-medium dark:text-gray-200">{clearance.resident?.full_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 dark:text-gray-400">Request Date</p>
                                                    <p className="font-medium dark:text-gray-200">
                                                        {new Date(clearance.request_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {clearance.release_date && (
                                                    <div>
                                                        <p className="text-gray-500 dark:text-gray-400">Release Date</p>
                                                        <p className="font-medium dark:text-gray-200">
                                                            {new Date(clearance.release_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                )}
                                                {clearance.expiry_date && (
                                                    <div>
                                                        <p className="text-gray-500 dark:text-gray-400">Expiry Date</p>
                                                        <p className="font-medium dark:text-gray-200">
                                                            {new Date(clearance.expiry_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={route('admin.clearances.show', clearance.id)}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {clearance.status === 'released' && (
                                                <Button variant="ghost" size="sm">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
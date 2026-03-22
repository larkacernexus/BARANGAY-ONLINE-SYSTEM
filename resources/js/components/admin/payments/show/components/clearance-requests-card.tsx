// resources/js/Pages/Admin/Payments/components/clearance-requests-card.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    FileCheck,
    ChevronUp,
    ChevronDown,
    CheckCircle,
    Clock,
    XCircle,
    Loader2,
    User,
    ExternalLink,
    Calendar,
    DollarSign,
} from 'lucide-react';
import { ClearanceRequest } from '../types';
import { getRoute, getUrgencyColor } from '../utils/helpers';

interface Props {
    requests: ClearanceRequest[];
}

export const ClearanceRequestsCard = ({ requests }: Props) => {
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const toggleRequest = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': 
            case 'issued':
                return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
            case 'pending': 
                return <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
            case 'cancelled':
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
            case 'processing':
                return <Loader2 className="h-4 w-4 text-blue-500 dark:text-blue-400 animate-spin" />;
            default: 
                return <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': 
            case 'issued':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'pending': 
                return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
            case 'cancelled':
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            default: 
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
        }
    };

    // Safe function to get route with fallback
    const getClearanceRoute = (id: number) => {
        try {
            // Try to get the route
            const routeUrl = getRoute('admin.clearance-requests.show', id);
            if (routeUrl && typeof routeUrl === 'string') {
                return routeUrl;
            }
        } catch (error) {
            console.warn('Route admin.clearance-requests.show not found, using fallback');
        }
        // Fallback URL
        return `/admin/clearance-requests/${id}`;
    };

    if (!requests || requests.length === 0) return null;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Clearance Requests
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Associated clearance requests for this payment
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {requests.length} request(s)
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        {requests.map((request) => (
                            <div key={request.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                {/* Header - Clickable */}
                                <button
                                    onClick={() => toggleRequest(request.id)}
                                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex-shrink-0">
                                            {expandedIds.includes(request.id) ? (
                                                <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {request.clearance_type?.name || 'Clearance Request'}
                                                </h4>
                                                <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                                                    {request.reference_number}
                                                </Badge>
                                            </div>
                                            {request.clearance_number && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Clearance #: {request.clearance_number}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                        <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                                            {getStatusIcon(request.status)}
                                            {request.status_display || request.status}
                                        </Badge>
                                        <Badge className={`${getUrgencyColor(request.urgency)}`}>
                                            {request.urgency_display || request.urgency}
                                        </Badge>
                                    </div>
                                </button>
                                
                                {/* Expanded Content */}
                                {expandedIds.includes(request.id) && (
                                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <FileCheck className="h-3 w-3" />
                                                    Purpose
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                                                    {request.purpose || 'N/A'}
                                                </p>
                                                {request.specific_purpose && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                        {request.specific_purpose}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    Fee
                                                </p>
                                                <p className="text-base font-bold text-green-600 dark:text-green-400 mt-1">
                                                    {request.formatted_fee || `₱${(request.fee_amount || 0).toFixed(2)}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                            {request.needed_date && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Needed By
                                                    </p>
                                                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                                        {request.formatted_needed_date || new Date(request.needed_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                            {request.issue_date && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Issued On
                                                    </p>
                                                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                                        {request.formatted_issue_date || new Date(request.issue_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                            {request.valid_until && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Valid Until
                                                    </p>
                                                    <p className={`text-sm mt-1 ${request.is_valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {request.formatted_valid_until || new Date(request.valid_until).toLocaleDateString()}
                                                        {request.days_remaining !== undefined && (
                                                            <span className="text-xs ml-1">
                                                                ({Math.abs(request.days_remaining)} days {request.days_remaining >= 0 ? 'left' : 'overdue'})
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {request.resident && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    Requested By
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {typeof request.resident === 'object' ? request.resident.name : request.resident}
                                                    </span>
                                                    {request.resident.household && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            House #{request.resident.household.household_number}
                                                            {request.resident.household.purok && `, Purok ${request.resident.household.purok}`}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                            <Link 
                                                href={getClearanceRoute(request.id)}
                                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                View Full Details
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
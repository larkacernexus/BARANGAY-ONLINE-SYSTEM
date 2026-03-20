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
        switch (status.toLowerCase()) {
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
        switch (status.toLowerCase()) {
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

    if (requests.length === 0) return null;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Clearance Request Details
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Associated clearance requests for this payment
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div key={request.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleRequest(request.id)}
                                className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    {expandedIds.includes(request.id) ? (
                                        <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    )}
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2 dark:text-gray-100">
                                            {request.clearance_type?.name || 'Clearance Request'}
                                            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                                {request.reference_number}
                                            </Badge>
                                        </h4>
                                        {request.clearance_number && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Clearance #: {request.clearance_number}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                                        {getStatusIcon(request.status)}
                                        {request.status_display}
                                    </Badge>
                                    <Badge className={`${getUrgencyColor(request.urgency)}`}>
                                        {request.urgency_display}
                                    </Badge>
                                </div>
                            </button>
                            
                            {expandedIds.includes(request.id) && (
                                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Purpose</p>
                                            <p className="text-sm font-semibold dark:text-gray-100">{request.purpose || 'N/A'}</p>
                                            {request.specific_purpose && (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{request.specific_purpose}</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Fee</p>
                                            <p className="text-base font-bold text-green-600 dark:text-green-400">{request.formatted_fee}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                        {request.needed_date && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Needed By</p>
                                                <p className="text-sm dark:text-gray-300">{request.formatted_needed_date}</p>
                                            </div>
                                        )}
                                        {request.issue_date && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Issued On</p>
                                                <p className="text-sm dark:text-gray-300">{request.formatted_issue_date}</p>
                                            </div>
                                        )}
                                        {request.valid_until && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Valid Until</p>
                                                <p className={`text-sm ${request.is_valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {request.formatted_valid_until}
                                                    {request.days_remaining !== undefined && (
                                                        <span className="text-xs ml-1">
                                                            ({Math.abs(request.days_remaining)}d)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {request.resident && (
                                        <div className="mt-3 pt-3 border-t dark:border-gray-700">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Requested By</p>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <span className="text-sm font-medium dark:text-gray-100">{request.resident.name}</span>
                                                {request.resident.household && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        • House #{request.resident.household.household_number}, Purok {request.resident.household.purok}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-3 pt-3 border-t dark:border-gray-700 flex justify-end">
                                        <Link 
                                            href={getRoute('admin.clearance-requests.show', request.id)}
                                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            View Full Details
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
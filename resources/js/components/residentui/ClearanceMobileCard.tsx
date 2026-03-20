import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, User, Calendar, Eye, Download, DollarSign, FileCheck } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { ClearanceStatusBadge } from './ClearanceStatusBadge';
import { ClearanceUrgencyBadge } from './ClearanceUrgencyBadge';

interface ClearanceType {
    id: number;
    name: string;
    code: string;
    fee: number | string;
    processing_days: number;
}

interface ClearanceMobileCardProps {
    clearance: {
        id: number;
        reference_number: string;
        clearance_number?: string;
        clearance_type?: ClearanceType;
        purpose: string;
        resident_id: number;
        resident?: {
            id: number;
            first_name: string;
            last_name: string;
            middle_name?: string;
            suffix?: string;
        };
        created_at: string;
        status: string;
        urgency: string;
    };
    currentResidentId: number;
    selectMode: boolean;
    selectedClearances: number[];
    toggleSelectClearance: (id: number) => void;
    copyReferenceNumber: (refNumber: string) => void;
    formatDate: (dateString: string) => string;
}

export function ClearanceMobileCard({ 
    clearance, 
    currentResidentId,
    selectMode,
    selectedClearances,
    toggleSelectClearance,
    copyReferenceNumber,
    formatDate 
}: ClearanceMobileCardProps) {
    return (
        <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
            <div className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        {selectMode && (
                            <button
                                onClick={() => toggleSelectClearance(clearance.id)}
                                className={`flex-shrink-0 w-5 h-5 mt-1 rounded border flex items-center justify-center transition-colors ${
                                    selectedClearances.includes(clearance.id)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-gray-300 hover:border-blue-500'
                                }`}
                            >
                                {selectedClearances.includes(clearance.id) && (
                                    <Check className="h-3 w-3 text-white" />
                                )}
                            </button>
                        )}
                        
                        <div className={`flex-1 min-w-0 ${selectMode ? '' : 'ml-0'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <button
                                    onClick={() => copyReferenceNumber(clearance.reference_number)}
                                    className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors"
                                    title="Copy reference number"
                                >
                                    #{clearance.reference_number}
                                </button>
                                {clearance.clearance_number && (
                                    <Badge variant="outline" className="h-5 text-xs">
                                        <FileCheck className="h-3 w-3 mr-1" />
                                        #{clearance.clearance_number}
                                    </Badge>
                                )}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {clearance.clearance_type?.name || 'Clearance'} Clearance
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {clearance.purpose}
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                            <ClearanceUrgencyBadge urgency={clearance.urgency} />
                            <ClearanceStatusBadge status={clearance.status} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Requested By</p>
                            <p className="font-medium flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {clearance.resident?.first_name} {clearance.resident?.last_name}
                                {clearance.resident_id === currentResidentId && ' (You)'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Date Requested</p>
                            <p className="font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(clearance.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <Link 
                            href={`/my-clearances/${clearance.id}`} 
                            className="flex-1"
                        >
                            <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </Button>
                        </Link>
                        <div className="flex gap-1 ml-2">
                            {clearance.status === 'issued' && clearance.clearance_number && (
                                <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => toast.info('Download functionality would be implemented here')}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            )}
                            {clearance.status === 'pending_payment' && (
                                <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => toast.info('Payment functionality would open here')}
                                >
                                    <DollarSign className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
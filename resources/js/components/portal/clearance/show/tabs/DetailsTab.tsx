// clearance-show/components/tabs/DetailsTab.tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernExpandableSection } from '@/components/residentui/modern-expandable-section';
import { ModernUrgencyBadge } from '@/components/residentui/modern-urgency-badge';
import { formatCurrency, formatDate } from '@/components/residentui/lib/resident-ui-utils';
import { cn } from '@/lib/utils';
import { Copy, User, Layers, FileCheck, Calendar, Clock, Hash, FileText, DollarSign } from 'lucide-react';
import { ClearanceRequest } from '@/types/portal/clearances/clearance.types';

interface DetailsTabProps {
    clearance: ClearanceRequest;
    expandedSections: Record<string, boolean>;
    toggleSection: (section: string) => void;
    isMobile: boolean;
    onCopyReference: () => void;
}

export function DetailsTab({ clearance, expandedSections, toggleSection, isMobile, onCopyReference }: DetailsTabProps) {
    const formatDateWithFormat = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return formatDate(dateString, 'MMM D, YYYY');
    };

    if (isMobile) {
        return (
            <>
                <ModernExpandableSection
                    title="Request Information"
                    icon={
                        <div className="h-6 w-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                    }
                    isExpanded={expandedSections.requestInfo}
                    onToggle={() => toggleSection('requestInfo')}
                >
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">Reference</p>
                                <p className="text-xs font-mono truncate">{clearance.reference_number}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">Date Requested</p>
                                <p className="text-xs">{formatDateWithFormat(clearance.created_at)}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">Date Needed</p>
                                <p className="text-xs">{formatDateWithFormat(clearance.needed_date)}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">Urgency</p>
                                <div className="mt-0.5">
                                    <ModernUrgencyBadge urgency={clearance.urgency} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-[10px] text-gray-500 mb-1">Purpose</p>
                            <p className="text-xs">{clearance.purpose}</p>
                            {clearance.specific_purpose && (
                                <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                                    {clearance.specific_purpose}
                                </p>
                            )}
                        </div>
                        
                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-[10px] text-gray-500 mb-1">Requested By</p>
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <User className="h-3 w-3" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium">
                                        {clearance.resident?.first_name} {clearance.resident?.last_name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModernExpandableSection>

                <ModernExpandableSection
                    title="Clearance Information"
                    icon={
                        <div className="h-6 w-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <FileCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                    }
                    isExpanded={expandedSections.clearanceInfo}
                    onToggle={() => toggleSection('clearanceInfo')}
                >
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">Type</p>
                                <p className="text-xs">{clearance.clearance_type?.name || 'N/A'}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">Processing</p>
                                <p className="text-xs">{clearance.clearance_type?.processing_days || 0} days</p>
                            </div>
                        </div>
                        
                        {clearance.issue_date && (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                    <p className="text-[10px] text-gray-500">Issued Date</p>
                                    <p className="text-xs">{formatDateWithFormat(clearance.issue_date)}</p>
                                </div>
                                {clearance.valid_until && (
                                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                        <p className="text-[10px] text-gray-500">Valid Until</p>
                                        <p className="text-xs">{formatDateWithFormat(clearance.valid_until)}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {clearance.clearance_number && (
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <p className="text-[10px] text-gray-500">Clearance Number</p>
                                <p className="text-xs font-mono">{clearance.clearance_number}</p>
                            </div>
                        )}
                    </div>
                </ModernExpandableSection>
            </>
        );
    }

    // Desktop version
    return (
        <>
            <ModernCard
                title="Request Information"
                icon={Layers}
                iconColor="from-blue-500 to-blue-600"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">Reference Number</p>
                        <div className="flex items-center gap-1 mt-1">
                            <p className="font-mono font-medium">{clearance.reference_number}</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={onCopyReference}
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">Date Requested</p>
                        <p className="font-medium mt-1">{formatDateWithFormat(clearance.created_at)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">Date Needed</p>
                        <p className="font-medium mt-1">{formatDateWithFormat(clearance.needed_date)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">Urgency</p>
                        <div className="mt-1">
                            <ModernUrgencyBadge urgency={clearance.urgency} />
                        </div>
                    </div>
                </div>
                
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <p className="text-xs text-gray-500 mb-1">Purpose</p>
                    <p className="font-medium">{clearance.purpose}</p>
                    {clearance.specific_purpose && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {clearance.specific_purpose}
                        </p>
                    )}
                </div>
                
                {clearance.additional_requirements && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Additional Requirements</p>
                        <p className="font-medium">{clearance.additional_requirements}</p>
                    </div>
                )}
                
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <p className="text-xs text-gray-500 mb-2">Requested By</p>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                            <p className="font-medium">
                                {clearance.resident?.first_name} {clearance.resident?.last_name}
                            </p>
                            {clearance.resident?.middle_name && (
                                <p className="text-sm text-gray-500">
                                    {clearance.resident.middle_name} {clearance.resident.suffix}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </ModernCard>

            <ModernCard
                title="Clearance Information"
                icon={FileCheck}
                iconColor="from-purple-500 to-purple-600"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="font-medium mt-1">{clearance.clearance_type?.name || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">Processing Time</p>
                        <p className="font-medium mt-1">{clearance.clearance_type?.processing_days || 0} days</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500">Fee Amount</p>
                        <p className="font-bold text-lg mt-1">{formatCurrency(clearance.fee_amount)}</p>
                    </div>
                    {clearance.clearance_type?.fee && (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500">Standard Fee</p>
                            <p className="font-medium mt-1">{formatCurrency(clearance.clearance_type.fee)}</p>
                        </div>
                    )}
                </div>
                
                {clearance.issue_date && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-xs text-gray-500">Issued Date</p>
                            <p className="font-medium mt-1">{formatDateWithFormat(clearance.issue_date)}</p>
                        </div>
                        {clearance.valid_until && (
                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                <p className="text-xs text-gray-500">Valid Until</p>
                                <p className="font-medium mt-1">{formatDateWithFormat(clearance.valid_until)}</p>
                            </div>
                        )}
                    </div>
                )}
                
                {clearance.clearance_number && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Clearance Number</p>
                        <p className="font-mono font-medium">{clearance.clearance_number}</p>
                    </div>
                )}
                
                {clearance.issuing_officer_name && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Issued By</p>
                        <p className="font-medium">{clearance.issuing_officer_name}</p>
                    </div>
                )}
                
                {clearance.remarks && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Remarks</p>
                        <p className="font-medium">{clearance.remarks}</p>
                    </div>
                )}
            </ModernCard>
        </>
    );
}
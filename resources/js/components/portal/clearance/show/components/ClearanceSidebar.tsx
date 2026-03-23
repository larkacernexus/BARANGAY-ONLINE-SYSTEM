// clearance-show/components/ClearanceSidebar.tsx
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernStatusBadge } from '@/components/residentui/modern-status-badge';
import { ModernUrgencyBadge } from '@/components/residentui/modern-urgency-badge';
import { ModernPaymentMethodsInfo } from '@/components/residentui/modern-payment-summary';
import { formatCurrency, formatDateTime } from '@/components/residentui/lib/resident-ui-utils';
import { cn } from '@/lib/utils';
import { Download, Printer, XCircle, MessageSquare, DollarSign, Building, Phone, MapPin, Loader2 } from 'lucide-react';
import { ClearanceRequest } from '@/types/portal/clearances/clearance.types';
import { getStatusConfig, calculateTotalPaid, calculateBalance, isPaymentRequired, canProcessPayment } from '@/components/residentui/clearances/clearance-utils';
import { router } from '@inertiajs/react';

interface ClearanceSidebarProps {
    clearance: ClearanceRequest;
    feeAmount: number;
    totalPaid: number;
    balance: number;
    isPaymentRequired: boolean; // Make sure this is required, not optional
    isReadyForPayment: boolean;
    onDownload: () => void;
    onPrint: () => void;
    onCancel: () => void;
    isDownloadingClearance: boolean;
    isPrinting: boolean;
}

export function ClearanceSidebar({
    clearance,
    feeAmount,
    totalPaid,
    balance,
    isPaymentRequired,
    isReadyForPayment,
    onDownload,
    onPrint,
    onCancel,
    isDownloadingClearance,
    isPrinting
}: ClearanceSidebarProps) {
    return (
        <div className="space-y-4 lg:space-y-6">
            <ModernCard title="Request Summary">
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Status</p>
                        <ModernStatusBadge status={clearance.status} />
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Urgency</p>
                        <ModernUrgencyBadge urgency={clearance.urgency} />
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Fee Amount</p>
                        <p className="font-bold">{formatCurrency(feeAmount)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Amount Paid</p>
                        <p className="font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <p className="text-sm text-gray-500">Balance</p>
                        <p className={cn(
                            "font-bold",
                            balance > 0 ? 'text-red-600' : 'text-green-600'
                        )}>
                            {formatCurrency(balance)}
                        </p>
                    </div>
                    
                    {clearance.clearance_number && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                            <p className="text-sm text-gray-500">Clearance No.</p>
                            <p className="font-mono font-medium">{clearance.clearance_number}</p>
                        </div>
                    )}
                    
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                        <p className="text-sm font-medium">{formatDateTime(clearance.updated_at)}</p>
                    </div>
                </div>
            </ModernCard>

            <ModernCard title="Quick Actions">
                <div className="space-y-2">
                    {clearance.status === 'issued' && clearance.clearance_number && (
                        <>
                            <Button
                                variant="default"
                                className="w-full justify-start gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600"
                                onClick={onDownload}
                                disabled={isDownloadingClearance}
                            >
                                {isDownloadingClearance ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                                Download Clearance
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 rounded-xl"
                                onClick={onPrint}
                                disabled={isPrinting}
                            >
                                {isPrinting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Printer className="h-4 w-4" />
                                )}
                                Print Clearance
                            </Button>
                        </>
                    )}
                    
                    {isReadyForPayment && isPaymentRequired && (
                        <Button
                            variant="default"
                            className="w-full justify-start gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600"
                            onClick={() => {
                                alert(`Please proceed to Barangay Hall to pay the fee of ${formatCurrency(balance)}.\n\nBring your valid ID and this reference number: ${clearance.reference_number}`);
                            }}
                        >
                            <DollarSign className="h-4 w-4" />
                            Payment Instructions
                        </Button>
                    )}
                    
                    {['pending', 'ready_for_payment', 'processing'].includes(clearance.status) && (
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={onCancel}
                        >
                            <XCircle className="h-4 w-4" />
                            Cancel Request
                        </Button>
                    )}
                    
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 rounded-xl"
                        onClick={() => router.get(`/my-clearances/${clearance.id}/message`)}
                    >
                        <MessageSquare className="h-4 w-4" />
                        Send Message
                    </Button>
                </div>
            </ModernCard>

            {isPaymentRequired && <ModernPaymentMethodsInfo />}

            <ModernCard title="Contact Information">
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Barangay Hall</p>
                            <p className="text-xs text-gray-500">Open Mon-Fri, 8AM-5PM</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Contact Us</p>
                            <p className="text-xs text-gray-500">0999-999-9999</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm">Location</p>
                            <p className="text-xs text-gray-500">Barangay Hall, Main Street</p>
                        </div>
                    </div>
                </div>
            </ModernCard>
        </div>
    );
}
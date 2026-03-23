// clearance-show/components/MobileClearanceHeader.tsx
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MoreVertical, Download, Printer, Copy, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModernMobileHeader } from '@/components/residentui/modern-mobile-header';
import { ModernUrgencyBadge } from '@/components/residentui/modern-urgency-badge';
import { ModernPaymentSummary } from '@/components/residentui/modern-payment-summary';
import { ClearanceRequest } from '@/types/portal/clearances/clearance.types';
import { getStatusConfig, calculateTotalPaid } from '@/components/residentui/clearances/clearance-utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';

interface MobileClearanceHeaderProps {
    clearance: ClearanceRequest;
    showStickyActions: boolean;
    isDownloadingClearance: boolean;
    isPrinting: boolean;
    onDownload: () => void;
    onPrint: () => void;
    onCopyReference: () => void;
    onCancel: () => void;
}

export function MobileClearanceHeader({
    clearance,
    showStickyActions,
    isDownloadingClearance,
    isPrinting,
    onDownload,
    onPrint,
    onCopyReference,
    onCancel
}: MobileClearanceHeaderProps) {
    const statusConfig = getStatusConfig(clearance.status);
    const feeAmount = typeof clearance.fee_amount === 'string' ? parseFloat(clearance.fee_amount) : clearance.fee_amount;
    const totalPaid = calculateTotalPaid(clearance.payment_items || []);
    const balance = feeAmount - totalPaid;

    return (
        <>
            <ModernMobileHeader
                title={clearance.clearance_type?.name || 'Clearance'}
                subtitle="Clearance Request"
                referenceNumber={clearance.reference_number}
                onCopyReference={onCopyReference}
                onBack={() => router.get('/my-clearances')}
                showSticky={showStickyActions}
                actions={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {clearance.status === 'issued' && clearance.clearance_number && (
                                <>
                                    <DropdownMenuItem onClick={onDownload} disabled={isDownloadingClearance}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onPrint} disabled={isPrinting}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem onClick={onCopyReference}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Reference
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            />

            <div className={cn(
                "sticky z-10 -mx-4 px-4 py-2 transition-all duration-200",
                showStickyActions ? "top-[73px]" : "top-[73px]"
            )}>
                <Alert className={cn(
                    "border-0 rounded-xl shadow-lg py-2",
                    statusConfig.gradient
                )}>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <AlertTitle className="font-semibold text-xs">
                                Status: {statusConfig.label}
                            </AlertTitle>
                            <AlertDescription className="text-[10px] truncate">
                                {clearance.status === 'pending' && 'Pending review'}
                                {clearance.status === 'processing' && 'Being processed'}
                                {clearance.status === 'ready_for_payment' && 'Ready for payment'}
                                {clearance.status === 'issued' && `No: ${clearance.clearance_number}`}
                            </AlertDescription>
                        </div>
                        <ModernUrgencyBadge urgency={clearance.urgency} />
                    </div>
                </Alert>
            </div>

            <ModernPaymentSummary
                due={feeAmount}
                paid={totalPaid}
                balance={balance}
                showCompact={true}
            />
        </>
    );
}
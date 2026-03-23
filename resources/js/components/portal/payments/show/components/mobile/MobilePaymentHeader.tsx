// payment-show/components/MobilePaymentHeader.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Printer, Download, Save, Share2, Edit, Trash2, XCircle, MessageSquare, Upload, CreditCard, Smartphone, Copy, Calendar, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/components/residentui/lib/resident-ui-utils';
import { ModernMobileHeader } from '@/components/residentui/modern-mobile-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ModernPaymentSummary } from '@/components/residentui/modern-payment-summary';
import { Payment } from '@/utils/portal/payments/payment-utils';
import { getPaymentMethodColor } from '@/utils/portal/payments/payment-utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';

interface MobilePaymentHeaderProps {
    payment: Payment;
    statusConfig: any;
    showStickyActions: boolean;
    canPrint: boolean;
    canDownload: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAddNote: boolean;
    canUploadAttachment: boolean;
    canPayOnline: boolean;
    isPrinting: boolean;
    isDownloadingReceipt: boolean;
    isSavingReceipt: boolean;
    onPrint: () => void;
    onDownload: () => void;
    onSaveReceipt: () => void;
    onShare: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onCancel: () => void;
    onAddNote: () => void;
    onUpload: () => void;
    onChangePaymentMethod: () => void;
    onPayOnline: () => void;
    onCopyOrNumber: () => void;
}

export function MobilePaymentHeader({
    payment,
    statusConfig,
    showStickyActions,
    canPrint,
    canDownload,
    canEdit,
    canDelete,
    canAddNote,
    canUploadAttachment,
    canPayOnline,
    isPrinting,
    isDownloadingReceipt,
    isSavingReceipt,
    onPrint,
    onDownload,
    onSaveReceipt,
    onShare,
    onEdit,
    onDelete,
    onCancel,
    onAddNote,
    onUpload,
    onChangePaymentMethod,
    onPayOnline,
    onCopyOrNumber
}: MobilePaymentHeaderProps) {
    const StatusIcon = statusConfig.icon;

    const formatDateWithFormat = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return formatDate(dateString, 'MMM D, YYYY');
    };

    return (
        <>
            <ModernMobileHeader
                title={`OR #${payment.or_number}`}
                subtitle="Payment Receipt"
                referenceNumber={payment.reference_number || payment.or_number}
                onCopyReference={onCopyOrNumber}
                onBack={() => router.get('/payments')}
                showSticky={showStickyActions}
                actions={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {canPrint && payment.status === 'completed' && (
                                <DropdownMenuItem onClick={onPrint} disabled={isPrinting}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Receipt
                                </DropdownMenuItem>
                            )}
                            {canDownload && payment.status === 'completed' && (
                                <DropdownMenuItem onClick={onDownload} disabled={isDownloadingReceipt}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Receipt
                                </DropdownMenuItem>
                            )}
                            {payment.status === 'completed' && (
                                <DropdownMenuItem onClick={onSaveReceipt} disabled={isSavingReceipt}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Receipt
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={onShare}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onCopyOrNumber}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy OR Number
                            </DropdownMenuItem>
                            {payment.reference_number && (
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.reference_number!)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Reference
                                </DropdownMenuItem>
                            )}
                            
                            {payment.status === 'pending' && (
                                <>
                                    <DropdownMenuSeparator />
                                    {canEdit && (
                                        <DropdownMenuItem onClick={onEdit}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={onChangePaymentMethod}>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Change Payment Method
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onCancel} className="text-amber-600">
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel Payment
                                    </DropdownMenuItem>
                                    {canDelete && (
                                        <DropdownMenuItem 
                                            onClick={onDelete}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}
                            
                            {canAddNote && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={onAddNote}>
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Add Note
                                    </DropdownMenuItem>
                                </>
                            )}
                            
                            {canUploadAttachment && payment.status === 'pending' && (
                                <DropdownMenuItem onClick={onUpload}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload File
                                </DropdownMenuItem>
                            )}
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
                    statusConfig.bgColor
                )}>
                    <div className="flex items-center gap-2">
                        <StatusIcon className={cn("h-4 w-4 flex-shrink-0", statusConfig.color)} />
                        <div className="flex-1 min-w-0">
                            <AlertTitle className="font-semibold text-xs">
                                Status: {statusConfig.label}
                            </AlertTitle>
                            <AlertDescription className="text-[10px] truncate">
                                {payment.status === 'paid' && 'Payment completed'}
                                {payment.status === 'completed' && 'Payment completed'}
                                {payment.status === 'pending' && 'Awaiting verification'}
                                {payment.status === 'overdue' && 'Payment overdue'}
                                {payment.status === 'cancelled' && 'Payment cancelled'}
                                {payment.status === 'refunded' && 'Payment refunded'}
                            </AlertDescription>
                        </div>
                        <Badge variant="outline" className={cn(
                            "text-[10px]",
                            getPaymentMethodColor(payment.payment_method)
                        )}>
                            {payment.payment_method_display}
                        </Badge>
                    </div>
                </Alert>
            </div>

            <ModernPaymentSummary
                due={payment.total_amount}
                paid={payment.status === 'paid' || payment.status === 'completed' ? payment.total_amount : 0}
                balance={payment.status === 'paid' || payment.status === 'completed' ? 0 : payment.total_amount}
                showCompact={true}
            />
        </>
    );
}
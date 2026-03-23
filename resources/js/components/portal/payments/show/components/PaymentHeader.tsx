// payment-show/components/PaymentHeader.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Printer, Download, Save, Share2, MoreVertical, Edit, Trash2, XCircle, MessageSquare, Upload, CreditCard, Smartphone, Loader2, Calendar, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/components/residentui/lib/resident-ui-utils';
import { getPaymentMethodIcon, getPaymentMethodColor } from '@/utils/portal/payments/payment-utils';
import { Payment } from '@/utils/portal/payments/payment-utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface PaymentHeaderProps {
    payment: Payment;
    statusConfig: any;
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

export function PaymentHeader({
    payment,
    statusConfig,
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
}: PaymentHeaderProps) {
    const MethodIcon = getPaymentMethodIcon(payment.payment_method);
    const StatusIcon = statusConfig.icon;

    const formatDateWithFormat = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return formatDate(dateString, 'MMM D, YYYY');
    };

    return (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
                <Link href="/portal/payments">
                    <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </Link>
                
                <div className="flex items-start gap-3">
                    <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center",
                        getPaymentMethodColor(payment.payment_method)
                    )}>
                        <MethodIcon className="h-6 w-6" />
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                OR #{payment.or_number}
                            </h1>
                            <Badge className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                statusConfig.bgColor,
                                statusConfig.color
                            )}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                            </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                            {payment.purpose}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDateWithFormat(payment.payment_date)}
                            </div>
                            {payment.reference_number && (
                                <div className="flex items-center gap-1">
                                    <Hash className="h-4 w-4" />
                                    Ref: {payment.reference_number}
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 rounded-lg"
                                    onClick={onCopyOrNumber}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-2">
                {payment.status === 'pending' && canPayOnline && (
                    <Button
                        className="gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                        onClick={onPayOnline}
                    >
                        <Smartphone className="h-4 w-4" />
                        Pay Online
                    </Button>
                )}
                
                {payment.status === 'completed' && canPrint && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="gap-2 rounded-xl"
                                    onClick={onPrint}
                                    disabled={isPrinting}
                                >
                                    {isPrinting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Printer className="h-4 w-4" />
                                    )}
                                    Print
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Print receipt</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                
                {payment.status === 'completed' && canDownload && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="gap-2 rounded-xl"
                                    onClick={onDownload}
                                    disabled={isDownloadingReceipt}
                                >
                                    {isDownloadingReceipt ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    Download
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download receipt</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                
                {payment.status === 'completed' && (
                    <Button
                        variant="outline"
                        className="gap-2 rounded-xl"
                        onClick={onSaveReceipt}
                        disabled={isSavingReceipt}
                    >
                        {isSavingReceipt ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save
                    </Button>
                )}

                <Button
                    variant="outline"
                    className="gap-2 rounded-xl"
                    onClick={onShare}
                >
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>

                {(canEdit || canDelete || canAddNote || canUploadAttachment || payment.status === 'pending') && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-xl">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {payment.status === 'pending' && (
                                <>
                                    <DropdownMenuItem onClick={onChangePaymentMethod}>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Change Payment Method
                                    </DropdownMenuItem>
                                    {canEdit && (
                                        <DropdownMenuItem onClick={onEdit}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Payment
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={onCancel} className="text-amber-600">
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel Payment
                                    </DropdownMenuItem>
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
                            
                            {canDelete && payment.status === 'pending' && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={onDelete}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Payment
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}
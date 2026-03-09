import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Tag, 
    FileText, 
    Edit, 
    Eye, 
    Printer, 
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    DollarSign,
    FileCode,
    Shield
} from 'lucide-react';
import { ClearanceRequest } from '@/types/clearance';
import { JSX } from 'react';

interface HeaderWithActionsProps {
    clearance: ClearanceRequest;
    canEdit: boolean;
    canDelete: boolean;
    canPrint: boolean;
    isPrinting: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onPrint: () => void;
    onPreview: () => void;
    onCopyReference: () => void;
    getStatusVariant: (status: string) => any;
    getStatusIcon: (status: string) => JSX.Element | null;
}

export function HeaderWithActions({
    clearance,
    canEdit,
    canDelete,
    canPrint,
    isPrinting,
    onEdit,
    onDelete,
    onPrint,
    onPreview,
    onCopyReference,
    getStatusVariant,
    getStatusIcon
}: HeaderWithActionsProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/admin/clearances">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to List
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Clearance Request</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getStatusVariant(clearance.status)} className="flex items-center gap-1">
                            {getStatusIcon(clearance.status)}
                            {clearance.status_display || clearance.status}
                        </Badge>
                        <div className="flex items-center gap-2">
                            <Tag className="h-3 w-3 text-gray-500" />
                            <span className="text-sm text-gray-600 font-mono cursor-pointer hover:underline" 
                                  onClick={onCopyReference} 
                                  title="Click to copy">
                                {clearance.reference_number}
                            </span>
                        </div>
                        {clearance.clearance_number && (
                            <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-gray-500" />
                                <span className="text-sm text-gray-600 font-mono">
                                    {clearance.clearance_number}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {canEdit && (
                    <Button variant="outline" onClick={onEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                )}

                {/* Print button shows when payment is paid, regardless of status */}
                {clearance.payment_status === 'paid' && (
                    <>
                        <Button variant="outline" onClick={onPreview} disabled={isPrinting}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Clearance
                        </Button>
                        <Button onClick={onPrint} disabled={isPrinting}>
                            <Printer className="h-4 w-4 mr-2" />
                            {isPrinting ? 'Printing...' : 'Print Clearance'}
                        </Button>
                    </>
                )}
                
                {canPrint && clearance.status === 'issued' && clearance.payment_status !== 'paid' && (
                    <Button onClick={onPrint} disabled={isPrinting}>
                        <Printer className="h-4 w-4 mr-2" />
                        {isPrinting ? 'Printing...' : 'Print Certificate'}
                    </Button>
                )}
                
                {canDelete && ['pending', 'pending_payment'].includes(clearance.status) && (
                    <Button variant="outline" onClick={onDelete} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                )}
            </div>
        </div>
    );
}
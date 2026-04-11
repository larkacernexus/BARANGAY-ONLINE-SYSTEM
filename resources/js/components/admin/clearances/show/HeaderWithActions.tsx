// components/admin/clearances/show/HeaderWithActions.tsx
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
    Copy,
    Check,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    FileCheck,
    AlertCircle
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ClearanceRequest } from '@/types/admin/clearances/clearance';
import { JSX, useState } from 'react';

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
    const [copied, setCopied] = useState(false);

    const handleCopyReference = () => {
        onCopyReference();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            'pending': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            'pending_payment': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            'processing': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
            'approved': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'issued': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'rejected': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
            'cancelled': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    };

    const getIconForStatus = (status: string) => {
        switch (status) {
            case 'pending':
            case 'pending_payment':
                return <Clock className="h-3 w-3" />;
            case 'processing':
                return <RefreshCw className="h-3 w-3" />;
            case 'approved':
                return <CheckCircle className="h-3 w-3" />;
            case 'issued':
                return <FileCheck className="h-3 w-3" />;
            case 'rejected':
            case 'cancelled':
                return <XCircle className="h-3 w-3" />;
            default:
                return <AlertCircle className="h-3 w-3" />;
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href="/admin/clearances">
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Clearances
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg ${
                        clearance.status === 'approved' || clearance.status === 'issued'
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700'
                            : clearance.status === 'processing'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700'
                            : clearance.status === 'pending' || clearance.status === 'pending_payment'
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700'
                            : clearance.status === 'rejected' || clearance.status === 'cancelled'
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700'
                            : 'bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700'
                    }`}>
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                            Clearance Request
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className={getStatusColor(clearance.status)}>
                                {getIconForStatus(clearance.status)}
                                <span className="ml-1">{clearance.status_display || clearance.status}</span>
                            </Badge>
                            
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 rounded-full cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                                            onClick={handleCopyReference}
                                        >
                                            <Tag className="h-3 w-3" />
                                            <span className="text-sm font-mono">
                                                {clearance.reference_number}
                                            </span>
                                            {copied ? (
                                                <Check className="h-3 w-3 ml-1" />
                                            ) : (
                                                <Copy className="h-3 w-3 ml-1" />
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Click to copy reference number</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {clearance.clearance_number && (
                                <div className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full">
                                    <FileText className="h-3 w-3" />
                                    <span className="text-sm font-mono">
                                        {clearance.clearance_number}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onCopyReference}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Ref #
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy reference number</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {canPrint && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onPreview}
                                    className="dark:border-gray-600 dark:text-gray-300"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Preview clearance</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {canPrint && (
                    <Button
                        onClick={onPrint}
                        disabled={isPrinting}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        {isPrinting ? 'Printing...' : 'Print'}
                    </Button>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                        <DropdownMenuLabel className="dark:text-gray-100">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="dark:bg-gray-700" />
                        
                        {canEdit && (
                            <DropdownMenuItem onClick={onEdit} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                        )}
                        
                        {canDelete && ['pending', 'pending_payment'].includes(clearance.status) && (
                            <DropdownMenuItem 
                                onClick={onDelete} 
                                className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, Eye, CreditCard, Check, User, Download, DollarSign, FileCheck } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { StatusBadge } from './StatusBadge';
import { ClearanceUrgencyBadge } from './ClearanceUrgencyBadge';

interface MobileCardProps {
    item: {
        id: number;
        type: 'fee' | 'clearance';
        code: string; // fee_code or reference_number
        secondaryCode?: string; // or_number or clearance_number
        title: string; // purpose or clearance type
        subtitle?: string; // fee_type category or specific_purpose
        issueDate: string;
        dueDate?: string;
        amount: number;
        balance: number;
        amountPaid: number;
        status: string;
        isOverdue: boolean;
        daysOverdue?: number;
        urgency?: string; // For clearances only
        requestedBy?: string; // For clearances only
    };
    selectMode: boolean;
    selectedItems: number[];
    toggleSelectItem: (id: number) => void;
    formatDate: (dateString: string) => string;
    formatCurrency: (amount: number) => string;
    itemType: 'fee' | 'clearance';
    currentUserId?: number;
    residentId?: number;
}

export function MobileCard({ 
    item, 
    selectMode, 
    selectedItems, 
    toggleSelectItem,
    formatDate,
    formatCurrency,
    itemType,
    currentUserId,
    residentId
}: MobileCardProps) {
    return (
        <Card className="mb-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {selectMode && (
                                    <button
                                        onClick={() => toggleSelectItem(item.id)}
                                        className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-colors ${
                                            selectedItems.includes(item.id)
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'border-gray-300 hover:border-blue-500'
                                        }`}
                                    >
                                        {selectedItems.includes(item.id) && (
                                            <Check className="h-3 w-3 text-white" />
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(item.code);
                                        toast.success(`Copied: ${item.code}`);
                                    }}
                                    className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors truncate"
                                    title="Copy reference"
                                >
                                    {item.code}
                                </button>
                                {item.secondaryCode && (
                                    <Badge variant="outline" size="sm" className="text-xs truncate max-w-[80px]">
                                        {item.secondaryCode}
                                    </Badge>
                                )}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {item.title}
                            </h4>
                            {item.subtitle && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {item.subtitle}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="text-lg font-bold">{formatCurrency(item.amount)}</div>
                            <div className="flex flex-col items-end gap-1">
                                {item.urgency && itemType === 'clearance' && (
                                    <ClearanceUrgencyBadge urgency={item.urgency} />
                                )}
                                <StatusBadge 
                                    status={item.status} 
                                    isOverdue={item.isOverdue}
                                    type={itemType}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {itemType === 'fee' ? 'Issued' : 'Requested'}
                            </p>
                            <p className="font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(item.issueDate)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {itemType === 'fee' ? 'Due' : 'Needed By'}
                            </p>
                            <p className={`font-medium flex items-center gap-1 ${item.isOverdue ? 'text-red-600' : ''}`}>
                                <Calendar className="h-3 w-3" />
                                {item.dueDate ? formatDate(item.dueDate) : 'N/A'}
                            </p>
                        </div>
                    </div>
                    
                    {itemType === 'clearance' && item.requestedBy && (
                        <div className="text-sm">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Requested By</p>
                            <p className="font-medium flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {item.requestedBy}
                                {residentId === currentUserId && ' (You)'}
                            </p>
                        </div>
                    )}
                    
                    {item.isOverdue && item.daysOverdue && item.daysOverdue > 0 && (
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                            <div className="flex items-center gap-1 text-red-700 dark:text-red-300 text-sm">
                                <AlertCircle className="h-3 w-3" />
                                <span>{item.daysOverdue} days overdue</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <Link 
                            href={itemType === 'fee' ? `/residentfees/${item.id}` : `/my-clearances/${item.id}`} 
                            className="flex-1"
                        >
                            <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </Button>
                        </Link>
                        <div className="flex gap-1 ml-2">
                            {item.balance > 0 && item.status !== 'cancelled' && item.status !== 'rejected' && (
                                <>
                                    {itemType === 'fee' && (
                                        <Link href={`/resident/payments/create?fee_id=${item.id}`}>
                                            <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                                                <CreditCard className="h-4 w-4 mr-1" />
                                                Pay
                                            </Button>
                                        </Link>
                                    )}
                                    {itemType === 'clearance' && item.status === 'pending_payment' && (
                                        <Button 
                                            size="sm" 
                                            variant="default" 
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => toast.info('Payment functionality would open here')}
                                        >
                                            <DollarSign className="h-4 w-4 mr-1" />
                                            Pay
                                        </Button>
                                    )}
                                </>
                            )}
                            {itemType === 'clearance' && item.status === 'issued' && item.secondaryCode && (
                                <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => toast.info('Download functionality would be implemented here')}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
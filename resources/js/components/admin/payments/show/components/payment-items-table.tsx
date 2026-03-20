// resources/js/Pages/Admin/Payments/components/payment-items-table.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    AlertTriangle,
    ChevronUp,
    ChevronDown,
    FileSearch,
    FileBarChart,
} from 'lucide-react';
import { PaymentItem } from '../types';
import { formatCurrency, getRoute } from '../utils/helpers';

interface Props {
    items: PaymentItem[];
}

export const PaymentItemsTable = ({ items }: Props) => {
    const hasLateFees = items.some(item => item.surcharge > 0 || item.penalty > 0);
    const [expandedItems, setExpandedItems] = useState<number[]>([]);

    const toggleItem = (id: number) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    if (items.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold dark:text-gray-100">Payment Items ({items.length})</h4>
                {hasLateFees && (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Contains Late Fees
                    </Badge>
                )}
            </div>
            
            <div className="rounded-md border dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader className="dark:bg-gray-900">
                        <TableRow className="dark:border-gray-700">
                            <TableHead className="w-[40%] dark:text-gray-300">Item Description</TableHead>
                            <TableHead className="text-right dark:text-gray-300">Base Amount</TableHead>
                            <TableHead className="text-right dark:text-gray-300">Surcharge</TableHead>
                            <TableHead className="text-right dark:text-gray-300">Penalty</TableHead>
                            <TableHead className="text-right dark:text-gray-300">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow 
                                key={item.id} 
                                className="dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                onClick={() => toggleItem(item.id)}
                            >
                                <TableCell>
                                    <div className="flex items-start gap-2">
                                        <div className="mt-1">
                                            {expandedItems.includes(item.id) ? (
                                                <ChevronUp className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium dark:text-gray-100">{item.fee_name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-2">
                                                <span>Code: {item.fee_code}</span>
                                                {item.category && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{item.category}</span>
                                                    </>
                                                )}
                                            </div>
                                            {expandedItems.includes(item.id) && (
                                                <div className="mt-2 space-y-2">
                                                    {item.description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                                    )}
                                                    {item.period_covered && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Period: {item.period_covered}
                                                        </p>
                                                    )}
                                                    {item.months_late && item.months_late > 0 && (
                                                        <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                                                            {item.months_late} month(s) late
                                                        </Badge>
                                                    )}
                                                    <div className="flex gap-2 pt-1">
                                                        {item.clearanceRequest && (
                                                            <Link 
                                                                href={getRoute('admin.clearance-requests.show', item.clearanceRequest.id)}
                                                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1"
                                                            >
                                                                <FileSearch className="h-3 w-3" />
                                                                View Clearance
                                                            </Link>
                                                        )}
                                                        {item.fee && (
                                                            <Link 
                                                                href={getRoute('admin.fees.show', item.fee.id)}
                                                                className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:underline inline-flex items-center gap-1"
                                                            >
                                                                <FileBarChart className="h-3 w-3" />
                                                                View Fee
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="font-medium dark:text-gray-100">{formatCurrency(item.base_amount)}</div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.surcharge > 0 ? (
                                        <div className="text-amber-600 dark:text-amber-400 font-medium">
                                            {formatCurrency(item.surcharge)}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-600">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.penalty > 0 ? (
                                        <div className="text-red-600 dark:text-red-400 font-medium">
                                            {formatCurrency(item.penalty)}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-600">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="font-bold dark:text-gray-100">
                                        {formatCurrency(item.total_amount)}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            {hasLateFees && (
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                    <span>This payment includes late fees. Surcharge and penalty amounts are calculated based on the number of months late.</span>
                </div>
            )}
        </div>
    );
};
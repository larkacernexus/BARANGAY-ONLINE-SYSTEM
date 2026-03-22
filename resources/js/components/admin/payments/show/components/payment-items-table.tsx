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
    Receipt,
} from 'lucide-react';
import { PaymentItem } from '../types';
import { formatCurrency, getRoute } from '../utils/helpers';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface Props {
    items: PaymentItem[];
}

export const PaymentItemsTable = ({ items }: Props) => {
    const hasLateFees = items.some(item => item.surcharge > 0 || item.penalty > 0);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const toggleItem = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    if (items.length === 0) return null;

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Receipt className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Payment Items
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Breakdown of payment items included in this transaction
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {items.length} item(s)
                            </span>
                            {hasLateFees && (
                                <Badge variant="outline" className="text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Contains Late Fees
                                </Badge>
                            )}
                        </div>
                    </div>
                    
                    <div className="rounded-md border dark:border-gray-700 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                                <TableRow className="border-gray-200 dark:border-gray-700 hover:bg-transparent">
                                    <TableHead className="w-[40%] text-gray-700 dark:text-gray-300">
                                        Item Description
                                    </TableHead>
                                    <TableHead className="text-right text-gray-700 dark:text-gray-300">
                                        Base Amount
                                    </TableHead>
                                    <TableHead className="text-right text-gray-700 dark:text-gray-300">
                                        Surcharge
                                    </TableHead>
                                    <TableHead className="text-right text-gray-700 dark:text-gray-300">
                                        Penalty
                                    </TableHead>
                                    <TableHead className="text-right text-gray-700 dark:text-gray-300">
                                        Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <React.Fragment key={item.id}>
                                        <TableRow 
                                            className="border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            onClick={() => toggleItem(item.id)}
                                        >
                                            <TableCell className="py-4">
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-1 flex-shrink-0">
                                                        {expandedIds.includes(item.id) ? (
                                                            <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {item.fee_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-2 mt-0.5">
                                                            <span>Code: {item.fee_code}</span>
                                                            {item.category && (
                                                                <>
                                                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                                                    <span>{item.category}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right align-middle">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(item.base_amount)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right align-middle">
                                                {item.surcharge > 0 ? (
                                                    <div className="text-amber-600 dark:text-amber-400 font-medium">
                                                        {formatCurrency(item.surcharge)}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right align-middle">
                                                {item.penalty > 0 ? (
                                                    <div className="text-red-600 dark:text-red-400 font-medium">
                                                        {formatCurrency(item.penalty)}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right align-middle">
                                                <div className="font-bold text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(item.total_amount)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        
                                        {/* Expanded Details */}
                                        {expandedIds.includes(item.id) && (
                                            <TableRow className="bg-gray-50 dark:bg-gray-800/30">
                                                <TableCell colSpan={5} className="p-4">
                                                    <div className="space-y-3">
                                                        {item.description && (
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {item.period_covered && (
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Period Covered</p>
                                                                    <p className="text-sm text-gray-900 dark:text-gray-100">{item.period_covered}</p>
                                                                </div>
                                                            )}
                                                            {item.months_late && item.months_late > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Late Status</p>
                                                                    <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                                                                        {item.months_late} month(s) late
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex gap-3 pt-2">
                                                            {item.clearanceRequest && (
                                                                <Link 
                                                                    href={getRoute('admin.clearance-requests.show', item.clearanceRequest.id)}
                                                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                >
                                                                    <FileSearch className="h-3 w-3" />
                                                                    View Clearance Request
                                                                </Link>
                                                            )}
                                                            {item.fee && (
                                                                <Link 
                                                                    href={getRoute('admin.fees.show', item.fee.id)}
                                                                    className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                                >
                                                                    <FileBarChart className="h-3 w-3" />
                                                                    View Fee Details
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    
                    {hasLateFees && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>This payment includes late fees. Surcharge and penalty amounts are calculated based on the number of months late.</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
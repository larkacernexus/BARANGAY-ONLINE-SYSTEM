// resources/js/Pages/Admin/FeeTypes/components/recent-fees-tab.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    CreditCard,
    Plus,
    Eye,
    FileText,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Props {
    recentFees: any[];
    feeTypeId: number;
    formatCurrency: (amount: any) => string;
    formatDate: (date: string) => string;
    getFeeStatusClass: (status: string) => string;
}

export const RecentFeesTab = ({ recentFees, feeTypeId, formatCurrency, formatDate, getFeeStatusClass }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <CreditCard className="h-5 w-5" />
                            Recent Fees
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Recently created fees using this fee type
                        </CardDescription>
                    </div>
                    <Link href={route('admin.fees.create', { fee_type: feeTypeId })}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Fee
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {recentFees.length > 0 ? (
                    <div className="space-y-4">
                        <div className="rounded-md border dark:border-gray-700">
                            <Table>
                                <TableHeader className="dark:bg-gray-900">
                                    <TableRow className="dark:border-gray-700">
                                        <TableHead className="dark:text-gray-300">Fee ID</TableHead>
                                        <TableHead className="dark:text-gray-300">Resident/Household</TableHead>
                                        <TableHead className="dark:text-gray-300">Amount</TableHead>
                                        <TableHead className="dark:text-gray-300">Status</TableHead>
                                        <TableHead className="dark:text-gray-300">Due Date</TableHead>
                                        <TableHead className="dark:text-gray-300">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentFees.map((fee) => (
                                        <TableRow key={fee.id} className="dark:border-gray-700">
                                            <TableCell className="font-mono dark:text-gray-300">
                                                {fee.code || `FEE-${fee.id}`}
                                            </TableCell>
                                            <TableCell>
                                                {fee.resident ? (
                                                    <div>
                                                        <div className="font-medium dark:text-gray-200">{fee.resident.full_name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Resident • {fee.resident.purok}
                                                        </div>
                                                    </div>
                                                ) : fee.household ? (
                                                    <div>
                                                        <div className="font-medium dark:text-gray-200">{fee.household.household_number}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Household • {fee.household.purok}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold dark:text-gray-200">{formatCurrency(fee.amount)}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getFeeStatusClass(fee.status)}>
                                                    {fee.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium dark:text-gray-200">{formatDate(fee.due_date)}</div>
                                                {new Date(fee.due_date) < new Date() && fee.status === 'pending' && (
                                                    <div className="text-xs text-red-600 dark:text-red-400">Overdue</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" asChild className="dark:text-gray-400 dark:hover:text-white">
                                                    <Link href={route('admin.fees.show', fee.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex justify-center">
                            <Button variant="outline" asChild className="dark:border-gray-600 dark:text-gray-300">
                                <Link href={route('admin.fees.index', { fee_type: feeTypeId })}>
                                    View All Associated Fees
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FileText className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No fees created yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            No fees have been created using this fee type
                        </p>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Link href={route('admin.fees.create', { fee_type: feeTypeId })}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Fee
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
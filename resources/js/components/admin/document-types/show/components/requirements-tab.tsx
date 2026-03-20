// resources/js/Pages/Admin/DocumentTypes/components/requirements-tab.tsx
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
    ListChecks,
    Eye,
    FileText,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Props {
    requiredClearanceTypes: any[];
}

export const RequirementsTab = ({ requiredClearanceTypes }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <ListChecks className="h-5 w-5" />
                            Clearance Types Requiring This Document
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            {requiredClearanceTypes.length} clearance type(s) require this document
                        </CardDescription>
                    </div>
                    <Link href={route('admin.clearance-types.index')}>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <Eye className="h-4 w-4 mr-2" />
                            View All Clearance Types
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {requiredClearanceTypes.length > 0 ? (
                    <div className="space-y-4">
                        <div className="rounded-md border dark:border-gray-700">
                            <Table>
                                <TableHeader className="dark:bg-gray-900">
                                    <TableRow className="dark:border-gray-700">
                                        <TableHead className="dark:text-gray-300">Code</TableHead>
                                        <TableHead className="dark:text-gray-300">Name</TableHead>
                                        <TableHead className="dark:text-gray-300">Description</TableHead>
                                        <TableHead className="dark:text-gray-300">Status</TableHead>
                                        <TableHead className="dark:text-gray-300">Sort Order</TableHead>
                                        <TableHead className="dark:text-gray-300">Required</TableHead>
                                        <TableHead className="dark:text-gray-300">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requiredClearanceTypes.map((type) => (
                                        <TableRow key={type.id} className="dark:border-gray-700">
                                            <TableCell className="font-mono text-sm dark:text-gray-300">
                                                {type.code}
                                            </TableCell>
                                            <TableCell className="font-medium dark:text-gray-200">
                                                <Link href={route('admin.clearance-types.show', type.id)} className="hover:text-blue-600 dark:hover:text-blue-400">
                                                    {type.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                                                {type.description || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {type.is_active ? (
                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="dark:text-gray-300">{type.pivot?.sort_order || 0}</TableCell>
                                            <TableCell>
                                                {type.pivot?.is_required ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" asChild className="dark:text-gray-400 dark:hover:text-white">
                                                    <Link href={route('admin.clearance-types.show', type.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                            <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">No Requirements Found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            This document type is not required for any clearance types yet.
                        </p>
                        <Button variant="outline" asChild className="dark:border-gray-600 dark:text-gray-300">
                            <Link href={route('admin.clearance-types.index')}>
                                Manage Clearance Types
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
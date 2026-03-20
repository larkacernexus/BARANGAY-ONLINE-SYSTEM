// resources/js/Pages/Admin/Reports/ReportTypes/components/recent-reports-tab.tsx
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
    FileText,
    Eye,
    Plus,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Props {
    recentReports: any[];
    reportTypeId: number;
    getPriorityIcon: (level: number) => React.ReactNode;
    formatShortDate: (date: string) => string;
}

export const RecentReportsTab = ({ recentReports, reportTypeId, getPriorityIcon, formatShortDate }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                            <FileText className="h-5 w-5" />
                            Recent Reports
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Latest reports filed under this type
                        </CardDescription>
                    </div>
                    <Link href={route('admin.community-reports.create', { type: reportTypeId })}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            New Report
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {recentReports.length > 0 ? (
                    <div className="space-y-4">
                        <div className="rounded-md border dark:border-gray-700">
                            <Table>
                                <TableHeader className="dark:bg-gray-900">
                                    <TableRow className="dark:border-gray-700">
                                        <TableHead className="dark:text-gray-300">Reference #</TableHead>
                                        <TableHead className="dark:text-gray-300">Title</TableHead>
                                        <TableHead className="dark:text-gray-300">Status</TableHead>
                                        <TableHead className="dark:text-gray-300">Priority</TableHead>
                                        <TableHead className="dark:text-gray-300">Reporter</TableHead>
                                        <TableHead className="dark:text-gray-300">Created</TableHead>
                                        <TableHead className="dark:text-gray-300">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentReports.map((report: any) => (
                                        <TableRow key={report.id} className="dark:border-gray-700">
                                            <TableCell className="font-mono text-xs dark:text-gray-300">
                                                {report.reference_number}
                                            </TableCell>
                                            <TableCell className="font-medium dark:text-gray-200">
                                                {report.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    report.status === 'resolved' ? 'default' :
                                                    report.status === 'pending' ? 'outline' :
                                                    report.status === 'in_progress' ? 'secondary' :
                                                    'destructive'
                                                } className={report.status === 'resolved' ? 'dark:bg-green-900/30 dark:text-green-300' : ''}>
                                                    {report.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {getPriorityIcon(report.priority_level)}
                                                    <span className="text-xs dark:text-gray-300">L{report.priority_level}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="dark:text-gray-300">{report.reporter_name}</TableCell>
                                            <TableCell className="dark:text-gray-300">{formatShortDate(report.created_at)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    className="dark:text-gray-400 dark:hover:text-white"
                                                >
                                                    <a href={route('admin.community-reports.show', report.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex justify-center">
                            <Button variant="outline" asChild className="dark:border-gray-600 dark:text-gray-300">
                                <Link href={route('admin.community-reports.index', { type: reportTypeId })}>
                                    View All Reports
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                            <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">No Reports Yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            No reports have been filed under this type.
                        </p>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Link href={route('admin.community-reports.create', { type: reportTypeId })}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Report
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
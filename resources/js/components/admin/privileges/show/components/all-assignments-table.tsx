// resources/js/Pages/Admin/Privileges/components/all-assignments-table.tsx

import React from 'react';
import { Link } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, UserPlus, Clock, XCircle, CheckCircle } from 'lucide-react';
import { ResidentPrivilege as PrivilegeAssignment, Resident } from '@/types/admin/privileges/privilege.types';

interface Props {
    assignments: PrivilegeAssignment[];
    canAssign: boolean;
    onAssignClick: () => void;
}

// Helper functions
const formatDate = (dateString: string | null, includeTime: boolean = false): string => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return format(date, includeTime ? 'MMM dd, yyyy hh:mm a' : 'MMM dd, yyyy');
    } catch (error) {
        return 'Invalid date';
    }
};

const getAssignmentStatusBadge = (assignment: PrivilegeAssignment) => {
    if (!assignment.verified_at) {
        return (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pending
            </Badge>
        );
    }
    
    if (assignment.expires_at && new Date(assignment.expires_at) < new Date()) {
        return (
            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Expired
            </Badge>
        );
    }
    
    return (
        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
        </Badge>
    );
};

const getFullName = (resident?: Resident): string => {
    if (!resident) return 'Unknown Resident';
    let name = `${resident.first_name}`;
    if (resident.middle_name) {
        name += ` ${resident.middle_name.charAt(0)}.`;
    }
    name += ` ${resident.last_name}`;
    return name;
};

export const AllAssignmentsTable = ({
    assignments,
    canAssign,
    onAssignClick
}: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="dark:text-gray-100">All Assignments</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Complete list of residents with this privilege
                    </CardDescription>
                </div>
                {canAssign && (
                    <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={onAssignClick}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        New Assignment
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="rounded-md border dark:border-gray-700">
                    <Table>
                        <TableHeader className="dark:bg-gray-900">
                            <TableRow className="dark:border-gray-700">
                                <TableHead className="dark:text-gray-300">Resident</TableHead>
                                <TableHead className="dark:text-gray-300">ID Number</TableHead>
                                <TableHead className="dark:text-gray-300">Status</TableHead>
                                <TableHead className="dark:text-gray-300">Verified At</TableHead>
                                <TableHead className="dark:text-gray-300">Expires At</TableHead>
                                <TableHead className="dark:text-gray-300">Assigned</TableHead>
                                <TableHead className="dark:text-gray-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No assignments yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assignments.map((assignment) => (
                                    <TableRow key={assignment.id} className="dark:border-gray-700">
                                        <TableCell className="font-medium dark:text-gray-200">
                                            {assignment.resident ? (
                                                <Link href={`/admin/residents/${assignment.resident_id}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                                                    {getFullName(assignment.resident)}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-500 italic">Resident not found</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="dark:text-gray-300">
                                            {assignment.id_number || <span className="text-gray-400 italic">N/A</span>}
                                        </TableCell>
                                        <TableCell>
                                            {getAssignmentStatusBadge(assignment)}
                                        </TableCell>
                                        <TableCell className="dark:text-gray-300">
                                            {assignment.verified_at ? formatDate(assignment.verified_at) : '-'}
                                        </TableCell>
                                        <TableCell className="dark:text-gray-300">
                                            {assignment.expires_at ? formatDate(assignment.expires_at) : 'Lifetime'}
                                        </TableCell>
                                        <TableCell className="dark:text-gray-300">
                                            {formatDate(assignment.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            {assignment.resident ? (
                                                <Link href={`/admin/residents/${assignment.resident_id}`}>
                                                    <Button size="sm" variant="ghost" className="dark:text-gray-400 dark:hover:text-white">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button size="sm" variant="ghost" disabled className="dark:text-gray-600">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
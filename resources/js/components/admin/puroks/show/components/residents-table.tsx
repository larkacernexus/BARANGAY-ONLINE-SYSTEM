// resources/js/Pages/Admin/Puroks/components/residents-table.tsx
import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Users,
    UserPlus,
    Eye,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { PaginatedData, Resident } from '../types';

interface Props {
    residents: PaginatedData<Resident>;
    purokId: number;
    purokName: string;
}

export const ResidentsTable = ({ residents, purokId, purokName }: Props) => {
    const handlePageChange = (page: number) => {
        router.get(`/admin/puroks/${purokId}`, { resident_page: page }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getFullName = (resident: Resident) => {
        let name = `${resident.first_name}`;
        if (resident.middle_name) {
            name += ` ${resident.middle_name.charAt(0)}.`;
        }
        name += ` ${resident.last_name}`;
        return name;
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Users className="h-5 w-5" />
                        Residents in this Purok
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        {residents.total} resident{residents.total !== 1 ? 's' : ''} registered
                    </CardDescription>
                </div>
                <Link href={`/residents?purok=${encodeURIComponent(purokName)}`}>
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border dark:border-gray-700">
                    <Table>
                        <TableHeader className="dark:bg-gray-900">
                            <TableRow className="dark:border-gray-700">
                                <TableHead className="dark:text-gray-300">Name</TableHead>
                                <TableHead className="dark:text-gray-300">Age</TableHead>
                                <TableHead className="dark:text-gray-300">Gender</TableHead>
                                <TableHead className="dark:text-gray-300">Contact</TableHead>
                                <TableHead className="dark:text-gray-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {residents.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No residents in this purok yet.
                                        <div className="mt-2">
                                            <Link href="/residents/create">
                                                <Button size="sm" variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                                    <UserPlus className="h-3 w-3 mr-1" />
                                                    Register Resident
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                residents.data.map((resident) => (
                                    <TableRow key={resident.id} className="dark:border-gray-700">
                                        <TableCell className="font-medium dark:text-gray-200">
                                            <Link href={`/residents/${resident.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                                                {getFullName(resident)}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="dark:text-gray-300">{resident.age}</TableCell>
                                        <TableCell className="dark:text-gray-300">{resident.gender}</TableCell>
                                        <TableCell className="dark:text-gray-300">{resident.contact_number || 'N/A'}</TableCell>
                                        <TableCell>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link href={`/residents/${resident.id}`}>
                                                            <Button size="sm" variant="ghost" className="dark:text-gray-400 dark:hover:text-white">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>View resident details</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {/* Pagination for residents */}
                {residents.last_page > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {residents.data.length} of {residents.total} residents
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(residents.current_page - 1)}
                                disabled={residents.current_page === 1}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(residents.current_page + 1)}
                                disabled={residents.current_page === residents.last_page}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
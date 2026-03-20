// resources/js/Pages/Admin/Puroks/components/households-table.tsx
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
    Home,
    Users,
    Eye,
    PlusCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { PaginatedData, Household } from '../types';

interface Props {
    households: PaginatedData<Household>;
    purokId: number;
    purokName: string;
}

export const HouseholdsTable = ({ households, purokId, purokName }: Props) => {
    const handlePageChange = (page: number) => {
        router.get(`/admin/puroks/${purokId}`, { household_page: page }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Home className="h-5 w-5" />
                        Households in this Purok
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        {households.total} household{households.total !== 1 ? 's' : ''} registered
                    </CardDescription>
                </div>
                <Link href={`/households?purok=${encodeURIComponent(purokName)}`}>
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
                                <TableHead className="dark:text-gray-300">Household No.</TableHead>
                                <TableHead className="dark:text-gray-300">Head of Family</TableHead>
                                <TableHead className="dark:text-gray-300">Members</TableHead>
                                <TableHead className="dark:text-gray-300">Contact</TableHead>
                                <TableHead className="dark:text-gray-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {households.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No households in this purok yet.
                                        <div className="mt-2">
                                            <Link href="/households/create">
                                                <Button size="sm" variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                                    <PlusCircle className="h-3 w-3 mr-1" />
                                                    Register Household
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                households.data.map((household) => (
                                    <TableRow key={household.id} className="dark:border-gray-700">
                                        <TableCell className="font-medium dark:text-gray-200">
                                            <Link href={`/households/${household.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                                                {household.household_number}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="dark:text-gray-300">{household.head_of_family}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                                <span className="dark:text-gray-300">{household.member_count}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="dark:text-gray-300">{household.contact_number || 'N/A'}</TableCell>
                                        <TableCell>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link href={`/households/${household.id}`}>
                                                            <Button size="sm" variant="ghost" className="dark:text-gray-400 dark:hover:text-white">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>View household details</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {/* Pagination for households */}
                {households.last_page > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {households.data.length} of {households.total} households
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(households.current_page - 1)}
                                disabled={households.current_page === 1}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(households.current_page + 1)}
                                disabled={households.current_page === households.last_page}
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
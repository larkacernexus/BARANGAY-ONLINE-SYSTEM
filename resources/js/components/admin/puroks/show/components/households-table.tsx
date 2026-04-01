import React, { useState } from 'react';
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
    MapPin,
} from 'lucide-react';
import { Household } from '@/types/admin/puroks/purok';
import { SingleHouseholdMapModal } from './SingleHouseholdMapModal';

interface HouseholdsPaginatedData {
    data: Household[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}

interface Props {
    households: HouseholdsPaginatedData;
    purokId: number;
    purokName: string;
}

export const HouseholdsTable = ({ households, purokId, purokName }: Props) => {
    const [singleMapModalOpen, setSingleMapModalOpen] = useState(false);
    const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
    
    const handlePageChange = (page: number) => {
        router.get(`/admin/puroks/${purokId}`, { household_page: page }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleOpenSingleMap = (household: Household) => {
        setSelectedHousehold(household);
        setSingleMapModalOpen(true);
    };

    const getHeadOfHousehold = (household: Household): string => {
        if (household.head_of_household) {
            const head = household.head_of_household;
            let name = `${head.first_name}`;
            if (head.middle_name) {
                name += ` ${head.middle_name.charAt(0)}.`;
            }
            name += ` ${head.last_name}`;
            return name;
        }
        
        if (household.members) {
            const head = household.members.find(member => member.is_head);
            if (head) {
                let name = `${head.first_name}`;
                if (head.middle_name) {
                    name += ` ${head.middle_name.charAt(0)}.`;
                }
                name += ` ${head.last_name}`;
                return name;
            }
        }
        
        return 'Not assigned';
    };

    const hasCoordinates = (household: Household): boolean => {
        return !!(household.latitude && household.longitude);
    };

    const getContactNumber = (household: Household): string => {
        if (household.head_of_household?.contact_number) {
            return household.head_of_household.contact_number;
        }
        return 'N/A';
    };

    return (
        <>
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
                    <div className="flex gap-2">
                        <Link href={`/admin/households/create?purok_id=${purokId}&purok_name=${encodeURIComponent(purokName)}`}>
                            <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700">
                                <PlusCircle className="h-4 w-4 mr-1" />
                                Add Household
                            </Button>
                        </Link>
                        <Link href={`/admin/households?purok_id=${purokId}`}>
                            <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                View All
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
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
                                                <Link href={`/admin/households/create?purok_id=${purokId}&purok_name=${encodeURIComponent(purokName)}`}>
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
                                                <Link 
                                                    href={`/admin/households/${household.id}`} 
                                                    className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                                >
                                                    {household.household_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="dark:text-gray-300">
                                                {getHeadOfHousehold(household)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                                    <span className="dark:text-gray-300">{household.total_members || 0}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="dark:text-gray-300">
                                                {getContactNumber(household)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {hasCoordinates(household) && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="ghost" 
                                                                        onClick={() => handleOpenSingleMap(household)}
                                                                        className="dark:text-green-400 dark:hover:text-green-300"
                                                                    >
                                                                        <MapPin className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>View on map</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Link href={`/admin/households/${household.id}`}>
                                                                    <Button size="sm" variant="ghost" className="dark:text-gray-400 dark:hover:text-white">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent>View household details</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    
                    {households.last_page > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {households.from} to {households.to} of {households.total} households
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

            <SingleHouseholdMapModal
                open={singleMapModalOpen}
                onOpenChange={setSingleMapModalOpen}
                household={selectedHousehold}
                purokName={purokName}
            />
        </>
    );
};
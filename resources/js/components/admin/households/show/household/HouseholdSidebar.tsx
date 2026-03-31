// resources/js/Pages/Admin/Households/Show/components/household/HouseholdSidebar.tsx

import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Award,
    Edit,
    UserPlus,
    Printer,
    Download,
    Copy,
    FileText,
    Trash2,
    Home,
    MapPin,
    Calendar,
    Clock,
    Phone,
    Mail,
    Link as LinkIcon
} from 'lucide-react';
import { useMemo } from 'react';

// Import types from shared types file
import { Household, HouseholdMember, Resident } from '@/types/admin/households/household.types';
import { 
    getFullName, 
    formatDate, 
    getRelativeTime, 
    getStatusLabel, 
    getStatusColor,
    formatDateTime
} from '@/types/admin/households/household.types';

// Extended household type
interface ExtendedHousehold extends Household {
    household_members?: (HouseholdMember & {
        resident?: Resident;
    })[];
    purok?: string;
    contact_number?: string;
    email?: string;
}

interface HouseholdSidebarProps {
    household: ExtendedHousehold;
    activePrivileges: number;
    onCopyLink: () => void;
    onPrint: () => void;
    onDelete: () => void;
    onShowMore: () => void;
    showMore: boolean;
}

// Status Badge component
const StatusBadge = ({ status }: { status: string }) => {
    const label = getStatusLabel(status as any);
    const colorClass = getStatusColor(status as any);
    
    return (
        <Badge className={colorClass}>
            {label}
        </Badge>
    );
};

export const HouseholdSidebar = ({ 
    household, 
    activePrivileges, 
    onCopyLink, 
    onPrint, 
    onDelete,
    onShowMore,
    showMore
}: HouseholdSidebarProps) => {
    // Find head resident
    const headResident = useMemo(() => {
        const headMember = household.household_members?.find(m => m.is_head === true);
        return headMember?.resident;
    }, [household.household_members]);

    const headName = headResident 
        ? getFullName(headResident.first_name, headResident.last_name, headResident.middle_name)
        : 'Not assigned';

    return (
        <div className="space-y-6">
            {/* Status & Actions Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="text-sm font-medium dark:text-gray-100">Household Status & Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                            <StatusBadge status={household.status} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Members</span>
                            <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                <span className="font-medium dark:text-gray-300">{household.member_count}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Active Privileges</span>
                            <div className="flex items-center gap-1">
                                <Award className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                <span className="font-medium dark:text-gray-300">{activePrivileges}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Purok</span>
                            <span className="font-medium dark:text-gray-300">
                                {household.purok_name || household.purok || 'Not specified'}
                            </span>
                        </div>
                    </div>
                    
                    <Separator className="dark:bg-gray-700" />
                    
                    <div className="space-y-2">
                        <Link href={route('admin.households.edit', household.id)}>
                            <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Household
                            </Button>
                        </Link>
                        
                        <Link href={route('admin.residents.create', { household_id: household.id })}>
                            <Button variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add New Resident
                            </Button>
                        </Link>
                        
                        <Button 
                            variant="outline" 
                            className="w-full dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800"
                            onClick={onPrint}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print Details
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            className="w-full dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export to PDF
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Information Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="text-sm font-medium dark:text-gray-100">Quick Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Household ID</span>
                            <code className="text-xs dark:text-gray-300">#{household.id}</code>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Household Number</span>
                            <span className="text-sm font-mono dark:text-gray-300">{household.household_number}</span>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Head of Family</span>
                            <span className="text-sm dark:text-gray-300 truncate max-w-[150px]">
                                {headName}
                            </span>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        {household.contact_number && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Contact Number</span>
                                    <span className="text-sm dark:text-gray-300">{household.contact_number}</span>
                                </div>
                                <Separator className="dark:bg-gray-700" />
                            </>
                        )}
                        {household.email && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                                    <span className="text-sm dark:text-gray-300 truncate max-w-[150px]">{household.email}</span>
                                </div>
                                <Separator className="dark:bg-gray-700" />
                            </>
                        )}
                        <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Registered</span>
                            <p className="text-sm dark:text-gray-300 mt-1">{formatDate(household.created_at)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getRelativeTime(household.created_at)}</p>
                        </div>
                        <Separator className="dark:bg-gray-700" />
                        <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                            <p className="text-sm dark:text-gray-300 mt-1">{formatDate(household.updated_at)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getRelativeTime(household.updated_at)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Share & Export Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="text-sm font-medium dark:text-gray-100">Share & Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCopyLink}
                            className="flex-1 dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800"
                        >
                            <LinkIcon className="h-3 w-3 mr-1" />
                            Copy Link
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800"
                        >
                            <FileText className="h-3 w-3 mr-1" />
                            Copy Details
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onPrint}
                            className="flex-1 dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800"
                        >
                            <Printer className="h-3 w-3 mr-1" />
                            Print
                        </Button>
                        <Link href={route('admin.households.edit', household.id)} className="flex-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full dark:border-gray-600 dark:text-gray-300 hover:dark:bg-gray-800"
                            >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                    <div className="pt-2 border-t dark:border-gray-700">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete Household
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Details Card */}
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="text-sm font-medium dark:text-gray-100 flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Additional Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                        onClick={onShowMore}
                    >
                        {showMore ? 'Show Less' : 'Show More Details'}
                    </Button>
                    
                    {showMore && (
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Address</span>
                                <span className="text-sm dark:text-gray-300 text-right max-w-[200px]">
                                    {household.address}
                                </span>
                            </div>
                            <Separator className="dark:bg-gray-700" />
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Purok ID</span>
                                <span className="text-sm dark:text-gray-300">{household.purok_id || 'N/A'}</span>
                            </div>
                            {household.notes && (
                                <>
                                    <Separator className="dark:bg-gray-700" />
                                    <div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Notes</span>
                                        <p className="text-sm dark:text-gray-300 mt-1 line-clamp-3">
                                            {household.notes}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
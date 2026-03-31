// resources/js/Pages/Admin/Households/Show/components/household/HouseholdHeader.tsx

import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Sparkles,
    Hash,
    Users,
    Award,
    LinkIcon,
    Check,
    Printer,
    Edit,
    Trash2,
} from 'lucide-react';

// Import types and utilities from shared types file
import { Household, HouseholdStatus } from '@/types/admin/households/household.types';
import { isNew } from '@/types/admin/households/household.types';

interface HouseholdHeaderProps {
    household: Household;
    activePrivileges: number;
    onCopyLink: () => void;
    onPrint: () => void;
    onDelete: () => void;
    copied: boolean;
}

export const HouseholdHeader = ({ 
    household, 
    activePrivileges, 
    onCopyLink, 
    onPrint, 
    onDelete,
    copied 
}: HouseholdHeaderProps) => {
    // Helper function to get badge variant based on status
    const getBadgeVariant = (status: HouseholdStatus): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'active':
                return "default";
            case 'inactive':
                return "secondary";
            case 'archived':
                return "destructive";
            default:
                return "secondary";
        }
    };

    // Helper function to get status icon
    const getStatusIcon = (status: HouseholdStatus) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-3 w-3" />;
            case 'inactive':
                return <XCircle className="h-3 w-3" />;
            case 'archived':
                return <XCircle className="h-3 w-3" />;
            default:
                return null;
        }
    };

    // Helper function to get status label
    const getStatusLabel = (status: HouseholdStatus): string => {
        switch (status) {
            case 'active':
                return 'Active';
            case 'inactive':
                return 'Inactive';
            case 'archived':
                return 'Archived';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href={route('admin.households.index')}>
                    <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:bg-gray-900">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Households
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight line-clamp-2 dark:text-gray-100">
                        Household {household.household_number}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge 
                            variant={getBadgeVariant(household.status)} 
                            className="flex items-center gap-1 dark:bg-gray-700 dark:text-gray-300"
                        >
                            {getStatusIcon(household.status)}
                            {getStatusLabel(household.status)}
                        </Badge>
                        
                        {isNew(household.created_at) && (
                            <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white">
                                <Sparkles className="h-3 w-3 mr-1" />
                                New
                            </Badge>
                        )}
                        
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                            <Hash className="h-3 w-3 mr-1" />
                            ID: {household.id}
                        </Badge>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {household.member_count} members
                            </div>
                            <div className="flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                {activePrivileges} active
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCopyLink}
                            className="h-9 dark:border-gray-600 dark:text-gray-300"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 mr-2" />
                            ) : (
                                <LinkIcon className="h-4 w-4 mr-2" />
                            )}
                            {copied ? 'Copied!' : 'Copy Link'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy household link to clipboard</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onPrint}
                            className="h-9 dark:border-gray-600 dark:text-gray-300"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Print household details</TooltipContent>
                </Tooltip>

                <Link href={route('admin.households.edit', household.id)}>
                    <Button variant="outline" size="sm" className="h-9 dark:border-gray-600 dark:text-gray-300">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </Link>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete this household</TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
};
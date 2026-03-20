// resources/js/Pages/Admin/Households/Show/components/household/HouseholdHeader.tsx

import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
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
    Link as LinkIcon,
    Check,
    Printer,
    Edit,
    Trash2,
    Copy
} from 'lucide-react';
import { useState } from 'react';
import { Household } from '../types';
import { isNew } from '../utils/helpers';

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
                        <Badge variant={household.status === 'active' ? "default" : "secondary"} className="flex items-center gap-1 dark:bg-gray-700 dark:text-gray-300">
                            {household.status === 'active' ? (
                                <CheckCircle className="h-3 w-3" />
                            ) : (
                                <XCircle className="h-3 w-3" />
                            )}
                            {household.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                        {isNew(household.created_at) && (
                            <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white">
                                <Sparkles className="h-3 w-3" />
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
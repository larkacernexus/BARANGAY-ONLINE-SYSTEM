// resources/js/components/admin/blotters/show/components/blotter-header.tsx

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Copy,
    Check,
    Printer,
    Download,
    MoreVertical,
    Gavel,
    Calendar,
    MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { Blotter } from '../types';
import { getStatusColor, getStatusIcon, getPriorityColor, getPriorityIcon } from '@/components/admin/blotters/show/utils/helpers';

interface BlotterHeaderProps {
    blotter: Blotter;
    copied: boolean;
    numberCopied: boolean;
    onCopyLink: () => void;
    onCopyNumber: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onPrint: () => void;
    onExport: () => void;
}

export function BlotterHeader({
    blotter,
    copied,
    numberCopied,
    onCopyLink,
    onCopyNumber,
    onEdit,
    onDelete,
    onPrint,
    onExport
}: BlotterHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href="/admin/blotters">
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Blotters
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 flex items-center justify-center shadow-lg shadow-red-500/20">
                        <Gavel className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                Blotter #{blotter.blotter_number}
                            </h1>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={onCopyNumber}
                                    >
                                        {numberCopied ? (
                                            <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy blotter number</TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge className={`${getStatusColor(blotter.status)} flex items-center gap-1`}>
                                {getStatusIcon(blotter.status)}
                                {blotter.status.charAt(0).toUpperCase() + blotter.status.slice(1)}
                            </Badge>
                            <Badge className={`${getPriorityColor(blotter.priority)} flex items-center gap-1`}>
                                {getPriorityIcon(blotter.priority)}
                                {blotter.priority.charAt(0).toUpperCase() + blotter.priority.slice(1)} Priority
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(blotter.incident_datetime), 'MMM dd, yyyy')}
                            </Badge>
                            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                <MapPin className="h-3 w-3 mr-1" />
                                {blotter.barangay}
                            </Badge>
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
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                            ) : (
                                <Copy className="h-4 w-4 mr-2" />
                            )}
                            {copied ? 'Copied!' : 'Copy Link'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy blotter link to clipboard</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={onPrint} className="dark:border-gray-600 dark:text-gray-300">
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Print blotter details</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={onExport} className="dark:border-gray-600 dark:text-gray-300">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export blotter data</TooltipContent>
                </Tooltip>

                <Button size="sm" onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onCopyNumber}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Number
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onPrint}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={onDelete}
                            className="text-red-600 dark:text-red-400"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
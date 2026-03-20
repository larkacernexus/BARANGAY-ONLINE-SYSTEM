// resources/js/Pages/Admin/Puroks/components/purok-header.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    Edit,
    Copy,
    Check,
    Printer,
    Download,
    MoreVertical,
    Trash2,
    Award,
    Hash,
    MapPin,
    Users,
    Home,
    CheckCircle,
    XCircle,
    Clock,
    Sparkles
} from 'lucide-react';
import { Purok } from '../types';

interface Props {
    purok: Purok;
    isNew: boolean;
    onCopyLink: () => void;
    onPrint: () => void;
    onExport: () => void;
    onDelete: () => void;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
}

const getStatusGradient = (status: string): string => {
    switch (status) {
        case 'active':
            return 'from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700';
        case 'inactive':
            return 'from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700';
        case 'pending':
            return 'from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700';
        default:
            return 'from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700';
    }
};

const getStatusBadgeColor = (status: string): string => {
    const colors: Record<string, string> = {
        'active': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        'inactive': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700',
        'pending': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
};

export const PurokHeader = ({
    purok,
    isNew,
    onCopyLink,
    onPrint,
    onExport,
    onDelete,
    getStatusColor,
    getStatusIcon
}: Props) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        onCopyLink();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Use the provided getStatusIcon or fallback to default
    const renderStatusIcon = (status: string) => {
        if (getStatusIcon) return getStatusIcon(status);
        
        switch (status) {
            case 'active':
                return <CheckCircle className="h-3 w-3" />;
            case 'inactive':
                return <XCircle className="h-3 w-3" />;
            case 'pending':
                return <Clock className="h-3 w-3" />;
            default:
                return <MapPin className="h-3 w-3" />;
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href="/admin/puroks">
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Puroks
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getStatusGradient(purok.status)}`}>
                        <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                            {purok.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {/* Status Badge */}
                            <Badge variant="outline" className={getStatusBadgeColor(purok.status)}>
                                {renderStatusIcon(purok.status)}
                                <span className="ml-1">
                                    {purok.status.charAt(0).toUpperCase() + purok.status.slice(1)}
                                </span>
                            </Badge>

                            {/* New Badge */}
                            {isNew && (
                                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    New
                                </Badge>
                            )}

                            {/* Slug Badge with Copy */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                            onClick={handleCopyLink}
                                        >
                                            <Hash className="h-3 w-3" />
                                            <span className="text-sm font-mono">
                                                {purok.slug}
                                            </span>
                                            {copied ? (
                                                <Check className="h-3 w-3 ml-1" />
                                            ) : (
                                                <Copy className="h-3 w-3 ml-1" />
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Click to copy purok slug</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Stats Badges - Replace with actual data */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-full cursor-default">
                                            <Home className="h-3 w-3" />
                                            <span className="text-sm font-medium">0</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Households</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded-full cursor-default">
                                            <Users className="h-3 w-3" />
                                            <span className="text-sm font-medium">0</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Residents</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Edit Button - Primary Action */}
                <Link href={`/admin/puroks/${purok.id}/edit`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </Link>

                {/* 3-Dots Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 dark:bg-gray-900 dark:border-gray-700">
                        <DropdownMenuLabel className="dark:text-gray-100">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="dark:bg-gray-700" />
                        
                        <DropdownMenuItem 
                            onClick={handleCopyLink}
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={onPrint}
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={onExport}
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="dark:bg-gray-700" />
                        
                        <DropdownMenuItem 
                            onClick={onDelete} 
                            className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
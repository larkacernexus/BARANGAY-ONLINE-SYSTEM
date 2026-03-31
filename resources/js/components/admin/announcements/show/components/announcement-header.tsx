// resources/js/Pages/Admin/Announcements/components/announcement-header.tsx

import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
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
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
    ArrowLeft, 
    Edit, 
    Copy, 
    Eye, 
    XCircle, 
    CheckCircle,
    Trash2,
    Paperclip,
    AlertCircle,
    CalendarDays,
    Wrench,
    Tag,
    Megaphone,
    Bell,
    Clock,
    Archive,
    MoreVertical,
    Link as LinkIcon,
    FileText,
    Check
} from 'lucide-react';
import { route } from 'ziggy-js';

// Import types from admin types
import type { 
    Announcement, 
    AnnouncementType,
    PriorityLevel,
    AnnouncementStatus
} from '@/types/admin/announcements/announcement.types';

// Props interface using the Announcement type
interface Props {
    announcement: Announcement;
    copied?: boolean; // Optional since we manage internal state
    onCopyLink: () => void;
    onPreview: (e: React.MouseEvent) => void;
    onToggleStatus: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}

// Helper functions with proper typing
const getTypeIcon = (type: AnnouncementType | string) => {
    switch (type) {
        case 'important': return <AlertCircle className="h-3 w-3" />;
        case 'event': return <CalendarDays className="h-3 w-3" />;
        case 'maintenance': return <Wrench className="h-3 w-3" />;
        case 'other': return <Tag className="h-3 w-3" />;
        default: return <Megaphone className="h-3 w-3" />;
    }
};

const getTypeColor = (type: AnnouncementType | string): string => {
    switch (type) {
        case 'important': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'event': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        case 'maintenance': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        case 'other': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
        default: return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    }
};

const getPriorityIcon = (priority: PriorityLevel | number) => {
    const priorityNum = typeof priority === 'number' ? priority : parseInt(priority);
    switch (priorityNum) {
        case 4: return <AlertCircle className="h-3 w-3" />;
        case 3: return <Bell className="h-3 w-3" />;
        case 2: return <Bell className="h-3 w-3" />;
        case 1: return <Bell className="h-3 w-3" />;
        default: return <Bell className="h-3 w-3" />;
    }
};

const getPriorityColor = (priority: PriorityLevel | number): string => {
    const priorityNum = typeof priority === 'number' ? priority : parseInt(priority);
    switch (priorityNum) {
        case 4: return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 3: return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
        case 2: return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 1: return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
    }
};

const getStatusColor = (status: AnnouncementStatus | string, isActive: boolean): string => {
    if (!isActive) return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
    
    switch (status) {
        case 'active':
        case 'published':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'draft':
        case 'pending':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        case 'archived':
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700';
    }
};

const getStatusIcon = (status: AnnouncementStatus | string, isActive: boolean) => {
    if (!isActive) return <XCircle className="h-3 w-3" />;
    switch (status) {
        case 'active':
        case 'published':
            return <CheckCircle className="h-3 w-3" />;
        case 'draft':
        case 'pending':
            return <Clock className="h-3 w-3" />;
        case 'archived':
            return <Archive className="h-3 w-3" />;
        default:
            return <Bell className="h-3 w-3" />;
    }
};

export const AnnouncementHeader = ({
    announcement,
    copied: externalCopied,
    onCopyLink,
    onPreview,
    onToggleStatus,
    onDuplicate,
    onDelete
}: Props) => {
    const [internalCopied, setInternalCopied] = useState(false);
    
    // Use external copied state if provided, otherwise use internal
    const copied = externalCopied !== undefined ? externalCopied : internalCopied;

    const handleCopyLink = () => {
        onCopyLink();
        if (externalCopied === undefined) {
            setInternalCopied(true);
            setTimeout(() => setInternalCopied(false), 2000);
        }
    };

    const getGradientByType = (type: AnnouncementType | string): string => {
        switch (type) {
            case 'important': return 'from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700';
            case 'event': return 'from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700';
            case 'maintenance': return 'from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700';
            case 'other': return 'from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700';
            default: return 'from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700';
        }
    };

    // Determine if announcement is active (using is_active flag)
    const isActive = announcement.is_active === true;
    
    // Determine if announcement is currently displayed
    const isCurrentlyDisplayed = announcement.is_currently_active === true;

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href={route('admin.announcements.index')}>
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Announcements
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getGradientByType(announcement.type)}`}>
                        <Megaphone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                            {announcement.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {/* Status Badge */}
                            <Badge variant="outline" className={getStatusColor(announcement.status, isActive)}>
                                {getStatusIcon(announcement.status, isActive)}
                                <span className="ml-1">
                                    {isActive ? 'Active' : 'Inactive'}
                                </span>
                            </Badge>

                            {/* Currently Displayed Badge */}
                            {isCurrentlyDisplayed && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Currently Displayed
                                </Badge>
                            )}

                            {/* Type Badge */}
                            <Badge variant="outline" className={`flex items-center gap-1 ${getTypeColor(announcement.type)}`}>
                                {getTypeIcon(announcement.type)}
                                <span className="ml-1">{announcement.type_label}</span>
                            </Badge>

                            {/* Priority Badge */}
                            <Badge variant="outline" className={`flex items-center gap-1 ${getPriorityColor(announcement.priority)}`}>
                                {getPriorityIcon(announcement.priority)}
                                <span className="ml-1">{announcement.priority_label}</span>
                            </Badge>

                            {/* Attachments Badge */}
                            {announcement.has_attachments && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-full cursor-default">
                                                <Paperclip className="h-3 w-3" />
                                                <span className="text-sm font-medium">
                                                    {announcement.attachments_count || 0}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Attachments</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Copy Link Button */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyLink}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy announcement link to clipboard</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Preview Button */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onPreview}
                                className="dark:border-gray-600 dark:text-gray-300"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Preview announcement</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Edit Button - Primary Action */}
                <Link href={route('admin.announcements.edit', announcement.id)}>
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
                            onClick={onToggleStatus} 
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {isActive ? (
                                <XCircle className="h-4 w-4 mr-2" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={onDuplicate} 
                            className="dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
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
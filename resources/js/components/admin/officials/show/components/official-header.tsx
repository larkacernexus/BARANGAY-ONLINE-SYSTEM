// resources/js/Pages/Admin/Officials/components/official-header.tsx

import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
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
    Copy,
    Check,
    Printer,
    Download,
    Edit,
    MoreVertical,
    Trash2,
    User as UserIcon,
    CalendarDays,
    Clock,
    Shield,
    Award,
    Mail,
    Phone,
    MapPin,
    Hash,
    BadgeCheck,
    AlertCircle,
    Sparkles
} from 'lucide-react';

// Import types from shared officials types
import { Official } from '@/types/admin/officials/officials';

// Import utilities from officialsUtils
import { formatDate, getStatusBadgeVariant, getPositionBadgeVariant } from '@/admin-utils/officialsUtils';

interface Props {
    official: Official;
    onCopyLink: () => void;
    onPrint: () => void;
    onExport: () => void;
    onDelete: () => void;
}

// Helper function to safely construct full name
const getFullName = (official: Official): string => {
    if (!official) return 'Official';
    
    const resident = official.resident;
    if (resident?.full_name) return resident.full_name;
    
    const parts = [];
    if (resident?.first_name) parts.push(resident.first_name);
    if (resident?.middle_name) parts.push(resident.middle_name);
    if (resident?.last_name) parts.push(resident.last_name);
    
    let fullName = parts.join(' ');
    if (resident?.suffix && fullName) {
        fullName += `, ${resident.suffix}`;
    }
    
    return fullName || official.full_name || 'Official';
};

const getOfficialGradient = (): string => {
    return 'from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700';
};

// Helper function to safely get status icon
const getStatusIcon = (status: string = 'active') => {
    switch (status?.toLowerCase()) {
        case 'active':
        case 'serving':
            return <BadgeCheck className="h-3 w-3" />;
        case 'inactive':
        case 'ended':
        case 'resigned':
            return <AlertCircle className="h-3 w-3" />;
        case 'pending':
            return <Clock className="h-3 w-3" />;
        default:
            return <Shield className="h-3 w-3" />;
    }
};

// Helper function to safely get position icon
const getPositionIcon = (position?: string) => {
    switch (position?.toLowerCase()) {
        case 'captain':
        case 'barangay captain':
            return <Award className="h-3 w-3 mr-1" />;
        case 'secretary':
            return <Mail className="h-3 w-3 mr-1" />;
        case 'treasurer':
            return <Shield className="h-3 w-3 mr-1" />;
        default:
            return <Award className="h-3 w-3 mr-1" />;
    }
};

export const OfficialHeader = ({
    official,
    onCopyLink,
    onPrint,
    onExport,
    onDelete
}: Props) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        onCopyLink();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    // Safely get values with defaults
    const officialId = official?.id;
    const fullName = getFullName(official);
    const position = official?.positionData?.name || official?.position || 'No Position';
    const status = official?.status || 'active';
    const isCurrent = official?.is_current || false;
    const email = official?.email || official?.resident?.email;
    const phone = official?.contact_number || official?.resident?.contact_number;
    const purok = official?.resident?.purok?.name;
    const termStart = official?.term_start;
    const termEnd = official?.term_end;

    // Get badge styles from shared utilities
    const statusBadge = getStatusBadgeVariant(status, isCurrent);
    const positionBadge = getPositionBadgeVariant(position.toLowerCase());

    return (
        <TooltipProvider>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/officials">
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Officials
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getOfficialGradient()}`}>
                            <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100">
                                {fullName}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {/* Status Badge */}
                                <Badge variant="outline" className={statusBadge.className}>
                                    {getStatusIcon(status)}
                                    <span className="ml-1 capitalize">{statusBadge.text}</span>
                                </Badge>

                                {/* Position Badge */}
                                <Badge variant="outline" className={positionBadge.className}>
                                    {getPositionIcon(position)}
                                    <span className="capitalize">{positionBadge.text}</span>
                                </Badge>

                                {/* Official ID with Copy */}
                                {officialId && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div 
                                                className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                                onClick={handleCopyLink}
                                            >
                                                <Hash className="h-3 w-3" />
                                                <span className="text-sm font-mono">
                                                    ID: {officialId}
                                                </span>
                                                {copied ? (
                                                    <Check className="h-3 w-3 ml-1" />
                                                ) : (
                                                    <Copy className="h-3 w-3 ml-1" />
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Click to copy official ID</TooltipContent>
                                    </Tooltip>
                                )}

                                {/* Email Badge - if available */}
                                {email && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-full cursor-default">
                                                <Mail className="h-3 w-3" />
                                                <span className="text-sm max-w-[200px] truncate">{email}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Email</TooltipContent>
                                    </Tooltip>
                                )}

                                {/* Phone Badge - if available */}
                                {phone && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded-full cursor-default">
                                                <Phone className="h-3 w-3" />
                                                <span className="text-sm">{phone}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Phone</TooltipContent>
                                    </Tooltip>
                                )}

                                {/* Purok Badge - if available */}
                                {purok && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 rounded-full cursor-default">
                                                <MapPin className="h-3 w-3" />
                                                <span className="text-sm">{purok}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Purok</TooltipContent>
                                    </Tooltip>
                                )}

                                {/* Term Start Badge */}
                                {termStart && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 rounded-full cursor-default">
                                                <CalendarDays className="h-3 w-3" />
                                                <span className="text-sm">From: {formatDate(termStart)}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Term started</TooltipContent>
                                    </Tooltip>
                                )}

                                {/* Term End Badge */}
                                {termEnd && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 rounded-full cursor-default">
                                                <CalendarDays className="h-3 w-3" />
                                                <span className="text-sm">To: {formatDate(termEnd)}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>Term ends</TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Edit Button - Primary Action */}
                    {officialId && (
                        <Link href={`/admin/officials/${officialId}/edit`}>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                    )}

                    {/* 3-Dots Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 dark:bg-gray-900 dark:border-gray-700">
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
                                onClick={handlePrint}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print Profile
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={onExport}
                                className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export Data
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="dark:bg-gray-700" />
                            
                            <DropdownMenuItem 
                                onClick={onDelete}
                                className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Official
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </TooltipProvider>
    );
};
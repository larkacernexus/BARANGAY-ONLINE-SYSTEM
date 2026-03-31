// resources/js/Pages/Admin/Officials/components/profile-header.tsx

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreVertical,
    Mail,
    Shield,
    Award,
    Users,
    User,
    Calendar,
    Phone,
    MapPin,
    Crown,
    Hash,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    BookOpen,
    Target,
    Star,
} from 'lucide-react';

// Import types from shared officials types
import { Official } from '@/types/admin/officials/officials';

// Import utilities from officialsUtils
import { formatDate, getStatusBadgeVariant, getPositionBadgeVariant } from '@/admin-utils/officialsUtils';

interface Props {
    official: Official;
    getPositionColor: (position: string) => string;
    getPositionIcon: (position: string) => React.ReactNode;
    getStatusColor: (status: string, isCurrent: boolean) => string;
    getStatusIcon: (status: string, isCurrent: boolean) => React.ReactNode;
}

// Helper function for initials
const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export const ProfileHeader = ({ 
    official, 
    getPositionColor, 
    getPositionIcon, 
    getStatusColor, 
    getStatusIcon 
}: Props) => {
    const resident = official.resident;
    const fullName = resident?.full_name || official.full_name || 'Unknown Official';
    const position = official.positionData?.name || official.full_position || official.position || 'No Position';
    const status = official.status || 'inactive';
    const isCurrent = official.is_current || false;

    // Calculate days remaining in term
    const getDaysRemaining = () => {
        if (!official.term_end || !isCurrent) return null;
        const today = new Date();
        const endDate = new Date(official.term_end);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = getDaysRemaining();
    const statusBadge = getStatusBadgeVariant(status, isCurrent);
    const positionBadge = getPositionBadgeVariant(position.toLowerCase());

    return (
        <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
            {/* Large Avatar */}
            <div className="relative flex-shrink-0">
                <Avatar className="h-20 w-20 border-2 border-gray-100 dark:border-gray-800">
                    <AvatarImage src={official.photo_url} alt={fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-xl font-semibold">
                        {resident ? getInitials(fullName) : <User className="h-8 w-8" />}
                    </AvatarFallback>
                </Avatar>
                {isCurrent && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm">
                        <Crown className="h-5 w-5 text-yellow-500" />
                    </div>
                )}
            </div>

            {/* User Info - Taking full remaining space */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Column 1: Basic Info */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-semibold truncate">{fullName}</h2>
                        <Badge className={`${statusBadge.className} px-2 py-0.5 text-xs h-5`}>
                            {getStatusIcon(status, isCurrent)}
                            <span className="ml-1">{statusBadge.text}</span>
                        </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            {getPositionIcon(position)}
                            <span className="font-medium text-foreground">{position}</span>
                            <Badge variant="outline" className={positionBadge.className + " text-xs ml-1"}>
                                {positionBadge.text}
                            </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span>Official ID: {official.id || 'N/A'}</span>
                        </div>

                        {official.order && (
                            <div className="flex items-center gap-2 text-xs">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span>Order: {official.order}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Contact & Demographics */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Contact & Demographics
                    </h3>
                    
                    <div className="space-y-1 text-xs">
                        {resident?.age && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span>{resident.age} years old • {resident.gender || 'Gender not specified'}</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{official.contact_number || resident?.contact_number || 'No contact'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 truncate">
                            <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{official.email || resident?.email || 'No email'}</span>
                        </div>
                        
                        {resident?.purok && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>Purok {resident.purok.name}</span>
                            </div>
                        )}
                        
                        {resident?.civil_status && (
                            <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span>{resident.civil_status}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: Term & Status */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Term Information
                    </h3>
                    
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>Started: {formatDate(official.term_start)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>Ends: {formatDate(official.term_end)}</span>
                        </div>
                        
                        {official.term_duration && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>Duration: {official.term_duration}</span>
                            </div>
                        )}
                        
                        {daysRemaining !== null && (
                            <div className="flex items-center gap-2">
                                {daysRemaining > 30 ? (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : daysRemaining > 7 ? (
                                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                                ) : (
                                    <XCircle className="h-3 w-3 text-red-500" />
                                )}
                                <span className={daysRemaining <= 7 ? 'text-red-500 font-medium' : ''}>
                                    {daysRemaining} days remaining
                                </span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-1">
                            {official.is_regular ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                    <Award className="h-3 w-3 mr-1" />
                                    Regular
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                                    <Users className="h-3 w-3 mr-1" />
                                    Ex-Officio
                                </Badge>
                            )}
                            
                            {official.committee && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    {official.committee}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem>Message</DropdownMenuItem>
                    <DropdownMenuItem>Notify</DropdownMenuItem>
                    <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
// components/document/mobile/mobile-details.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ModernCard } from '@/components/residentui/modern-card';
import { Info, ChevronUp, ChevronDown, Calendar, Clock, Copy, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/components/residentui/lib/resident-ui-utils';
import { getDocumentStatus } from '@/utils/portal/records/document.utils';
import type { AppDocument } from '@/types/portal/records/document.types';

// Define the Tag type
interface Tag {
    id?: number;
    name: string;
    slug?: string;
}

// Use intersection type instead of extending
type ExtendedDocument = AppDocument & {
    tags?: (string | Tag)[];
    uploaded_by_user?: {
        id: number;
        name: string;
        email?: string;
    };
}

interface MobileDetailsProps {
    document: ExtendedDocument;
}

export function MobileDetails({ document }: MobileDetailsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const status = getDocumentStatus(document);

    // Helper function to render tags properly
    const renderTags = () => {
        if (!document.tags || document.tags.length === 0) return null;
        
        return (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => {
                        // Handle both string tags and object tags with type guard
                        const tagName = typeof tag === 'string' ? tag : (tag as Tag).name;
                        if (!tagName) return null;
                        
                        return (
                            <Badge key={index} variant="secondary" className="gap-1">
                                <Tag className="h-3 w-3" />
                                {tagName}
                            </Badge>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Safely get resident name
    const getResidentName = () => {
        if (!document.resident) return 'Unknown Resident';
        const firstName = document.resident.first_name || '';
        const lastName = document.resident.last_name || '';
        return `${firstName} ${lastName}`.trim() || 'Unknown Resident';
    };

    // Safely get resident initials
    const getResidentInitials = () => {
        if (!document.resident) return '?';
        const firstInitial = document.resident.first_name?.[0] || '';
        const lastInitial = document.resident.last_name?.[0] || '';
        return (firstInitial + lastInitial).toUpperCase() || '?';
    };

    return (
        <div className="px-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <ModernCard className="overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-500" />
                                <span className="font-semibold text-gray-900 dark:text-white">Document Details</span>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full">
                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4 pt-0 space-y-4">
                            {/* Reference Number */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Reference Number</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 font-mono text-sm bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                        {document.reference_number || 'N/A'}
                                    </code>
                                    {document.reference_number && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => navigator.clipboard.writeText(document.reference_number!)} 
                                            className="rounded-full"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Owner */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Document Owner</p>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                            {getResidentInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {getResidentName()}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Resident</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                {document.issue_date && (
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Issue Date</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium text-sm">
                                                {formatDate(document.issue_date, 'MMMM D, YYYY')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {document.expiry_date && (
                                    <div className={cn(
                                        "rounded-xl p-4", 
                                        status === 'expired' ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-gray-50 dark:bg-gray-900'
                                    )}>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expiry Date</p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className={cn(
                                                "font-medium text-sm", 
                                                status === 'expired' && "text-rose-600 dark:text-rose-400"
                                            )}>
                                                {formatDate(document.expiry_date, 'MMMM D, YYYY')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upload Info */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Upload Information</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Uploaded:</span>
                                        <span className="font-medium">{formatDateTime(document.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Last Modified:</span>
                                        <span className="font-medium">{formatDateTime(document.updated_at)}</span>
                                    </div>
                                    {document.uploaded_by_user && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Uploaded By:</span>
                                            <span className="font-medium truncate max-w-[150px]">{document.uploaded_by_user.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            {renderTags()}
                        </div>
                    </CollapsibleContent>
                </ModernCard>
            </Collapsible>
        </div>
    );
}
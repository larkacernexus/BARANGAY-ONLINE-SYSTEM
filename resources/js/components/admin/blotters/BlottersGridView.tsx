// resources/js/components/admin/blotters/BlottersGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { Link } from '@inertiajs/react';
import {
    Scale,
    Eye,
    Edit,
    User,
    MapPin,
    Copy,
    Trash2,
    ExternalLink,
    Phone,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    Archive,
    FileText
} from 'lucide-react';
import { Blotter } from '@/components/admin/blotters/blotter';

interface BlottersGridViewProps {
    blotters: Blotter[];
    isBulkMode: boolean;
    selectedBlotters: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (blotter: Blotter) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    selectionStats: any;
    onCopyToClipboard?: (text: string, label: string) => void;
}

export default function BlottersGridView({
    blotters,
    isBulkMode,
    selectedBlotters,
    isMobile,
    onItemSelect,
    onDelete,
    hasActiveFilters,
    onClearFilters,
    selectionStats,
    onCopyToClipboard = () => {}
}: BlottersGridViewProps) {
    const truncateText = (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getStatusBadgeClass = (status: string): string => {
        const classes: Record<string, string> = {
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'investigating': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'archived': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        };
        return classes[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    };

    const getPriorityBadgeClass = (priority: string): string => {
        const classes: Record<string, string> = {
            'urgent': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
        return classes[priority.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    };

    const getPriorityIcon = (priority: string) => {
        switch(priority) {
            case 'urgent': return <AlertCircle className="h-3 w-3" />;
            case 'high': return <AlertCircle className="h-3 w-3" />;
            case 'medium': return <Clock className="h-3 w-3" />;
            case 'low': return <CheckCircle className="h-3 w-3" />;
            default: return null;
        }
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'pending': return <Clock className="h-3 w-3" />;
            case 'investigating': return <AlertCircle className="h-3 w-3" />;
            case 'resolved': return <CheckCircle className="h-3 w-3" />;
            case 'archived': return <Archive className="h-3 w-3" />;
            default: return null;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-PH', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const emptyState = (
        <EmptyState
            title="No blotters found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by filing a blotter record.'}
            icon={<Scale className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/blotters/create'}
            createLabel="File Blotter"
        />
    );

    return (
        <GridLayout
            isEmpty={blotters.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {blotters.map((blotter) => {
                const isSelected = selectedBlotters.includes(blotter.id);
                
                return (
                    <Card 
                        key={blotter.id}
                        className={`overflow-hidden transition-all hover:shadow-md bg-white dark:bg-gray-900 border ${
                            isSelected 
                                ? 'border-red-500 border-2 bg-red-50 dark:bg-red-900/20' 
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content')) {
                                onItemSelect(blotter.id);
                            }
                        }}
                    >
                        <CardContent className="p-4">
                            {/* Header with Checkbox and ActionDropdown */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                        <Scale className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {blotter.blotter_number}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Badge 
                                                className={`text-xs ${getStatusBadgeClass(blotter.status)}`}
                                            >
                                                <span className="flex items-center gap-1">
                                                    {getStatusIcon(blotter.status)}
                                                    {blotter.status}
                                                </span>
                                            </Badge>
                                            <Badge 
                                                className={`text-xs ${getPriorityBadgeClass(blotter.priority)}`}
                                            >
                                                <span className="flex items-center gap-1">
                                                    {getPriorityIcon(blotter.priority)}
                                                    {blotter.priority}
                                                </span>
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(blotter.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 border-gray-300 dark:border-gray-600"
                                        />
                                    )}
                                    <ActionDropdown>
                                        <ActionDropdownItem
                                            icon={<Eye className="h-4 w-4" />}
                                            href={`/admin/blotters/${blotter.id}`}
                                        >
                                            View Details
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Edit className="h-4 w-4" />}
                                            href={`/admin/blotters/${blotter.id}/edit`}
                                        >
                                            Edit Blotter
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => onCopyToClipboard(blotter.blotter_number, 'Blotter Number')}
                                        >
                                            Copy Blotter #
                                        </ActionDropdownItem>
                                        
                                        {blotter.reporter_name && (
                                            <ActionDropdownItem
                                                icon={<Copy className="h-4 w-4" />}
                                                onClick={() => onCopyToClipboard(blotter.reporter_name, 'Reporter Name')}
                                            >
                                                Copy Reporter
                                            </ActionDropdownItem>
                                        )}
                                        
                                        {blotter.respondent_name && (
                                            <ActionDropdownItem
                                                icon={<Copy className="h-4 w-4" />}
                                                onClick={() => onCopyToClipboard(blotter.respondent_name, 'Respondent Name')}
                                            >
                                                Copy Respondent
                                            </ActionDropdownItem>
                                        )}
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Trash2 className="h-4 w-4" />}
                                            onClick={() => onDelete(blotter)}
                                            dangerous
                                        >
                                            Delete Blotter
                                        </ActionDropdownItem>
                                    </ActionDropdown>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                {/* Incident Type */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Incident Type</div>
                                    <div className="text-gray-900 dark:text-gray-100 font-medium">
                                        {blotter.incident_type}
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Date & Time</div>
                                    <div className="flex items-center gap-1 text-gray-900 dark:text-gray-100">
                                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                        {formatDateTime(blotter.incident_datetime)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDate(blotter.incident_datetime)}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</div>
                                    <div className="flex items-start gap-1 text-gray-900 dark:text-gray-100">
                                        <MapPin className="h-3.5 w-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">
                                            {truncateText(blotter.location, 50)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {blotter.barangay}
                                    </div>
                                </div>

                                {/* Reporter & Respondent */}
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <User className="h-3.5 w-3.5" />
                                            <span className="font-medium">Reporter</span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {truncateText(blotter.reporter_name, 20)}
                                        </div>
                                        {blotter.reporter_contact && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Phone className="h-3 w-3" />
                                                {blotter.reporter_contact}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <User className="h-3.5 w-3.5" />
                                            <span className="font-medium">Respondent</span>
                                        </div>
                                        <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                            {blotter.respondent_name || 'Not specified'}
                                        </div>
                                    </div>
                                </div>

                                {/* Created Date & Quick Links */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-3 w-3" />
                                            Filed: {formatDate(blotter.created_at)}
                                        </div>
                                        {blotter.attachments && blotter.attachments.length > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-blue-600">
                                                <FileText className="h-3 w-3" />
                                                {blotter.attachments.length} file(s)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}
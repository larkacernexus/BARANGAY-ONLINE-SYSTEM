// resources/js/components/admin/blotters/BlottersGridView.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { router } from '@inertiajs/react';
import {
    Scale,
    Eye,
    Edit,
    Trash2,
    Copy,
    MoreVertical,
    MapPin,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    Archive,
    Phone,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    User,
    Hash,
    Tag,
    FileText,
    CheckSquare,
    Square,
} from 'lucide-react';
import { Blotter } from '@/types/admin/blotters/blotter';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';

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
    windowWidth?: number;
}

// Shared Blotter Card Component
const BlotterCard = memo(({ 
    blotter, 
    isBulkMode, 
    isSelected, 
    isExpanded,
    onItemSelect,
    onDelete,
    onCopyToClipboard,
    onToggleExpand,
    truncateLengths,
    isMobile = false
}: {
    blotter: Blotter;
    isBulkMode: boolean;
    isSelected: boolean;
    isExpanded: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (blotter: Blotter) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onToggleExpand: (id: number, e: React.MouseEvent) => void;
    truncateLengths: { incident: number; location: number; name: number };
    isMobile?: boolean;
}) => {
    const truncateText = (text: string | null | undefined, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getStatusColor = (status: string): string => {
        switch (status?.toLowerCase()) {
            case 'resolved': 
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'investigating': 
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'pending': 
                return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'archived': 
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
            default: 
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    const getPriorityColor = (priority: string): string => {
        switch (priority?.toLowerCase()) {
            case 'urgent': 
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 'high': 
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            case 'medium': 
                return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'low': 
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            default: 
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch(status?.toLowerCase()) {
            case 'pending': return <Clock className="h-3 w-3" />;
            case 'investigating': return <AlertCircle className="h-3 w-3" />;
            case 'resolved': return <CheckCircle className="h-3 w-3" />;
            case 'archived': return <Archive className="h-3 w-3" />;
            default: return null;
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch(priority?.toLowerCase()) {
            case 'urgent': return <AlertCircle className="h-3 w-3" />;
            case 'high': return <AlertCircle className="h-3 w-3" />;
            case 'medium': return <Clock className="h-3 w-3" />;
            case 'low': return <CheckCircle className="h-3 w-3" />;
            default: return null;
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateTimeString: string): string => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-PH', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateString);
    };

    const handleCardClick = useCallback((e: React.MouseEvent) => {
        if (isBulkMode) return;
        onToggleExpand(blotter.id, e);
    }, [isBulkMode, blotter.id, onToggleExpand]);

    const handleCopyBlotterNumber = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onCopyToClipboard(blotter.blotter_number, 'Blotter Number');
    }, [onCopyToClipboard, blotter.blotter_number]);

    const handleCopyCaseNumber = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (blotter.case_number) {
            onCopyToClipboard(blotter.case_number, 'Case Number');
        }
    }, [onCopyToClipboard, blotter.case_number]);

    const handleCopyReporterContact = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (blotter.reporter_contact) {
            onCopyToClipboard(blotter.reporter_contact, 'Reporter Contact');
        }
    }, [onCopyToClipboard, blotter.reporter_contact]);

    const handleCopyRespondentContact = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (blotter.respondent_contact) {
            onCopyToClipboard(blotter.respondent_contact, 'Respondent Contact');
        }
    }, [onCopyToClipboard, blotter.respondent_contact]);

    const handleViewDetails = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        router.get(`/admin/blotters/${blotter.id}`);
    }, [blotter.id]);

    const handleEdit = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        router.get(`/admin/blotters/${blotter.id}/edit`);
    }, [blotter.id]);

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(blotter);
    }, [onDelete, blotter]);

    // Safe accessors with fallbacks
    const reporterName = blotter.reporter_name || 'Unknown';
    const respondentName = blotter.respondent_name || null;
    const barangay = blotter.barangay || null;
    const incidentType = blotter.incident_type || 'Unspecified';
    const location = blotter.location || 'No location';
    const narrative = blotter.narrative || null;

    return (
        <Card 
            className={`overflow-hidden border relative transition-all duration-200 bg-white dark:bg-gray-900 ${
                isSelected 
                    ? 'ring-2 ring-red-500 border-red-500 shadow-lg shadow-red-500/20 dark:ring-red-400 dark:border-red-400' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg'
            } ${isExpanded ? 'shadow-lg' : ''} cursor-pointer group`}
            onClick={handleCardClick}
        >
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                            <Scale className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                {blotter.blotter_number}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {blotter.case_number ? `Case #${blotter.case_number}` : formatDate(blotter.created_at)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                        {isBulkMode && (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onItemSelect(blotter.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                            />
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={handleViewDetails}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={handleEdit}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Blotter
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={handleCopyBlotterNumber}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Blotter #
                                </DropdownMenuItem>
                                
                                {blotter.case_number && (
                                    <DropdownMenuItem onClick={handleCopyCaseNumber}>
                                        <Hash className="h-4 w-4 mr-2" />
                                        Copy Case #
                                    </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    onCopyToClipboard(reporterName, 'Reporter Name');
                                }}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Reporter
                                </DropdownMenuItem>
                                
                                {respondentName && (
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        onCopyToClipboard(respondentName, 'Respondent Name');
                                    }}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Respondent
                                    </DropdownMenuItem>
                                )}
                                
                                {blotter.reporter_contact && (
                                    <DropdownMenuItem onClick={handleCopyReporterContact}>
                                        <Phone className="h-4 w-4 mr-2" />
                                        Copy Contact
                                    </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                {isBulkMode && (
                                    <>
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            onItemSelect(blotter.id);
                                        }}>
                                            {isSelected ? (
                                                <>
                                                    <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                                                    <span className="text-green-600">Deselect</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Square className="h-4 w-4 mr-2" />
                                                    Select for Bulk
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                
                                <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Blotter
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-0.5 ${getStatusColor(blotter.status)}`}
                    >
                        {getStatusIcon(blotter.status)}
                        <span className="ml-1">{blotter.status}</span>
                    </Badge>
                    
                    <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-0.5 ${getPriorityColor(blotter.priority)}`}
                    >
                        {getPriorityIcon(blotter.priority)}
                        <span className="ml-1">{blotter.priority}</span>
                    </Badge>
                </div>

                {/* Incident Type */}
                <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <h3 
                        className="font-semibold text-sm text-gray-900 dark:text-white truncate"
                        title={incidentType}
                    >
                        {truncateText(incidentType, truncateLengths.incident)}
                    </h3>
                </div>

                {/* Always visible info */}
                <div className="space-y-2 mb-2">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span 
                            className="truncate"
                            title={location}
                        >
                            {truncateText(location, truncateLengths.location)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{formatDateTime(blotter.incident_datetime)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">
                            {truncateText(reporterName, truncateLengths.name)}
                        </span>
                    </div>

                    {respondentName && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <User className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                            <span className="truncate">
                                {truncateText(respondentName, truncateLengths.name)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Expand/Collapse indicator */}
                {!isBulkMode && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {isExpanded ? 'Hide details' : 'Click to view details'}
                        </div>
                        <button
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={(e) => onToggleExpand(blotter.id, e)}
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                        </button>
                    </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2 space-y-3 animate-in fade-in-50 duration-200">
                        {/* Barangay */}
                        {barangay && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{barangay}</span>
                            </div>
                        )}
                        
                        {/* Contact Info */}
                        <div className="space-y-1.5">
                            {blotter.reporter_contact && (
                                <div 
                                    className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-600"
                                    onClick={handleCopyReporterContact}
                                >
                                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span>Reporter: {blotter.reporter_contact}</span>
                                </div>
                            )}
                            
                            {blotter.respondent_contact && (
                                <div 
                                    className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-600"
                                    onClick={handleCopyRespondentContact}
                                >
                                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span>Respondent: {blotter.respondent_contact}</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Narrative snippet */}
                        {narrative && (
                            <div className="text-sm">
                                <p className="text-gray-500 dark:text-gray-400 mb-1">Narrative:</p>
                                <p className="text-gray-700 dark:text-gray-300 line-clamp-3 italic">
                                    "{truncateText(narrative, 120)}"
                                </p>
                            </div>
                        )}
                        
                        {/* Attachments count */}
                        {blotter.attachments && blotter.attachments.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <FileText className="h-4 w-4" />
                                <span>{blotter.attachments.length} attachment(s)</span>
                            </div>
                        )}
                        
                        {/* Witnesses count */}
                        {blotter.witnesses && blotter.witnesses.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <User className="h-4 w-4" />
                                <span>{blotter.witnesses.length} witness(es)</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1.5"
                                onClick={handleViewDetails}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View full details
                            </button>
                            <button
                                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={(e) => onToggleExpand(blotter.id, e)}
                            >
                                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

BlotterCard.displayName = 'BlotterCard';

// Empty State Component
const EmptyStateComponent = ({ hasActiveFilters, onClearFilters }: { hasActiveFilters: boolean; onClearFilters: () => void }) => (
    <EmptyState
        title="No blotters found"
        description={hasActiveFilters 
            ? 'Try changing your filters or search criteria.'
            : 'Get started by filing a blotter record.'}
        icon={<Scale className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
        hasFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        onCreateNew={() => router.get('/admin/blotters/create')}
        createLabel="File Blotter"
    />
);

// Main Grid View Component
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
    onCopyToClipboard = () => {},
    windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
}: BlottersGridViewProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [devicePixelRatio, setDevicePixelRatio] = useState(1);
    
    useEffect(() => {
        setDevicePixelRatio(window.devicePixelRatio || 1);
    }, []);
    
    // Determine grid columns based on actual available width and scaling
    const gridCols = useMemo(() => {
        if (windowWidth < 640) return 1;
        if (windowWidth < 900) return 2;
        if (windowWidth < 1280) return 3;
        if (windowWidth < 1600) return 3;
        return 4;
    }, [windowWidth, devicePixelRatio]);
    
    // Adjust text truncation based on grid columns
    const getTruncateLengths = useMemo(() => {
        if (gridCols >= 4) return { incident: 35, location: 25, name: 20 };
        if (gridCols === 3) return { incident: 30, location: 20, name: 18 };
        if (gridCols === 2) return { incident: 28, location: 18, name: 15 };
        return { incident: 25, location: 15, name: 12 };
    }, [gridCols]);

    const truncateLengths = getTruncateLengths;
    
    // Memoized handlers
    const handleToggleExpand = useCallback((id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    // Memoize selected set for quick lookup
    const selectedSet = useMemo(() => new Set(selectedBlotters), [selectedBlotters]);

    // Early return for empty state
    if (blotters.length === 0) {
        return <EmptyStateComponent hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />;
    }

    return (
        <GridLayout
            isEmpty={false}
            emptyState={null}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: gridCols as 1 | 2 | 3 | 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {blotters.map((blotter) => (
                <BlotterCard
                    key={blotter.id}
                    blotter={blotter}
                    isBulkMode={isBulkMode}
                    isSelected={selectedSet.has(blotter.id)}
                    isExpanded={expandedId === blotter.id}
                    onItemSelect={onItemSelect}
                    onDelete={onDelete}
                    onCopyToClipboard={onCopyToClipboard}
                    onToggleExpand={handleToggleExpand}
                    truncateLengths={truncateLengths}
                    isMobile={isMobile}
                />
            ))}
        </GridLayout>
    );
}
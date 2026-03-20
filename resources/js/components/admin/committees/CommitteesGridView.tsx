// components/admin/committees/CommitteesGridView.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { Link } from '@inertiajs/react';
import { Target, Users, Eye, Edit, Trash2, Copy, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Committee } from '@/types/committees';
import { truncateText } from '@/lib/committeeutils';
import { toast } from 'sonner';

interface CommitteesGridViewProps {
    committees: Committee[];
    selectedIds: number[];
    isBulkMode: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (committee: Committee) => void;
    onToggleStatus?: (committee: Committee) => void;
    isMobile: boolean;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onCopyToClipboard: (text: string, label: string) => void;
}

export function CommitteesGridView({
    committees,
    selectedIds,
    isBulkMode,
    onItemSelect,
    onDelete,
    onToggleStatus,
    isMobile,
    hasActiveFilters,
    onClearFilters,
    onCopyToClipboard
}: CommitteesGridViewProps) {

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const emptyState = (
        <EmptyState
            title="No committees found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a committee.'}
            icon={<Target className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/committees/create'}
            createLabel="Create Committee"
        />
    );

    return (
        <GridLayout
            isEmpty={committees.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {committees.map((committee) => {
                const isSelected = selectedIds.includes(committee.id);
                const hasPositions = (committee.positions_count || 0) > 0;
                
                return (
                    <Card 
                        key={committee.id}
                        className={`overflow-hidden transition-all hover:shadow-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 ${
                            isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content')) {
                                onItemSelect(committee.id);
                            }
                        }}
                    >
                        <CardContent className="p-4">
                            {/* Header with Checkbox and ActionDropdown */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`h-10 w-10 rounded-full ${hasPositions ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} flex items-center justify-center flex-shrink-0`}>
                                        <Target className={`h-5 w-5 ${hasPositions ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {committee.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            Code: {committee.code}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(committee.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                        />
                                    )}
                                    <ActionDropdown>
                                        <ActionDropdownItem
                                            icon={<Eye className="h-4 w-4" />}
                                            href={`/admin/committees/${committee.id}`}
                                        >
                                            View Details
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Edit className="h-4 w-4" />}
                                            href={`/admin/committees/${committee.id}/edit`}
                                        >
                                            Edit Committee
                                        </ActionDropdownItem>
                                        
                                        {onToggleStatus && (
                                            <ActionDropdownItem
                                                icon={committee.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                onClick={() => onToggleStatus(committee)}
                                                className={committee.is_active ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}
                                            >
                                                {committee.is_active ? 'Deactivate' : 'Activate'}
                                            </ActionDropdownItem>
                                        )}
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => onCopyToClipboard(committee.name, 'Committee Name')}
                                        >
                                            Copy Name
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => onCopyToClipboard(committee.code, 'Committee Code')}
                                        >
                                            Copy Code
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Trash2 className="h-4 w-4" />}
                                            onClick={() => onDelete(committee)}
                                            dangerous
                                        >
                                            Delete Committee
                                        </ActionDropdownItem>
                                    </ActionDropdown>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                {/* Description */}
                                {committee.description && (
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {committee.description}
                                        </div>
                                    </div>
                                )}

                                {/* Committee Info */}
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <Users className="h-3.5 w-3.5" />
                                            <span className="font-medium">Positions</span>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                                            {committee.positions_count || 0}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">Order</span>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                                            {committee.order}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <Badge 
                                        variant={committee.is_active ? "default" : "secondary"} 
                                        className={committee.is_active 
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                                        }
                                    >
                                        {committee.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {hasPositions && (
                                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                                            <Users className="h-3 w-3 mr-1" />
                                            Has Positions
                                        </Badge>
                                    )}
                                </div>

                                {/* Created Date */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-3 w-3" />
                                            Created {formatDate(committee.created_at)}
                                        </div>
                                        <Link href={`/admin/positions?committee_id=${committee.id}`}>
                                            <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                                                View Positions
                                            </span>
                                        </Link>
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
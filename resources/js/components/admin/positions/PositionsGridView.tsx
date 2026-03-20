import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { Link } from '@inertiajs/react';
import {
    Shield,
    Eye,
    Edit,
    Users,
    TargetIcon,
    Copy,
    Trash2,
    Key,
    Calendar,
    Crown
} from 'lucide-react';
import { Position } from '@/types/position';
import { positionUtils } from '@/admin-utils/position-utils';

interface PositionsGridViewProps {
    positions: Position[];
    isBulkMode: boolean;
    selectedPositions: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (position: Position) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    selectionStats: any;
    onCopyToClipboard: (text: string, label: string) => void;
}

export default function PositionsGridView({
    positions,
    isBulkMode,
    selectedPositions,
    isMobile,
    onItemSelect,
    onDelete,
    hasActiveFilters,
    onClearFilters,
    selectionStats,
    onCopyToClipboard
}: PositionsGridViewProps) {
    const truncateText = positionUtils.truncateText;
    const formatDate = positionUtils.formatDate;

    const getStatusBadgeVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
        return isActive ? 'default' : 'secondary';
    };

    const getStatusBadgeClass = (isActive: boolean): string => {
        return isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    };

    const isKagawad = (name: string, code: string) => {
        return name.toLowerCase().includes('kagawad') || code.toLowerCase().includes('kagawad');
    };

    const emptyState = (
        <EmptyState
            title="No positions found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a position.'}
            icon={<Shield className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/positions/create'}
            createLabel="Create Position"
        />
    );

    return (
        <GridLayout
            isEmpty={positions.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {positions.map((position) => {
                const isSelected = selectedPositions.includes(position.id);
                const isKagawadPos = isKagawad(position.name, position.code);
                
                return (
                    <Card 
                        key={position.id}
                        className={`overflow-hidden transition-all hover:shadow-md bg-white dark:bg-gray-900 border ${
                            isSelected 
                                ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('.dropdown-menu-content')) {
                                onItemSelect(position.id);
                            }
                        }}
                    >
                        <CardContent className="p-4">
                            {/* Header with Checkbox and ActionDropdown */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`h-10 w-10 rounded-full ${isKagawadPos ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} flex items-center justify-center flex-shrink-0`}>
                                        <Shield className={`h-5 w-5 ${isKagawadPos ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate flex items-center gap-1">
                                            {position.name}
                                            {isKagawadPos && (
                                                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                                    Kagawad
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            Code: {position.code}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(position.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                        />
                                    )}
                                    <ActionDropdown>
                                        <ActionDropdownItem
                                            icon={<Eye className="h-4 w-4" />}
                                            href={`/admin/positions/${position.id}`}
                                        >
                                            View Details
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Edit className="h-4 w-4" />}
                                            href={`/admin/positions/${position.id}/edit`}
                                        >
                                            Edit Position
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => onCopyToClipboard(position.name, 'Position Name')}
                                        >
                                            Copy Name
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => onCopyToClipboard(position.code, 'Position Code')}
                                        >
                                            Copy Code
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Trash2 className="h-4 w-4" />}
                                            onClick={() => onDelete(position)}
                                            dangerous
                                        >
                                            Delete Position
                                        </ActionDropdownItem>
                                    </ActionDropdown>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                {/* Description */}
                                {position.description && (
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {position.description}
                                        </div>
                                    </div>
                                )}

                                {/* Committee Info */}
                                {position.committee && (
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Committee</div>
                                        <div className="flex items-center gap-1 text-gray-900 dark:text-gray-100">
                                            <TargetIcon className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                            {position.committee.name}
                                        </div>
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <Users className="h-3.5 w-3.5" />
                                            <span className="font-medium">Officials</span>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                                            {position.officials_count || 0}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <Crown className="h-3.5 w-3.5" />
                                            <span className="font-medium">Order</span>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                                            {position.order}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <Badge 
                                        variant={getStatusBadgeVariant(position.is_active)} 
                                        className={`text-xs ${getStatusBadgeClass(position.is_active)}`}
                                    >
                                        {position.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Badge 
                                        variant={position.requires_account ? 'default' : 'outline'} 
                                        className={`text-xs flex items-center gap-1 ${
                                            position.requires_account 
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                                        }`}
                                    >
                                        {position.requires_account && <Key className="h-3 w-3" />}
                                        {position.requires_account ? 'Account Req' : 'No Account'}
                                    </Badge>
                                </div>

                                {/* Created Date & Officials Link */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(position.created_at)}
                                        </div>
                                        <Link href={`/officials?position_id=${position.id}`}>
                                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                View Officials
                                            </Button>
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
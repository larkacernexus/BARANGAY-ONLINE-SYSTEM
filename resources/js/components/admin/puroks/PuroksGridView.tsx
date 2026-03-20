import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionDropdown, ActionDropdownItem, ActionDropdownSeparator } from '@/components/adminui/action-dropdown';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { Link } from '@inertiajs/react';
import {
    MapPin,
    Eye,
    Edit,
    Users,
    Home,
    Copy,
    Trash2,
    ExternalLink,
    Phone,
    Calendar,
    Users as UsersIcon
} from 'lucide-react';
import { Purok } from '@/types';

interface PuroksGridViewProps {
    puroks: Purok[];
    isBulkMode: boolean;
    selectedPuroks: number[];
    isMobile: boolean;
    onItemSelect: (id: number) => void;
    onDelete: (purok: Purok) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    selectionStats: any;
    onCopyToClipboard: (text: string, label: string) => void;
}

export default function PuroksGridView({
    puroks,
    isBulkMode,
    selectedPuroks,
    isMobile,
    onItemSelect,
    onDelete,
    hasActiveFilters,
    onClearFilters,
    selectionStats,
    onCopyToClipboard
}: PuroksGridViewProps) {
    const truncateText = (text: string, maxLength: number = 30): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'active': 'default',
            'inactive': 'secondary',
            'pending': 'outline',
            'archived': 'outline'
        };
        return variants[status.toLowerCase()] || 'outline';
    };

    const getStatusBadgeClass = (status: string): string => {
        const classes: Record<string, string> = {
            'active': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'archived': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        };
        return classes[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    };

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
            title="No puroks found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a purok.'}
            icon={<MapPin className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/admin/puroks/create'}
            createLabel="Create Purok"
        />
    );

    return (
        <GridLayout
            isEmpty={puroks.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {puroks.map((purok) => {
                const isSelected = selectedPuroks.includes(purok.id);
                
                return (
                    <Card 
                        key={purok.id}
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
                                onItemSelect(purok.id);
                            }
                        }}
                    >
                        <CardContent className="p-4">
                            {/* Header with Checkbox and ActionDropdown */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {purok.name}
                                        </div>
                                        <Badge 
                                            variant={getStatusBadgeVariant(purok.status)} 
                                            className={`mt-1 text-xs ${getStatusBadgeClass(purok.status)}`}
                                        >
                                            {purok.status}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(purok.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                        />
                                    )}
                                    <ActionDropdown>
                                        <ActionDropdownItem
                                            icon={<Eye className="h-4 w-4" />}
                                            href={`/admin/puroks/${purok.id}`}
                                        >
                                            View Details
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownItem
                                            icon={<Edit className="h-4 w-4" />}
                                            href={`/admin/puroks/${purok.id}/edit`}
                                        >
                                            Edit Purok
                                        </ActionDropdownItem>
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Copy className="h-4 w-4" />}
                                            onClick={() => onCopyToClipboard(purok.name, 'Purok Name')}
                                        >
                                            Copy Name
                                        </ActionDropdownItem>
                                        
                                        {purok.google_maps_url && (
                                            <ActionDropdownItem
                                                icon={<ExternalLink className="h-4 w-4" />}
                                                onClick={() => window.open(purok.google_maps_url, '_blank')}
                                            >
                                                View on Map
                                            </ActionDropdownItem>
                                        )}
                                        
                                        <ActionDropdownSeparator />
                                        
                                        <ActionDropdownItem
                                            icon={<Trash2 className="h-4 w-4" />}
                                            onClick={() => onDelete(purok)}
                                            dangerous
                                        >
                                            Delete Purok
                                        </ActionDropdownItem>
                                    </ActionDropdown>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                {/* Description */}
                                {purok.description && (
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {purok.description}
                                        </div>
                                    </div>
                                )}

                                {/* Leader Info */}
                                {purok.leader_name && (
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Leader</div>
                                        <div className="text-gray-900 dark:text-gray-100 font-medium">
                                            {purok.leader_name}
                                        </div>
                                        {purok.leader_contact && (
                                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                <Phone className="h-3.5 w-3.5" />
                                                {purok.leader_contact}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <Home className="h-3.5 w-3.5" />
                                            <span className="font-medium">Households</span>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                                            {purok.total_households?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <UsersIcon className="h-3.5 w-3.5" />
                                            <span className="font-medium">Residents</span>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                                            {purok.total_residents?.toLocaleString() || 0}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Links & Created Date */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(purok.created_at)}
                                        </div>
                                        <div className="flex gap-1">
                                            <Link href={`/residents?purok_id=${purok.id}`}>
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                    Residents
                                                </Button>
                                            </Link>
                                            <Link href={`/households?purok_id=${purok.id}`}>
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                    Households
                                                </Button>
                                            </Link>
                                        </div>
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
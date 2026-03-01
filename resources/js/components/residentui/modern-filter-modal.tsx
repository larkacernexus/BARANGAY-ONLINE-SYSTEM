import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Search, X, Check, Receipt, User, Calendar } from 'lucide-react';
import { ModernSelect } from './modern-select';
import { cn } from '@/lib/utils';

interface ModernFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    search?: string;
    onSearchChange?: (value: string) => void;
    onSearchSubmit?: (e: React.FormEvent) => void;
    onSearchClear?: () => void;
    loading?: boolean;
    hasActiveFilters?: boolean;
    onClearFilters?: () => void;
    children?: React.ReactNode;
}

export const ModernFilterModal = ({
    isOpen,
    onClose,
    title = "Filter Items",
    description,
    search,
    onSearchChange,
    onSearchSubmit,
    onSearchClear,
    loading,
    hasActiveFilters,
    onClearFilters,
    children,
}: ModernFilterModalProps) => {
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <SlidersHorizontal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span>{title}</span>
                    </DialogTitle>
                    <DialogDescription>
                        {description || (hasActiveFilters ? 'Filters are currently active' : 'No filters applied')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Search */}
                    {search !== undefined && onSearchChange && onSearchSubmit && onSearchClear && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Search
                            </label>
                            <form onSubmit={onSearchSubmit} className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-10 pr-10 rounded-xl border-gray-200 dark:border-gray-700 focus:ring-blue-500/20"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={onSearchClear}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Custom filter fields */}
                    {children}

                    {/* Active Filters Indicator */}
                    {hasActiveFilters && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg animate-pulse">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                                <span className="text-sm text-blue-700 dark:text-blue-300">
                                    Filters are active
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {hasActiveFilters && onClearFilters && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                onClearFilters();
                                onClose();
                            }}
                            className="w-full sm:w-auto"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                    )}
                    <Button onClick={onClose} className="w-full sm:w-auto">
                        <Check className="h-4 w-4 mr-2" />
                        Apply Filters
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
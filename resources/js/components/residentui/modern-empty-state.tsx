import { Button } from '@/components/ui/button';
import { X, Clock, FileText, AlertCircle, CheckCircle2, XCircle, Receipt } from 'lucide-react';

interface ModernEmptyStateProps {
    status?: string;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    title?: string;
    message?: string;
    icon?: React.ElementType;
    actionLabel?: string;
    onAction?: () => void;
}

export const ModernEmptyState = ({ 
    status = 'default',
    hasFilters = false,
    onClearFilters,
    title,
    message,
    icon: CustomIcon,
    actionLabel,
    onAction,
}: ModernEmptyStateProps) => {
    const getIcon = () => {
        if (CustomIcon) return CustomIcon;
        
        switch(status) {
            case 'pending': return Clock;
            case 'issued': return FileText;
            case 'overdue': return AlertCircle;
            case 'paid': return CheckCircle2;
            case 'cancelled': return XCircle;
            default: return Receipt;
        }
    };

    const getMessage = () => {
        if (title) return title;
        if (hasFilters) {
            return 'No items match your current filters';
        }
        switch(status) {
            case 'pending': return 'No pending items found';
            case 'issued': return 'No issued items found';
            case 'overdue': return 'No overdue items found';
            case 'paid': return 'No paid items found';
            case 'cancelled': return 'No cancelled items found';
            default: return 'No items found';
        }
    };

    const getDescription = () => {
        if (message) return message;
        return hasFilters 
            ? 'Try adjusting your filters or clear them to see all items'
            : 'New items will appear here when they are added';
    };

    const Icon = getIcon();

    return (
        <div className="text-center py-12 animate-fade-in">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mb-4">
                <Icon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {getMessage()}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {getDescription()}
            </p>
            {(hasFilters && onClearFilters) && (
                <Button onClick={onClearFilters} variant="outline" className="gap-2">
                    <X className="h-4 w-4" />
                    Clear Filters
                </Button>
            )}
            {actionLabel && onAction && (
                <Button onClick={onAction} variant="outline" className="gap-2">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
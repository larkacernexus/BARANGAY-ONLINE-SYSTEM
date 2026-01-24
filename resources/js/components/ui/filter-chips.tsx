// components/ui/filter-chips.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FilterChip {
    key: string;
    label: string;
    value: string;
}

interface FilterChipsProps {
    filters: FilterChip[];
    onRemove: (key: string) => void;
    onClearAll: () => void;
    className?: string;
}

export function FilterChips({
    filters,
    onRemove,
    onClearAll,
    className = ''
}: FilterChipsProps) {
    if (filters.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-2 items-center ${className}`}>
            <span className="text-sm text-muted-foreground">Filters:</span>
            {filters.map((filter) => (
                <Badge
                    key={filter.key}
                    variant="secondary"
                    className="gap-1 pl-3 pr-2 py-1"
                >
                    {filter.label}: {filter.value}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => onRemove(filter.key)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            ))}
            <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-7 px-2 text-xs"
            >
                Clear all
            </Button>
        </div>
    );
}
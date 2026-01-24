import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
    defaultValue?: string;
    placeholder?: string;
}

interface FilterBarProps {
    filters: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
    filterConfigs: FilterConfig[];
    isLoading?: boolean;
    className?: string;
}

export function FilterBar({
    filters,
    onFilterChange,
    onClearFilters,
    filterConfigs,
    isLoading = false,
    className = ''
}: FilterBarProps) {
    const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
        value && value !== '' && value !== 'all'
    );

    return (
        <Card className={`border-border ${className}`}>
            <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {filterConfigs.map((config) => (
                        <div key={config.key}>
                            <label className="block text-xs text-muted-foreground mb-1">
                                {config.label}
                            </label>
                            <Select 
                                value={filters[config.key] || 'all'} 
                                onValueChange={(value) => onFilterChange(config.key, value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-full text-sm">
                                    <SelectValue placeholder={config.placeholder || `All ${config.label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All {config.label}</SelectItem>
                                    {config.options.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>
                
                {hasActiveFilters && (
                    <div className="flex justify-center mt-4">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onClearFilters} 
                            disabled={isLoading}
                            className="text-xs"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear Filters
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
// components/data/data-table-container.tsx
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface DataTableContainerProps {
    title: string;
    description?: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSearchClear: () => void;
    filters?: ReactNode;
    showFilters?: boolean;
    onToggleFilters?: () => void;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function DataTableContainer({
    title,
    description,
    searchValue,
    onSearchChange,
    onSearchClear,
    filters,
    showFilters = false,
    onToggleFilters,
    actions,
    children,
    className = ''
}: DataTableContainerProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        {description && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                </div>
                
                <div className="mt-4 space-y-4">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {searchValue && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onSearchClear}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {filters && onToggleFilters && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onToggleFilters}
                            >
                                <Filter className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    
                    {filters && showFilters && (
                        <div className="pt-4 border-t">
                            {filters}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}
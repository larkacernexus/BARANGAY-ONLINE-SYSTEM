import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernPaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    loading?: boolean;
    showPageInfo?: boolean;
}

export const ModernPagination = ({ 
    currentPage, 
    lastPage, 
    onPageChange, 
    loading,
    showPageInfo = true 
}: ModernPaginationProps) => {
    const pages = useMemo(() => {
        const delta = 2;
        const range = [];
        const rangeWithDots: any[] = [];
        let l: number;

        for (let i = 1; i <= lastPage; i++) {
            if (i === 1 || i === lastPage || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    }, [currentPage, lastPage]);

    return (
        <div className="flex items-center justify-between">
            {showPageInfo && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Page {currentPage} of {lastPage}
                </p>
            )}
            <div className="flex gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                    className="h-8 w-8 p-0 rounded-lg"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {pages.map((page, index) => (
                    page === '...' ? (
                        <span key={`dots-${index}`} className="px-2 py-1 text-sm text-gray-500">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onPageChange(page as number)}
                            disabled={loading}
                            className={cn(
                                "h-8 w-8 p-0 rounded-lg",
                                currentPage === page && "bg-gradient-to-r from-blue-500 to-blue-600"
                            )}
                        >
                            {page}
                        </Button>
                    )
                ))}
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= lastPage || loading}
                    className="h-8 w-8 p-0 rounded-lg"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
// forms-show/tabs/RelatedTab.tsx
import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/residentui/modern-card';
import { ModernEmptyState } from '@/components/residentui/modern-empty-state';
import { ChevronRight, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form } from '@/types/portal/forms/form.types';
import { getFileIcon, getCategoryColor, formatFileSize } from '@/utils/portal/forms/form-utils';

interface RelatedTabProps {
    relatedForms: Form[];
}

export function RelatedTab({ relatedForms }: RelatedTabProps) {
    return (
        <ModernCard
            title="Related Forms"
            description="Other forms you might be interested in"
        >
            {relatedForms.length > 0 ? (
                <div className="space-y-3">
                    {relatedForms.map((related) => {
                        const RelatedFileIcon = getFileIcon(related.file_type);
                        return (
                            <Link 
                                key={related.id} 
                                href={`/forms/${related.slug}`}
                                className="block"
                            >
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-750 dark:hover:to-gray-800 transition-all group">
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        `bg-gradient-to-br ${getCategoryColor(related.category)}`
                                    )}>
                                        <RelatedFileIcon className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{related.title}</p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                            <Badge variant="outline" className="text-[10px]">
                                                {related.category}
                                            </Badge>
                                            <span>{formatFileSize(related.file_size)}</span>
                                            <span>•</span>
                                            <span>{related.download_count} downloads</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <ModernEmptyState
                    status="empty"
                    title="No Related Forms"
                    message="No related forms found for this category."
                    icon={FolderOpen}
                />
            )}
        </ModernCard>
    );
}
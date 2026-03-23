// components/document/mobile/mobile-related.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ModernCard } from '@/components/residentui/modern-card';
import { Link2, ChevronUp, ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFileIcon, getFileColor } from '@/utils/portal/records/document.utils';
import {  RelatedDocument } from '@/types/portal/records/document.types';
import { useState } from 'react';

interface MobileRelatedProps {
    relatedDocuments: RelatedDocument[];
}

export function MobileRelated({ relatedDocuments }: MobileRelatedProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!relatedDocuments || relatedDocuments.length === 0) return null;

    return (
        <div className="px-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <ModernCard className="overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                            <div className="flex items-center gap-2">
                                <Link2 className="h-5 w-5 text-blue-500" />
                                <span className="font-semibold text-gray-900 dark:text-white">Related Documents</span>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full">
                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4 pt-0 space-y-2">
                            {relatedDocuments.map((doc) => {
                                const FileIcon = getFileIcon(doc.file_extension || '');
                                return (
                                    <Link key={doc.id} href={`/portal/my-records/${doc.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                                        <div className={cn("p-2 rounded-lg", getFileColor(doc.file_extension || ''))}>
                                            <FileIcon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{doc.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {doc.file_extension && <span>{doc.file_extension.toUpperCase()}</span>}
                                                {doc.file_size_human && <><span>•</span><span>{doc.file_size_human}</span></>}
                                                {doc.requires_password && <Lock className="h-3 w-3 text-amber-500" />}
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                    </Link>
                                );
                            })}
                        </div>
                    </CollapsibleContent>
                </ModernCard>
            </Collapsible>
        </div>
    );
}
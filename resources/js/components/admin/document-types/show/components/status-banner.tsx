// resources/js/Pages/Admin/DocumentTypes/components/status-banner.tsx

import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit } from 'lucide-react';
import { route } from 'ziggy-js';

// Import from the centralized types file
import type { DocumentType } from '@/types/admin/document-types/document-types';

interface Props {
    documentType: DocumentType;
}

export const StatusBanner = ({ documentType }: Props) => {
    // Check if document type has no category
    const hasNoCategory = !documentType.category && !documentType.category_name;
    
    if (!hasNoCategory) {
        return null;
    }
    
    return (
        <Card className="border-l-4 border-l-amber-500 dark:bg-gray-900">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        <div>
                            <p className="font-medium dark:text-gray-100">No Category Assigned</p>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                This document type does not have a category assigned.
                            </p>
                        </div>
                    </div>
                    <Link href={route('admin.document-types.edit', documentType.id)}>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <Edit className="h-4 w-4 mr-2" />
                            Assign Category
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};
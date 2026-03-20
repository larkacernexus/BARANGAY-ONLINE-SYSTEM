// resources/js/Pages/Admin/ClearanceTypes/components/requirements-tab.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    File,
    FileCheck,
    FileWarning,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { DocumentType } from '../types';

interface Props {
    documentTypes: DocumentType[];
    showAll: boolean;
    onToggle: () => void;
}

export const RequirementsTab = ({ documentTypes, showAll, onToggle }: Props) => {
    const displayedDocuments = showAll ? documentTypes : documentTypes.slice(0, 3);

    if (documentTypes.length === 0) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <File className="h-5 w-5" />
                        Required Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <File className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No documents configured</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <File className="h-5 w-5" />
                        Required Documents
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        {documentTypes.length} document{documentTypes.length !== 1 ? 's' : ''} required
                    </CardDescription>
                </div>
                {documentTypes.length > 3 && (
                    <Button variant="ghost" size="sm" onClick={onToggle}>
                        {showAll ? 'Show Less' : 'Show All'}
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {displayedDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                    doc.is_required 
                                        ? 'bg-amber-100 dark:bg-amber-900/30' 
                                        : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                    {doc.is_required ? (
                                        <FileWarning className={`h-4 w-4 text-amber-600 dark:text-amber-400`} />
                                    ) : (
                                        <FileCheck className={`h-4 w-4 text-gray-600 dark:text-gray-400`} />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium dark:text-gray-200">{doc.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                            {doc.category}
                                        </Badge>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{doc.code}</span>
                                    </div>
                                    {doc.description && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{doc.description}</p>
                                    )}
                                </div>
                            </div>
                            {doc.is_required && (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                    Required
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
// resources/js/Pages/Admin/Forms/components/related-forms-card.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FolderOpen,
    Eye,
    Download,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Form } from '../types';

interface Props {
    related_forms: Form[];
    getFileTypeIcon: (fileType?: string) => React.ReactNode;
    getCategoryColor: (category?: string) => string;
    formatFileSize: (bytes: number) => string;
}

export const RelatedFormsCard = ({
    related_forms,
    getFileTypeIcon,
    getCategoryColor,
    formatFileSize,
}: Props) => {
    if (!related_forms || related_forms.length === 0) {
        return (
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <FolderOpen className="h-5 w-5" />
                        Related Forms
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Other forms you might be interested in
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No related forms found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            There are no other forms related to this one.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <FolderOpen className="h-5 w-5" />
                    Related Forms
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                    Other forms you might be interested in
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {related_forms.map((relatedForm) => (
                        <div key={relatedForm.id} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <div className="flex items-center gap-3">
                                {getFileTypeIcon(relatedForm.file_type)}
                                <div>
                                    <Link
                                        href={route('admin.forms.show', relatedForm.id)}
                                        className="font-medium hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                                    >
                                        {relatedForm.title}
                                    </Link>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        <Badge variant="outline" className={getCategoryColor(relatedForm.category)}>
                                            {relatedForm.category}
                                        </Badge>
                                        <span>{formatFileSize(relatedForm.file_size)}</span>
                                        <span>•</span>
                                        <span>{relatedForm.file_type}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={route('admin.forms.show', relatedForm.id)}>
                                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                </Link>
                                <a href={route('admin.forms.download', relatedForm.id)} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                        <Download className="h-3 w-3" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
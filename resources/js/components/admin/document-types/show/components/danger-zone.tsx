// resources/js/Pages/Admin/DocumentTypes/components/danger-zone.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    Trash2,
} from 'lucide-react';

interface Props {
    documentType: any;
    requiredCount: number;
    onDelete: () => void;
}

export const DangerZone = ({ documentType, requiredCount, onDelete }: Props) => {
    return (
        <Card className="border-red-200 dark:border-red-900 dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400">
                    Irreversible actions for this document type
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-md">
                    <div className="flex-1">
                        <div className="font-medium text-red-800 dark:text-red-300">
                            Delete this document type
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                            Once deleted, this action cannot be undone. 
                            {requiredCount > 0 && (
                                <span className="font-bold block mt-1">
                                    Cannot delete because it is required by {requiredCount} clearance type(s).
                                </span>
                            )}
                        </div>
                    </div>
                    <Button 
                        variant="destructive"
                        onClick={onDelete}
                        disabled={requiredCount > 0}
                        className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Document Type
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
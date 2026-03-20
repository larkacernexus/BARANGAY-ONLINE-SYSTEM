// resources/js/Pages/Admin/ClearanceTypes/components/danger-zone-card.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    AlertTriangle,
    AlertCircle,
    Trash2,
} from 'lucide-react';

interface Props {
    clearanceType: any;
    onToggleStatus: () => void;
    onDelete: () => void;
}

export const DangerZoneCard = ({ clearanceType, onToggleStatus, onDelete }: Props) => {
    return (
        <Card className="border-red-200 dark:border-red-900 dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400">
                    Irreversible actions for this clearance type
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-md">
                        <div className="flex-1">
                            <div className="font-medium text-red-800 dark:text-red-300">
                                Toggle Active Status
                            </div>
                            <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {clearanceType.is_active ? 'Deactivate' : 'Activate'} this clearance type
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
                            onClick={onToggleStatus}
                        >
                            {clearanceType.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-md">
                        <div className="flex-1">
                            <div className="font-medium text-red-800 dark:text-red-300">
                                Delete Clearance Type
                            </div>
                            <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                Permanently remove this clearance type
                            </div>
                            {clearanceType.clearances_count > 0 && (
                                <div className="flex items-center gap-2 mt-2 text-amber-600 dark:text-amber-400 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{clearanceType.clearances_count} clearance{clearanceType.clearances_count !== 1 ? 's' : ''} exist</span>
                                </div>
                            )}
                        </div>
                        <Button 
                            variant="destructive"
                            size="sm"
                            disabled={clearanceType.clearances_count > 0}
                            onClick={onDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
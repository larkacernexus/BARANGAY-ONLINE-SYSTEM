// resources/js/Pages/Admin/Positions/components/danger-zone.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Position } from '@/types/admin/positions/position.types';

interface Props {
    position: Position;
    onDelete: () => void;
}

export const DangerZone = ({ position, onDelete }: Props) => {
    // Check if position has any assigned officials
    const hasOfficials = (position.officials_count ?? 0) > 0;
    const isDeletable = !hasOfficials;

    return (
        <Card className="border-red-200 dark:border-red-900 dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400">
                    Irreversible actions. Proceed with caution.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <div className="space-y-1">
                        <h4 className="font-medium text-red-800 dark:text-red-300">Delete Position</h4>
                        <p className="text-sm text-red-600 dark:text-red-400">
                            This will permanently delete the position.
                            {hasOfficials && (
                                <span className="font-bold block mt-1">
                                    ⚠️ Cannot delete while {position.officials_count} official(s) are assigned to this position.
                                </span>
                            )}
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={!isDeletable}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Position
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
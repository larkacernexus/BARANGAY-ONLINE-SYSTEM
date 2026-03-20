// resources/js/Pages/Admin/Users/components/danger-zone-card.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    Trash2,
} from 'lucide-react';

interface Props {
    user: any;
    onDelete: () => void;
}

export const DangerZoneCard = ({ user, onDelete }: Props) => {
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
                        <h4 className="font-medium text-red-800 dark:text-red-300">Delete User</h4>
                        <p className="text-sm text-red-600 dark:text-red-400">
                            Permanently delete this user account and all associated data.
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
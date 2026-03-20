// resources/js/Pages/Admin/Roles/components/danger-zone.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertTriangle,
    Trash2,
} from 'lucide-react';
import { Role } from '../types';

interface Props {
    role: Role;
    onDelete: () => void;
    canDelete: boolean;
}

export const DangerZone = ({ role, onDelete, canDelete }: Props) => {
    return (
        <Card className="border-red-200 dark:border-red-900 dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400">
                    Irreversible actions for this role
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-md">
                        <div className="flex-1">
                            <div className="font-medium text-red-800 dark:text-red-300">
                                Delete this role
                            </div>
                            <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                Once deleted, this role cannot be recovered. Users assigned to this role will lose their role-based permissions.
                            </div>
                        </div>
                        <Button 
                            variant="destructive"
                            onClick={onDelete}
                            disabled={!canDelete}
                            className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Role
                            {!canDelete && role.users_count && role.users_count > 0 && (
                                <span className="ml-2 text-xs">({role.users_count} users assigned)</span>
                            )}
                        </Button>
                    </div>

                    {role.users_count && role.users_count > 0 && (
                        <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Cannot Delete Role</AlertTitle>
                            <AlertDescription>
                                This role has {role.users_count} users assigned. You must reassign or remove all users before deleting this role.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
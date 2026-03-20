// resources/js/Pages/Admin/Roles/components/quick-actions-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    Zap,
    Key,
    Users,
    Download,
    Copy,
} from 'lucide-react';
import { Role } from '../types';

interface Props {
    role: Role;
    onManagePermissions: () => void;
    onExport: () => void;
}

export const QuickActionsCard = ({ role, onManagePermissions, onExport }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={onManagePermissions}
                    disabled={role.is_system_role}
                >
                    <Key className="h-4 w-4 mr-2" />
                    Manage Permissions
                </Button>
                
                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={() => {
                        router.get(route('users.index'), { role: role.id });
                    }}
                >
                    <Users className="h-4 w-4 mr-2" />
                    View Assigned Users
                </Button>
                
                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={onExport}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Export Details
                </Button>
                
                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={() => {
                        router.get(route('admin.roles.create'), {
                            duplicate: role.id,
                        });
                    }}
                    disabled={role.is_system_role}
                >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Role
                </Button>
            </CardContent>
        </Card>
    );
};
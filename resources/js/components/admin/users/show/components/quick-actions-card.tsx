// resources/js/Pages/Admin/Users/components/quick-actions-card.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Zap,
    Edit,
    Key,
    XCircle,
    CheckCircle,
    LogOut,
    Trash2,
} from 'lucide-react';

interface Props {
    user: any;
    onResetPassword: () => void;
    onToggleStatus: () => void;
    onLogoutAll: () => void;
    onDelete: () => void;
}

export const QuickActionsCard = ({
    user,
    onResetPassword,
    onToggleStatus,
    onLogoutAll,
    onDelete
}: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Link href={`/users/${user.id}/edit`} className="w-full">
                    <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                    </Button>
                </Link>
                
                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={onResetPassword}
                >
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
                </Button>

                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={onToggleStatus}
                >
                    {user.status === 'active' ? (
                        <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Deactivate User
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate User
                        </>
                    )}
                </Button>

                <Button 
                    variant="outline" 
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={onLogoutAll}
                    disabled={!user.last_login_at}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout All Sessions
                </Button>

                <Separator className="dark:bg-gray-700" />

                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                    onClick={onDelete}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                </Button>
            </CardContent>
        </Card>
    );
};
// resources/js/Pages/Admin/Permissions/components/quick-actions-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    Zap,
    Shield,
    Users,
    MessageCircle,
} from 'lucide-react';

interface Props {
    onContactDeveloper: () => void;
}

export const QuickActionsCard = ({ onContactDeveloper }: Props) => {
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
                    onClick={() => router.visit(route('admin.roles.index'))}
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                >
                    <Shield className="h-4 w-4 mr-2" />
                    View All Roles
                </Button>

                <Button
                    variant="outline"
                    onClick={() => router.visit(route('admin.users.index'))}
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                >
                    <Users className="h-4 w-4 mr-2" />
                    View All Users
                </Button>

                <Separator className="dark:bg-gray-700" />

                <Button
                    variant="outline"
                    onClick={onContactDeveloper}
                    className="w-full justify-start border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/30"
                >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Need Help? Contact Support
                </Button>
            </CardContent>
        </Card>
    );
};
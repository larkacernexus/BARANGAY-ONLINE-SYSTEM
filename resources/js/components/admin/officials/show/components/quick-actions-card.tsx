// resources/js/Pages/Admin/Officials/components/quick-actions-card.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Zap,
    Edit,
    User,
    Users,
    Printer,
    Trash2,
} from 'lucide-react';

interface Props {
    official: any;
    onDelete: () => void;
}

export const QuickActionsCard = ({ official, onDelete }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Link href={`/officials/${official.id}/edit`} className="w-full">
                    <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Official
                    </Button>
                </Link>
                
                {official.resident && (
                    <Link href={`/residents/${official.resident.id}`} className="w-full">
                        <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                            <User className="h-4 w-4 mr-2" />
                            View Resident Profile
                        </Button>
                    </Link>
                )}
                
                <Link href={`/officials?committee=${official.committee}`} className="w-full">
                    <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                        <Users className="h-4 w-4 mr-2" />
                        View Same Committee
                    </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Profile
                </Button>
                
                <Separator className="dark:bg-gray-700" />
                
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                    onClick={onDelete}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Official
                </Button>
            </CardContent>
        </Card>
    );
};
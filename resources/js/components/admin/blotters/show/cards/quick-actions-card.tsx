// resources/js/components/admin/blotters/show/components/cards/quick-actions-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
import { Copy, Edit, Trash2, Settings } from 'lucide-react';
import { Blotter } from '@/components/admin/blotters/show/types';

interface QuickActionsCardProps {
    blotter: Blotter;
}

export function QuickActionsCard({ blotter }: QuickActionsCardProps) {
    const handleCopyNumber = () => {
        navigator.clipboard.writeText(blotter.blotter_number);
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button
                    variant="outline"
                    className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    onClick={handleCopyNumber}
                >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Blotter Number
                </Button>
                
                <Link href={`/admin/blotters/${blotter.id}/edit`}>
                    <Button
                        variant="outline"
                        className="w-full justify-start dark:border-gray-600 dark:text-gray-300"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Record
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
// resources/js/components/admin/blotters/show/components/danger-zone.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface Blotter {
    id: number;
    blotter_number: string;
}

interface DangerZoneProps {
    blotter: Blotter;
    onDelete: () => void;
}

export function DangerZone({ blotter, onDelete }: DangerZoneProps) {
    return (
        <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription>
                    Permanently delete this blotter record. This action cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    variant="destructive"
                    onClick={onDelete}
                    className="bg-red-600 hover:bg-red-700"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Blotter Record
                </Button>
            </CardContent>
        </Card>
    );
}
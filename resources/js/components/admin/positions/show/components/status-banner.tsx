// resources/js/Pages/Admin/Positions/components/status-banner.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    Target,
} from 'lucide-react';
import { Position } from '../types';

interface Props {
    position: Position;
}

export const StatusBanner = ({ position }: Props) => {
    const isKagawadPosition = position.name.toLowerCase().includes('kagawad') || 
                              position.code.toLowerCase().includes('kagawad');

    return (
        <Card className="border-l-4 border-l-amber-500 dark:bg-gray-900">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        <div>
                            <p className="font-medium dark:text-gray-100">No Committees Assigned</p>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                This position has no primary or additional committees assigned.
                                {isKagawadPosition && (
                                    <span className="block mt-1 text-xs">
                                        Kagawad positions usually have a primary committee.
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <Link href={`/admin/positions/${position.id}/edit`}>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <Target className="h-4 w-4 mr-2" />
                            Assign Committee
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};
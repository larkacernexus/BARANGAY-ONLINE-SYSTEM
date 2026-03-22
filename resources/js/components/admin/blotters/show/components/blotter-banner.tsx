// resources/js/components/admin/blotters/show/components/blotter-banner.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Clock, Edit } from 'lucide-react';
import { Blotter } from '../types';

interface BlotterBannerProps {
    blotter: Blotter;
}

export function BlotterBanner({ blotter }: BlotterBannerProps) {
    return (
        <Card className="border-l-4 border-l-yellow-500 dark:bg-gray-900">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                        <div>
                            <p className="font-medium dark:text-gray-100">Pending Investigation</p>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                This blotter is pending review and investigation.
                            </p>
                        </div>
                    </div>
                    <Link href={`/admin/blotters/${blotter.id}/edit`}>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <Edit className="h-4 w-4 mr-2" />
                            Update Status
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
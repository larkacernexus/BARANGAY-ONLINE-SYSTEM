// resources/js/components/admin/community-reports/show/components/status-banner.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';
import { StatusBanner } from '@/types/admin/reports/community-report';

interface StatusBannerProps {
    banner: StatusBanner;
    onAssign: () => void;
}

export function StatusBannerComponent({ banner, onAssign }: StatusBannerProps) {
    return (
        <Card className={`border-l-4 ${banner.color === 'red' ? 'border-l-red-500' : 'border-l-amber-500'} dark:bg-gray-900`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {banner.icon}
                        <div>
                            <p className="font-medium dark:text-gray-100">{banner.title}</p>
                            <p className={`text-sm ${banner.color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {banner.message}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={onAssign} className="dark:border-gray-600 dark:text-gray-300">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Assign Staff
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
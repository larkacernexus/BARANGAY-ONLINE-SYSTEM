// resources/js/Pages/Admin/Announcements/components/expiry-banner.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Edit } from 'lucide-react';
import { route } from 'ziggy-js';

interface Announcement {
    id: number;
    end_date: string | null;
    is_active: boolean;
}

interface Props {
    announcement: Announcement;
    daysUntilEnd: number | null;
}

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const ExpiryBanner = ({ announcement, daysUntilEnd }: Props) => {
    if (daysUntilEnd === null || daysUntilEnd > 7 || !announcement.is_active) return null;

    return (
        <Card className={`border-l-4 ${daysUntilEnd <= 0 ? 'border-l-red-500' : 'border-l-amber-500'} dark:bg-gray-900`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {daysUntilEnd <= 0 ? (
                            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                        ) : (
                            <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        )}
                        <div>
                            <p className="font-medium dark:text-gray-100">
                                {daysUntilEnd <= 0 ? 'Announcement Expired' : 'Announcement Expiring Soon'}
                            </p>
                            <p className={`text-sm ${daysUntilEnd <= 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {daysUntilEnd <= 0 
                                    ? `This announcement expired on ${formatDate(announcement.end_date)}` 
                                    : `This announcement will expire in ${daysUntilEnd} day${daysUntilEnd !== 1 ? 's' : ''} (${formatDate(announcement.end_date)})`}
                            </p>
                        </div>
                    </div>
                    <Link href={route('admin.announcements.edit', announcement.id)}>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300" type="button">
                            <Edit className="h-4 w-4 mr-2" />
                            Extend Date
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};
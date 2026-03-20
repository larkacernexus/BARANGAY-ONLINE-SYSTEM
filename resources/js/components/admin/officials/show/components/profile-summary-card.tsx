// resources/js/Pages/Admin/Officials/components/profile-summary-card.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Target,
    ExternalLink,
} from 'lucide-react';

interface Props {
    official: any;
}

export const ProfileSummaryCard = ({ official }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <User className="h-5 w-5" />
                    Profile Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Official ID</span>
                        <span className="font-mono text-sm dark:text-gray-300">#{official.id}</span>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Display Order</span>
                        <span className="font-medium dark:text-gray-300">{official.order}</span>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Committee</span>
                        {official.committee_name ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                <Target className="h-3 w-3 mr-1" />
                                {official.committee_name}
                            </Badge>
                        ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                        )}
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Resident Profile</span>
                        {official.resident ? (
                            <Link 
                                href={`/residents/${official.resident.id}`}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center gap-1"
                            >
                                View Profile
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                        ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">Not linked</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
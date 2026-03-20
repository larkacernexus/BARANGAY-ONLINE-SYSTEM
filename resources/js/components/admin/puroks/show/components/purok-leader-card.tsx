// resources/js/Pages/Admin/Puroks/components/purok-leader-card.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    UserCheck,
    Phone,
    User,
    UserPlus,
} from 'lucide-react';
import { Purok } from '../types';

interface Props {
    purok: Purok;
}

export const PurokLeaderCard = ({ purok }: Props) => {
    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <UserCheck className="h-5 w-5" />
                    Purok Leader
                </CardTitle>
            </CardHeader>
            <CardContent>
                {purok.leader_name ? (
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                                {purok.leader_name.charAt(0)}
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium dark:text-gray-200">{purok.leader_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Phone className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {purok.leader_contact || 'No contact provided'}
                                </span>
                            </div>
                        </div>
                        {purok.leader_contact && (
                            <a href={`tel:${purok.leader_contact}`}>
                                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                                    Call
                                </Button>
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <User className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No leader assigned</p>
                        <Link href={`/admin/puroks/${purok.id}/edit`}>
                            <Button variant="outline" size="sm" className="mt-2 dark:border-gray-600 dark:text-gray-300">
                                <UserPlus className="h-3 w-3 mr-1" />
                                Assign Leader
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
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
    Mail,
    MapPin,
    ExternalLink
} from 'lucide-react';
import { Purok } from '@/types/admin/puroks/purok';

interface Props {
    purok: Purok;
}

export const PurokLeaderCard = ({ purok }: Props) => {
    const hasLeader = purok.leader_name && purok.leader_name.trim() !== '';
    const hasContact = purok.leader_contact && purok.leader_contact.trim() !== '';

    const formatPhoneNumber = (phone: string): string => {
        // Format Philippine mobile numbers
        if (phone.startsWith('09') && phone.length === 11) {
            return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
        }
        return phone;
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <UserCheck className="h-5 w-5" />
                    Purok Leader
                </CardTitle>
            </CardHeader>
            <CardContent>
                {hasLeader ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="font-bold text-blue-600 dark:text-blue-400 text-lg uppercase">
                                    {purok.leader_name.charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {purok.leader_name}
                                </p>
                                {hasContact && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <Phone className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {formatPhoneNumber(purok.leader_contact)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {hasContact && (
                                <div className="flex gap-2">
                                    <a href={`tel:${purok.leader_contact}`}>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            Call
                                        </Button>
                                    </a>
                                    <a href={`sms:${purok.leader_contact}`}>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            SMS
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Additional Leader Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                            {hasContact && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="truncate">{formatPhoneNumber(purok.leader_contact)}</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(purok.leader_contact)}
                                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Copy
                                    </button>
                                </div>
                            )}
                            
                            {purok.google_maps_url && (
                                <a 
                                    href={purok.google_maps_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    <MapPin className="h-4 w-4" />
                                    <span>View on Map</span>
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                            <User className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">No leader assigned to this purok</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Assign a leader to manage this purok's activities
                        </p>
                        <Link href={`/admin/puroks/${purok.id}/edit`}>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-4 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
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
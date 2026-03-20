// resources/js/Pages/Admin/Puroks/components/quick-actions-card.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Zap,
    UserPlus,
    Home,
    Share2,
    Mail,
    Copy,
    MessageSquare,
    Trash2,
} from 'lucide-react';
import { Purok } from '../types';

interface Props {
    purok: Purok;
    onDelete: () => void;
}

export const QuickActionsCard = ({ purok, onDelete }: Props) => {
    const shareViaEmail = () => {
        const subject = encodeURIComponent(`Purok ${purok.name} Information`);
        const body = encodeURIComponent(
            `Purok: ${purok.name}\n` +
            `Leader: ${purok.leader_name || 'Not assigned'}\n` +
            `Total Households: ${purok.total_households}\n` +
            `Total Residents: ${purok.total_residents}\n` +
            `Map Link: ${purok.google_maps_url || 'Not available'}`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    return (
        <Card className="dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Link href={`/residents/create?purok=${encodeURIComponent(purok.name)}`}>
                    <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Resident
                    </Button>
                </Link>
                <Link href={`/households/create?purok=${encodeURIComponent(purok.name)}`}>
                    <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                        <Home className="h-4 w-4 mr-2" />
                        Register Household
                    </Button>
                </Link>
                
                {purok.google_maps_url && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Location
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Share via</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={shareViaEmail}>
                                <Mail className="h-4 w-4 mr-2" />
                                Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                navigator.clipboard.writeText(purok.google_maps_url);
                            }}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                SMS
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                
                <Separator className="dark:bg-gray-700 my-2" />
                
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                    onClick={onDelete}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Purok
                </Button>
            </CardContent>
        </Card>
    );
};
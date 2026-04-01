// quick-actions-card.tsx

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
    Check,
} from 'lucide-react';

// Define a local type that matches the actual data structure
interface QuickActionsPurok {
    id: number;
    name: string;
    leader_name: string;
    leader_contact: string;
    google_maps_url: string;
    total_households: number;
    total_residents: number;
    status: string;
    created_at: string;
    updated_at?: string;
    households_count?: number;
    residents_count?: number;
    location?: string;
    latitude?: string | number | null;  // Add these to match the incoming data
    longitude?: string | number | null; // Add these to match the incoming data
}

interface Props {
    purok: QuickActionsPurok;
    onDelete: () => void;
}

export const QuickActionsCard = ({ purok, onDelete }: Props) => {
    const [copied, setCopied] = useState(false);
    const [notification, setNotification] = useState<{ show: boolean; message: string; type: string }>({
        show: false,
        message: '',
        type: ''
    });

    const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const shareViaEmail = () => {
        const subject = encodeURIComponent(`Purok ${purok.name} Information`);
        const body = encodeURIComponent(
            `Purok: ${purok.name}\n` +
            `Leader: ${purok.leader_name || 'Not assigned'}\n` +
            `Total Households: ${purok.total_households || 0}\n` +
            `Total Residents: ${purok.total_residents || 0}\n` +
            `Map Link: ${purok.google_maps_url || 'Not available'}`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        showNotification('Email client opened', 'info');
    };

    const copyLink = () => {
        if (purok.google_maps_url) {
            navigator.clipboard.writeText(purok.google_maps_url).then(() => {
                setCopied(true);
                showNotification('Link copied to clipboard!', 'success');
                setTimeout(() => setCopied(false), 2000);
            }).catch(() => {
                showNotification('Failed to copy link', 'error');
            });
        }
    };

    const shareViaSMS = () => {
        const message = encodeURIComponent(
            `Check out Purok ${purok.name}!\n` +
            `Location: ${purok.google_maps_url || 'Map not available'}\n` +
            `Leader: ${purok.leader_name || 'Not assigned'}`
        );
        window.location.href = `sms:?body=${message}`;
        showNotification('SMS app opened', 'info');
    };

    return (
        <>
            <Card className="dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                        <Zap className="h-5 w-5" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Link href={`/admin/residents/create?purok_id=${purok.id}&purok_name=${encodeURIComponent(purok.name)}`}>
                        <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Resident
                        </Button>
                    </Link>
                    <Link href={`/admin/households/create?purok_id=${purok.id}&purok_name=${encodeURIComponent(purok.name)}`}>
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
                                <DropdownMenuItem onClick={copyLink}>
                                    {copied ? (
                                        <Check className="h-4 w-4 mr-2 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4 mr-2" />
                                    )}
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={shareViaSMS}>
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

            {/* Simple notification system */}
            {notification.show && (
                <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
                    notification.type === 'success' ? 'bg-green-500' : 
                    notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                } text-white`}>
                    <div className="flex items-center gap-2">
                        {notification.type === 'success' && <Check className="h-4 w-4" />}
                        {notification.type === 'error' && <XCircle className="h-4 w-4" />}
                        {notification.type === 'info' && <Info className="h-4 w-4" />}
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}
        </>
    );
};

// Add missing imports
import { XCircle, Info } from 'lucide-react';
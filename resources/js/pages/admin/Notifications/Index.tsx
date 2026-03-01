// pages/Notifications/Index.tsx
import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/admin-app-layout';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CheckCheck } from 'lucide-react';
import axios from 'axios';
import { Notification } from '@/types/notification';

interface NotificationsPageProps {
    notifications: {
        data: Notification[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function NotificationsIndex({ notifications }: NotificationsPageProps) {
    const { props } = usePage();
    
    const markAsRead = async (notificationId: string) => {
        try {
            await axios.post(`/notifications/${notificationId}/read`);
            // Refresh page or update state
            window.location.reload();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            window.location.reload();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'fee_created':
                return '💰';
            default:
                return '📋';
        }
    };

    return (
        <AppLayout
            title="Notifications"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Notifications', href: '/notifications' },
            ]}
        >
            <Head title="Notifications" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <Button onClick={markAllAsRead} variant="outline">
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Mark all as read
                    </Button>
                </div>

                <div className="bg-white rounded-lg shadow">
                    {notifications.data.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.data.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={notification.data.link}
                                    onClick={() => !notification.read_at && markAsRead(notification.id)}
                                    className={`block p-6 hover:bg-gray-50 transition-colors ${
                                        !notification.read_at ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex gap-4">
                                        <div className="text-3xl">
                                            {getNotificationIcon(notification.data.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-800">
                                                {notification.data.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-sm text-gray-500">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </span>
                                                {notification.data.bulk_count && (
                                                    <>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                            Bulk: {notification.data.bulk_count} fees
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {!notification.read_at && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="mt-6 flex justify-center">
                        {/* Add your pagination component here */}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
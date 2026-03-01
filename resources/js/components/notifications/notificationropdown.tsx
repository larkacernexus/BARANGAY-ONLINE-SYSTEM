// components/Notifications/NotificationDropdown.tsx
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notification';
import axios from 'axios';

interface NotificationDropdownProps {
    notifications: Notification[];
    unreadCount: number;
}

export default function NotificationDropdown({ notifications: initialNotifications, unreadCount: initialUnreadCount }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [open, setOpen] = useState(false);

    const markAsRead = async (notificationId: string) => {
        try {
            await axios.post(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
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
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>
                
                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={notification.data.link}
                                    onClick={() => !notification.read_at && markAsRead(notification.id)}
                                    className={`block p-4 hover:bg-gray-50 transition-colors ${
                                        !notification.read_at ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="text-2xl">
                                            {getNotificationIcon(notification.data.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-800">
                                                {notification.data.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                            {notification.data.bulk_count && (
                                                <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                    Bulk: {notification.data.bulk_count} fees
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                
                <div className="p-2 border-t">
                    <Link
                        href="/notifications"
                        className="block text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                        onClick={() => setOpen(false)}
                    >
                        View all notifications
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
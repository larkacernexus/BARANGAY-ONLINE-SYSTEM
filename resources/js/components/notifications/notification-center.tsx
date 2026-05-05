import { Bell, CheckCircle2, User, ExternalLink, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Notification {
    id: string;
    type: string;
    data: Record<string, unknown>;
    read_at: string | null;
    is_read: boolean;
    created_at: string;
    created_at_raw: string;
}

interface NotificationCenterProps {
    notifications: Notification[];
    unreadCount: number;
    isOpen: boolean;
    onClose: () => void;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onViewAll: () => void;
}

type NotificationCategory = 'fee' | 'payment' | 'report' | 'clearance' | 'system';

const CATEGORY_ICONS: Record<NotificationCategory, typeof Bell> = {
    fee: CheckCircle2,
    payment: CheckCircle,
    report: AlertCircle,
    clearance: Info,
    system: Bell,
};

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
    fee: 'text-emerald-500',
    payment: 'text-green-500',
    report: 'text-orange-500',
    clearance: 'text-blue-500',
    system: 'text-purple-500',
};

const CATEGORY_GRADIENTS: Record<NotificationCategory, string> = {
    fee: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    payment: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    report: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
    clearance: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    system: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
};

function getCategory(notification: Notification): NotificationCategory {
    const type = notification.type.toLowerCase();

    if (type.includes('fee') || notification.data?.fee_code || notification.data?.formatted_amount) return 'fee';
    if (type.includes('payment') || notification.data?.or_number) return 'payment';
    if (type.includes('report') || notification.data?.report_number) return 'report';
    if (type.includes('clearance') || notification.data?.reference_number) return 'clearance';

    return 'system';
}

function getTitle(notification: Notification): string {
    if (notification.data?.title) return String(notification.data.title);
    if (notification.data?.message) return String(notification.data.message).substring(0, 50);

    return notification.type.replace(/([A-Z])/g, ' $1').trim();
}

function getMessage(notification: Notification): string {
    if (notification.data?.message) return String(notification.data.message);
    if (notification.data?.description) return String(notification.data.description);

    return 'No details available';
}

function resolveUrl(notification: Notification): string | null {
    const url = notification.data?.action_url
        || notification.data?.url
        || notification.data?.link;

    if (!url || url === '#') return null;

    return String(url);
}

function formatAmount(value: unknown): string | null {
    if (!value || value === '0' || value === '0.00') return null;

    const num = Number(value);
    if (!isNaN(num) && num > 0) return `₱${num.toFixed(2)}`;

    const str = String(value);
    if (str.startsWith('₱')) return str;

    return `₱${str}`;
}

function NotificationItem({ notification, onClick }: { notification: Notification; onClick: () => void }) {
    const category = getCategory(notification);
    const Icon = CATEGORY_ICONS[category];
    const title = getTitle(notification);
    const message = getMessage(notification);
    const residentName = notification.data?.resident_name ?? notification.data?.payer_name ?? null;
    const amount = formatAmount(notification.data?.formatted_amount ?? notification.data?.amount);
    const badge = notification.data?.fee_code || notification.data?.clearance_type || null;

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left p-4 rounded-xl transition-all duration-200 relative overflow-hidden group",
                notification.is_read
                    ? 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900/50'
                    : cn("bg-gradient-to-r", CATEGORY_GRADIENTS[category])
            )}
        >
            {!notification.is_read && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
            )}

            <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm flex-shrink-0", CATEGORY_COLORS[category])}>
                    <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {title}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                            {notification.created_at || 'Just now'}
                        </span>
                    </div>

                    {residentName && (
                        <div className="flex items-center gap-1 mb-1">
                            <User className="h-3 w-3 text-purple-500 flex-shrink-0" />
                            <span className="text-xs text-purple-600 dark:text-purple-400 truncate">
                                {String(residentName)}
                            </span>
                        </div>
                    )}

                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {message}
                    </p>

                    {amount && (
                        <div className="mt-2">
                            <span className="inline-block text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                {amount}
                            </span>
                        </div>
                    )}

                    {badge && !amount && (
                        <div className="mt-2">
                            <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                                {String(badge)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}

export function NotificationCenter({
    notifications,
    unreadCount,
    isOpen,
    onClose,
    onMarkAsRead,
    onMarkAllAsRead,
    onViewAll,
}: NotificationCenterProps) {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        if (isOpen) {
            setFilter('all');
        }
    }, [isOpen]);

    const filtered = notifications.filter((n) =>
        filter === 'all' || (filter === 'unread' && !n.is_read)
    );

    function handleClick(notification: Notification) {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }

        const url = resolveUrl(notification);

        if (url) {
            onClose();
            router.visit(url, {
                onError: () => {
                    window.location.href = url;
                },
            });
        } else {
            onClose();
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <SheetTitle className="text-xl font-semibold flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-500" />
                        Notifications
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {unreadCount} new
                            </Badge>
                        )}
                    </SheetTitle>
                    <SheetDescription>
                        Stay updated with system activities
                    </SheetDescription>

                    <div className="flex items-center gap-2 mt-4">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('all')}
                            className="flex-1"
                        >
                            All
                        </Button>
                        <Button
                            variant={filter === 'unread' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('unread')}
                            className="flex-1"
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-6">
                                <Bell className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {filter === 'unread'
                                    ? "You've read all your notifications"
                                    : "You're all caught up"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filter === 'unread' && unreadCount > 0 && (
                                <div className="flex justify-end mb-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onMarkAllAsRead}
                                        className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                        <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                        Mark all as read
                                    </Button>
                                </div>
                            )}

                            {filtered.map((notification, index) => (
                                <div
                                    key={notification.id}
                                    className="animate-slide-in-right"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <NotificationItem
                                        notification={notification}
                                        onClick={() => handleClick(notification)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex-shrink-0">
                    <Button
                        onClick={onViewAll}
                        variant="outline"
                        className="w-full gap-2 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                        <Bell className="h-4 w-4 text-gray-500" />
                        <span>All Notifications</span>
                        <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </Button>
                    <p className="text-xs text-center text-gray-500 mt-2">
                        View and manage all your notifications
                    </p>
                </div>
            </SheetContent>

            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </Sheet>
    );
}
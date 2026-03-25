// /components/residentui/notifications/NotificationIcon.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { getNotificationIcon } from '@/utils/portal/notifications/notification-utils';
import { Notification } from '@/types/portal/notifications/types';

interface NotificationIconProps {
  notification: Notification;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ notification }) => {
  const { icon: Icon, color, bgColor } = getNotificationIcon(notification);

  return (
    <div className={cn(
      "p-3 rounded-xl shadow-sm border",
      bgColor,
      "border-gray-200 dark:border-gray-700"
    )}>
      <Icon className={cn("h-5 w-5", color)} />
    </div>
  );
};
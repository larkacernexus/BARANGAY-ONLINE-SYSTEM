// /components/residentui/notifications/utils.ts
import { formatDistanceToNow } from 'date-fns';
import { NOTIFICATION_ICON_CONFIG } from  '@/components/residentui/notifications/constants';
import { Notification } from '@/types/portal/notifications/types';

export const getNotificationIcon = (notification: Notification): { icon: any; color: string; bgColor: string } => {
  if (notification.is_fee_notification) {
    return NOTIFICATION_ICON_CONFIG.fee;
  }
  
  const type = notification.data?.type || notification.type;
  
  if (type.includes('Payment')) return NOTIFICATION_ICON_CONFIG.payment;
  if (type.includes('Clearance')) return NOTIFICATION_ICON_CONFIG.clearance;
  if (type.includes('Report')) return NOTIFICATION_ICON_CONFIG.report;
  if (type.includes('Announcement')) return NOTIFICATION_ICON_CONFIG.announcement;
  if (type.includes('Household')) return NOTIFICATION_ICON_CONFIG.household;
  if (type.includes('Member')) return NOTIFICATION_ICON_CONFIG.member;
  
  return NOTIFICATION_ICON_CONFIG.default;
};

export const formatNotificationTime = (date: string): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return date;
  }
};

export const getNotificationLink = (notification: Notification): string => {
  const link = notification.link || notification.action_url || notification.data?.link || notification.data?.action_url;
  return link || '#';
};
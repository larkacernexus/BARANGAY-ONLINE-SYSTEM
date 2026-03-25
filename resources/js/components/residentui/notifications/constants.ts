// /components/residentui/notifications/constants.ts
import { 
  Bell, DollarSign, CreditCard, FileCheck, AlertCircle, Info, Home, Users,
  Calendar
} from 'lucide-react';

export const NOTIFICATION_TYPES = [
  { value: 'all', label: 'All Types', icon: Bell },
  { value: 'fee', label: 'Fee Notifications', icon: DollarSign },
  { value: 'payment', label: 'Payment Notifications', icon: CreditCard },
  { value: 'clearance', label: 'Clearance Notifications', icon: FileCheck },
  { value: 'report', label: 'Report Notifications', icon: AlertCircle },
  { value: 'announcement', label: 'Announcements', icon: Info },
  { value: 'household', label: 'Household Updates', icon: Home },
  { value: 'member', label: 'Member Updates', icon: Users },
] as const;

export const TIME_FILTERS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '90days', label: 'Last 90 days' },
] as const;

export const NOTIFICATION_ICON_CONFIG = {
  fee: { icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
  payment: { icon: CreditCard, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950/30' },
  clearance: { icon: FileCheck, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  report: { icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
  announcement: { icon: Info, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  household: { icon: Home, color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30' },
  member: { icon: Users, color: 'text-pink-500', bgColor: 'bg-pink-50 dark:bg-pink-950/30' },
  default: { icon: Bell, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-800' }
};
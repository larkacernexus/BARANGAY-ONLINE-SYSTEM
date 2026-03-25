// /components/residentui/dashboard/constants.ts
import { EmergencyContact, Service, Tab } from '@/types/portal/dashboard/dashboard-types';
import { 
    Shield, Flame, Heart, Home, 
    FileText, FileCheck, Download, Eye,
    CreditCard, Receipt, AlertCircle,
    Clock,
    LayoutDashboard
} from 'lucide-react';

export const STATUS_VARIANTS: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    paid: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    approved: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    pending: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    processing: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    'in-progress': 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    rejected: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    cancelled: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    overdue: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
};

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
    { name: 'Police', number: '117', icon: Shield, gradient: 'from-blue-500 to-blue-600' },
    { name: 'Fire', number: '160', icon: Flame, gradient: 'from-rose-500 to-rose-600' },
    { name: 'Ambulance', number: '161', icon: Heart, gradient: 'from-emerald-500 to-emerald-600' },
    { name: 'Barangay', number: '(082) 123-4567', icon: Home, gradient: 'from-purple-500 to-purple-600' },
];

export const DOCUMENT_SERVICES: Service[] = [
    { icon: FileText, label: 'Barangay Clearance', href: '/resident/clearances/create', gradient: 'from-blue-500 to-blue-600' },
    { icon: FileCheck, label: 'Certificate', href: '/resident/certificates', gradient: 'from-emerald-500 to-emerald-600' },
    { icon: Download, label: 'Download Forms', href: '/resident/forms', gradient: 'from-purple-500 to-purple-600' },
    { icon: Eye, label: 'View Records', href: '/resident/documents', gradient: 'from-amber-500 to-amber-600' },
];

export const PAYMENT_SERVICES: Service[] = [
    { icon: CreditCard, label: 'Make Payment', href: '/resident/payments/create', gradient: 'from-blue-500 to-blue-600' },
    { icon: Receipt, label: 'View Receipts', href: '/resident/receipts', gradient: 'from-emerald-500 to-emerald-600' },
    { icon: Download, label: 'Download Summary', href: '/resident/payments/summary', gradient: 'from-purple-500 to-purple-600' },
    { icon: AlertCircle, label: 'Payment Status', href: '/resident/payments/status', gradient: 'from-amber-500 to-amber-600' },
];

export const TABS: Tab[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'history', label: 'History', icon: Clock },
];
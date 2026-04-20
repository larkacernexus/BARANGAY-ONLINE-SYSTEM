// /components/residentui/dashboard/types.ts
import { LucideIcon } from 'lucide-react';

export interface Stats {
    total_payments?: number;
    total_clearances?: number;
    total_complaints?: number;
}

export interface Resident {
    id?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    household_number?: string;
    purok?: string;
}

export interface Payment {
    id: string;
    fee_type?: string;
    created_at: string;
    amount: number;
    status: string;
}

export interface Clearance {
    id: string;
    clearance_type?: string;
    created_at: string;
    status: string;
}

export interface Complaint {
    id: string;
    subject?: string;
    created_at: string;
    status: string;
}

export interface Announcement {
    type: any;
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    content: string;
    created_at: string;
}

export interface Event {
    id: string;
    title: string;
    event_date?: string;
    date?: string;
    location?: string;
}

export interface PaymentSummary {
    total?: number;
}

export interface Activity {
    id: string;
    type: 'payment' | 'clearance' | 'complaint' | 'welcome';
    description: string;
    status: string;
    date: string;
    amount?: string;
    icon: LucideIcon;
}

export interface QuickAction {
    icon: LucideIcon;
    label: string;
    description: string;
    href: string;
    badge?: number;
    gradient: string;
}

export interface EmergencyContact {
    name: string;
    number: string;
    icon: LucideIcon;
    gradient: string;
}

export interface Service {
    icon: LucideIcon;
    label: string;
    href: string;
    gradient: string;
    count?: number;
}

export interface Tab {
    id: string;
    label: string;
    icon: LucideIcon;
}
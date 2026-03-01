// types/resident-ui.ts
import { LucideIcon } from 'lucide-react';

export interface StatusConfig {
    label: string;
    color: string;
    icon: LucideIcon;
    gradient: string;
}

export interface UrgencyConfig {
    label: string;
    color: string;
    dot: string;
}

export interface TabConfig {
    id: string;
    label: string;
    icon: LucideIcon;
}

export interface DocumentFile {
    id: number;
    file_path: string;
    file_name: string;
    original_name?: string;
    description?: string;
    file_size: number;
    file_type?: string;
    mime_type?: string;
    is_verified: boolean;
    document_type?: {
        id: number;
        name: string;
    };
}

export interface PaymentSummary {
    due: number;
    paid: number;
    balance: number;
}

export interface Breadcrumb {
    title: string;
    href: string;
}
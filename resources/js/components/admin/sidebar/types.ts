import { LucideIcon } from 'lucide-react';

export interface SidebarItem {
    title: string;
    href: string;
    icon: LucideIcon;
    badge?: number | string;
    badgeColor?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary';
    isActive?: (currentUrl: string) => boolean;
    description?: string;
    color?: string;
    requiredPermission?: string;
    isNew?: boolean;
    isUpdated?: boolean;
}

export interface QuickAction extends SidebarItem {
    color:
        | 'blue'
        | 'green'
        | 'purple'
        | 'orange'
        | 'red'
        | 'indigo'
        | 'amber'
        | 'cyan'
        | 'lime'
        | 'pink'
        | 'violet'
        | 'yellow'
        | 'emerald'
        | 'teal';
}

export interface SidebarCategory {
    title: string;
    icon: LucideIcon;
    items: SidebarItem[];
}

export type SidebarTab = 'operations' | 'settings';

// Stats interfaces for type safety
export interface ReportStats {
    total: number;
    pending: number;
    community_reports: number;
    blotters: number;
    today: number;
    under_review: number;
    assigned: number;
    in_progress: number;
    resolved: number;
    rejected: number;
    high_priority: number;
    pending_clearances: number;
}

export interface ResidentStats {
    total: number;
    active: number;
    inactive: number;
    households: number;
    businesses: number;
    voters: number;
    senior_citizens: number;
    pwd: number;
    solo_parents: number;
}

export interface PaymentStats {
    total_fees: number;
    total_payments: number;
    pending_payments: number;
    total_revenue: number;
    today_collections: number;
    monthly_collections: number;
}

export interface ServiceStats {
    total_forms: number;
    total_privileges: number;
    active_announcements: number;
    total_clearances: number;
    pending_clearances: number;
    approved_clearances: number;
}

export interface SystemStats {
    total_users: number;
    total_roles: number;
    total_permissions: number;
    total_puroks: number;
    total_positions: number;
    total_committees: number;
    total_officials: number;
    total_clearance_types: number;
    total_fee_types: number;
    total_report_types: number;
    total_document_types: number;
    active_sessions: number;
}

export interface SecurityStats {
    security_audits: number;
    access_logs_today: number;
    audit_logs_today: number;
    activity_logs_today: number;
    login_logs_today: number;
    active_sessions: number;
}

export interface SummaryCounts {
    totalReports: number;
    pendingReports: number;
    totalBlotters: number;
    totalResidents: number;
    totalHouseholds: number;
    totalBusinesses: number;
    pendingClearances: number;
    totalClearances: number;
    totalPayments: number;
    pendingPayments: number;
    totalRevenue: number;
    totalUsers: number;
    totalPuroks: number;
    totalOfficials: number;
}

// Props interface for usePage
export interface PageProps {
    auth?: {
        user?: {
            permissions?: string[];
            role_name?: string;
            role?: {
                name?: string;
            };
        };
    };
    reportStats?: Partial<ReportStats>;
    residentStats?: Partial<ResidentStats>;
    paymentStats?: Partial<PaymentStats>;
    serviceStats?: Partial<ServiceStats>;
    systemStats?: Partial<SystemStats>;
    securityStats?: Partial<SecurityStats>;
}
import { type LucideIcon } from 'lucide-react';

export type StatItem = {
    title: string;
    value: string | number;
    change: string;
    icon: React.ComponentType<any>;
    color: string;
    href: string;
    changeType: 'increase' | 'decrease' | 'neutral';
    trend?: 'up' | 'down' | 'stable';
    sparkline?: number[];
};

export type ActivityItem = {
    id: number;
    type: 'payment' | 'clearance' | 'registration' | 'complaint' | 'meeting' | 'alert' | 'event' | 'announcement';
    description: string;
    time: string;
    icon: React.ComponentType<any>;
    iconColor: string;
    bgColor: string;
    data?: any;
    isRead?: boolean;
    priority?: 'low' | 'medium' | 'high';
};

export type QuickAction = {
    icon: React.ComponentType<any>;
    label: string;
    href: string;
    description: string;
    badge?: string;
    shortcut?: string;
    category?: 'resident' | 'payment' | 'clearance' | 'report' | 'system';
};

export type SystemStatus = {
    service: string;
    status: 'online' | 'warning' | 'offline' | 'maintenance';
    lastCheck: string;
    details?: string;
    uptime?: string;
    responseTime?: string;
};

export type PageProps = {
    stats: {
        totalResidents: number;
        totalHouseholds: number;
        monthlyCollections: number;
        pendingClearances: number;
        seniorCitizens: number;
        pwds: number;
        soloParents: number;
        fourPs: number;
    };
    recentActivities: {
        newResidents: Array<{
            id: number;
            name: string;
            created_at: string;
            household_number?: string;
            [key: string]: any;
        }>;
        recentPayments: Array<{
            id: number;
            payer_name: string;
            total_amount: number;
            payment_date: string;
            payment_method: string;
            certificate_type?: string;
            [key: string]: any;
        }>;
        recentClearanceRequests: Array<{
            id: number;
            resident: {
                name: string;
            };
            clearanceType?: {
                name: string;
                code?: string;
            };
            purpose: string;
            created_at: string;
            status: string;
            urgency: string;
            [key: string]: any;
        }>;
        upcomingEvents?: Array<{
            id: number;
            title: string;
            date: string;
            attendees: number;
            location: string;
        }>;
    };
    paymentStats: {
        byCertificateType: Array<{
            type: string;
            original_type: string | number;
            count: number;
            amount: string;
        }>;
        byPaymentMethod: Array<{
            method: string;
            original_method: string;
            count: number;
            amount: string;
        }>;
        dailyCollections: Array<{
            date: string;
            day: string;
            count: number;
            amount: string;
        }>;
        monthlySummary?: Array<{
            month: string;
            amount: string;
            count: number;
        }>;
    };
    clearanceRequestStats: {
        byType: Array<{
            type: string;
            original_type: string | number;
            count: number;
        }>;
        byStatus: Array<{
            status: string;
            original_status: string;
            count: number;
        }>;
        byUrgency: Array<{
            urgency: string;
            original_urgency: string;
            count: number;
        }>;
    };
    clearanceTypeStats: Array<{
        id: number;
        name: string;
        code: string;
        description: string;
        fee: string;
        processing_days: number;
        validity_days: number;
        requires_payment: boolean;
        requires_approval: boolean;
        total_requests: number;
        monthly_requests: number;
        is_active: boolean;
    }>;
    collectionStats: {
        today: string;
        yesterday: string;
        weekly: string;
        monthly: string;
        yearly: string;
        dailyAvg: string;
        weeklyAvg: string;
        monthlyAvg: string;
        projectedMonthly: string;
        growthRate: string;
        selectedPeriod?: string;        // NEW: Collections for selected period
        selectedPeriodLabel?: string;   // NEW: Label for selected period
    };
    activityStats: {
        newResidentsToday: number;
        paymentsToday: number;
        clearanceRequestsToday: number;
        totalActivitiesThisWeek: number;
        activeUsers: number;
        peakHours: string[];
    };
    storageStats: {
        totalUsedMB: number;
        totalStorageMB: number;
        percentage: number;
        breakdown: {
            database: number;
            files: number;
            backups: number;
            logs: number;
        };
        details: {
            databaseSizeMB: number;
            fileStorageSizeMB: number;
            backupSizeMB: number;
            logSizeMB: number;
            fileCount: number;
            hasStorageFiles: boolean;
            residentCount: number;
            householdCount: number;
            paymentCount: number;
            clearanceCount: number;
            totalRows: number;
            tableCount: number;
            tableSizes: Record<string, { size_kb: number; rows: number }>;
        };
        backupStatus: {
            lastBackup: string;
            backupSize: string;
            isAutomatic: boolean;
        };
    };
    demographicStats: {
        ageGroups: Array<{
            group: string;
            count: number;
            percentage: number;
        }>;
        gender: {
            male: number;
            female: number;
            other: number;
        };
        civilStatus: Array<{
            status: string;
            count: number;
        }>;
        employment: Array<{
            type: string;
            count: number;
        }>;
        educationalAttainment: Array<{
            level: string;
            count: number;
        }>;
    };
    selectedDateRange?: 'today' | 'week' | 'month' | 'year';  // NEW: Selected date range from backend
};
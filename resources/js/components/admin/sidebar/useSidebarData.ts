import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import {
    LayoutGrid, AlertCircle, Clock, UserCheck, Scale, Users, Home, Briefcase,
    FileText, Award, Megaphone, CheckCircle, CreditCard, DollarSign, Receipt,
    BarChart3, Building2, Shield, Key, Link as LinkIcon, ShieldCheck, History,
    Activity, LogIn, Monitor, Server, Database, FileType, Tag, FileBox, UserCog,
    User, Lock, Palette, Users2, PlusCircle, FolderOpen, Zap,
    Eye, Heart, Image
} from 'lucide-react';
import { SidebarCategory, QuickAction } from './types';

// Helper function for safe currency formatting
const formatCurrency = (amount: number | null | undefined): string => {
    if (amount == null || isNaN(amount)) return '₱0';
    return `₱${amount.toLocaleString()}`;
};

// Helper function for safe number formatting
const formatNumber = (value: number | null | undefined): string | number => {
    if (value == null || isNaN(value)) return 0;
    return value;
};

// Helper function for dynamic badge colors
const getBadgeColor = (
    condition: boolean, 
    trueColor: 'warning' | 'destructive', 
    falseColor: 'default' = 'default'
): 'warning' | 'destructive' | 'default' => {
    return condition ? trueColor : falseColor;
};

export function useSidebarData() {
    const { props } = usePage() as any;
    const user = props?.auth?.user || {};
    const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const userRoleName = user?.role_name || user?.role?.name || '';
    
    const reportStats = props?.reportStats || { 
        total: 0, pending: 0, community_reports: 0, blotters: 0, today: 0, 
        under_review: 0, assigned: 0, in_progress: 0, resolved: 0, rejected: 0, 
        high_priority: 0, pending_clearances: 0 
    };
    
    const residentStats = props?.residentStats || {
        total: 0, active: 0, inactive: 0, households: 0, businesses: 0,
        voters: 0, senior_citizens: 0, pwd: 0, solo_parents: 0
    };
    
    const paymentStats = props?.paymentStats || {
        total_fees: 0, total_payments: 0, pending_payments: 0,
        total_revenue: 0, today_collections: 0, monthly_collections: 0
    };
    
    const serviceStats = props?.serviceStats || {
        total_forms: 0, total_privileges: 0, active_announcements: 0,
        total_clearances: 0, pending_clearances: 0, approved_clearances: 0
    };
    
    const systemStats = props?.systemStats || {
        total_users: 0, total_roles: 0, total_permissions: 0, total_puroks: 0,
        total_positions: 0, total_committees: 0, total_officials: 0,
        total_clearance_types: 0, total_fee_types: 0, total_report_types: 0,
        total_document_types: 0, active_sessions: 0, portal_banner_active: false
    };
    
    const securityStats = props?.securityStats || {
        security_audits: 0, access_logs_today: 0, audit_logs_today: 0,
        activity_logs_today: 0, login_logs_today: 0, active_sessions: 0
    };

    const hasPermission = (permission: string | undefined): boolean => {
        if (!permission) return true;
        if (userRoleName === 'admin' || userRoleName === 'barangay_officer') return true;
        return userPermissions.includes(permission);
    };

    const operationsCategories = useMemo(() => {
        const allCategories: SidebarCategory[] = [
            {
                title: 'Dashboard',
                icon: LayoutGrid,
                items: [{
                    title: 'Overview', href: '/admin/dashboard', icon: LayoutGrid,
                    description: 'System overview', 
                    color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                    isActive: (url: string) => url === '/admin/dashboard' || url === '/admin',
                    requiredPermission: 'view-dashboard',
                }],
            },
            {
                title: 'Incident Management',
                icon: AlertCircle,
                items: [
                    { 
                        title: 'All Reports', href: '/admin/community-reports', icon: FolderOpen,
                        description: 'Community reports', 
                        color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
                        isActive: (url: string) => url.startsWith('/admin/community-reports') && !url.includes('/create'),
                        requiredPermission: 'view-reports',
                        // ✅ KEEP BADGE - gives sense of scale
                        badge: formatNumber(reportStats.total),
                        badgeColor: 'default'
                    },
                    { 
                        title: 'Pending Review', href: '/admin/community-reports?status=pending', icon: AlertCircle,
                        description: 'Needs attention', 
                        color: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-400',
                        isActive: (url: string) => url.includes('status=pending'),
                        requiredPermission: 'review-reports',
                        // ✅ KEEP BADGE - actionable
                        badge: formatNumber(reportStats.pending),
                        badgeColor: 'warning'
                    },
                    { 
                        title: 'In Progress', href: '/admin/community-reports?status=in_progress', icon: Clock,
                        description: 'Being processed', 
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url.includes('status=in_progress'),
                        requiredPermission: 'view-reports',
                        // ❌ REMOVE BADGE - not critical
                    },
                    { 
                        title: 'Assigned', href: '/admin/community-reports?status=assigned', icon: UserCheck,
                        description: 'Assigned to staff', 
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url.includes('status=assigned'),
                        requiredPermission: 'view-reports',
                        // ❌ REMOVE BADGE - not critical
                    },
                    { 
                        title: 'High Priority', href: '/admin/community-reports?priority=high', icon: Zap,
                        description: 'Urgent reports', 
                        color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
                        isActive: (url: string) => url.includes('priority=high'),
                        requiredPermission: 'view-reports',
                        // ✅ KEEP BADGE - critical/urgent
                        badge: formatNumber(reportStats.high_priority),
                        badgeColor: 'destructive',
                        isNew: true
                    },
                    { 
                        title: 'Blotters', href: '/admin/blotters', icon: Scale,
                        description: 'Mediation cases', 
                        color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
                        isActive: (url: string) => url.startsWith('/admin/blotters') && !url.includes('/create'),
                        requiredPermission: 'manage-blotters',
                        // ✅ KEEP BADGE - informative
                        badge: formatNumber(reportStats.blotters),
                        badgeColor: 'destructive',
                        isUpdated: true 
                    },
                ],
            },
            {
                title: 'Residents',
                icon: Users,
                items: [
                    { 
                        title: 'All Residents', href: '/admin/residents', icon: Users,
                        description: 'Manage residents', 
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url.startsWith('/admin/residents') && !url.includes('/create'),
                        requiredPermission: 'manage-residents',
                        // ✅ KEEP BADGE - sense of scale
                        badge: formatNumber(residentStats.total),
                        badgeColor: 'default'
                    },
                    { 
                        title: 'Households', href: '/admin/households', icon: Home,
                        description: 'Manage households', 
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) => url.startsWith('/admin/households') && !url.includes('/create'),
                        requiredPermission: 'manage-households',
                        // ✅ KEEP BADGE - informative
                        badge: formatNumber(residentStats.households),
                        badgeColor: 'success'
                    },
                    { 
                        title: 'Businesses', href: '/admin/businesses', icon: Briefcase,
                        description: 'Manage businesses', 
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url.startsWith('/admin/businesses') && !url.includes('/create'),
                        requiredPermission: 'manage-businesses',
                        // ✅ KEEP BADGE - informative
                        badge: formatNumber(residentStats.businesses),
                        badgeColor: 'secondary'
                    },
                    { 
                        title: 'Senior Citizens', href: '/admin/residents?filter=senior', icon: Award,
                        description: 'Senior citizen records', 
                        color: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
                        isActive: (url: string) => url.includes('filter=senior'),
                        requiredPermission: 'view-residents',
                        // ❌ REMOVE BADGE - filter view, not main entity
                    },
                    { 
                        title: 'PWD', href: '/admin/residents?filter=pwd', icon: Heart,
                        description: 'PWD records', 
                        color: 'bg-pink-100 dark:bg-pink-800 text-pink-600 dark:text-pink-400',
                        isActive: (url: string) => url.includes('filter=pwd'),
                        requiredPermission: 'view-residents',
                        // ❌ REMOVE BADGE - filter view, not main entity
                    },
                ],
            },
            {
                title: 'Services',
                icon: FileText,
                items: [
                    { 
                        title: 'Forms', href: '/admin/forms', icon: FileText,
                        description: 'Downloadable forms', 
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url.startsWith('/admin/forms') && !url.includes('/create'),
                        requiredPermission: 'manage-forms',
                        // ❌ REMOVE BADGE - not critical
                    },
                    { 
                        title: 'Privileges', href: '/admin/privileges', icon: Award,
                        description: 'Manage resident privileges & discounts', 
                        color: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
                        isActive: (url: string) => url.startsWith('/admin/privileges') && !url.includes('/create'),
                        requiredPermission: 'manage-privileges',
                        // ❌ REMOVE BADGE - configuration item
                    },
                    { 
                        title: 'Announcements', href: '/admin/announcements', icon: Megaphone,
                        description: 'Public announcements', 
                        color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
                        isActive: (url: string) => url.startsWith('/admin/announcements') && !url.includes('/create'),
                        requiredPermission: 'view-announcements',
                        // ✅ KEEP BADGE - shows active count
                        badge: formatNumber(serviceStats.active_announcements),
                        badgeColor: 'info'
                    },
                    { 
                        title: 'Clearances', href: '/admin/clearances', icon: CheckCircle,
                        description: 'Barangay clearances', 
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) => url.startsWith('/admin/clearances') && !url.startsWith('/admin/clearances/approval') && !url.includes('/create'),
                        requiredPermission: 'view-clearances',
                        // ✅ KEEP BADGE - informative
                        badge: formatNumber(serviceStats.total_clearances),
                        badgeColor: 'success'
                    },
                    { 
                        title: 'Approval Requests', href: '/admin/clearances/approval/requests', icon: CheckCircle,
                        description: 'Review clearance requests', 
                        color: 'bg-violet-100 dark:bg-violet-800 text-violet-600 dark:text-violet-400',
                        isActive: (url: string) => url.startsWith('/admin/clearances/approval'),
                        requiredPermission: 'issue-clearances',
                        // ✅ KEEP BADGE - actionable!
                        badge: formatNumber(reportStats.pending_clearances),
                        badgeColor: getBadgeColor(reportStats.pending_clearances > 0, 'destructive', 'default'),
                        isNew: true 
                    },
                ],
            },
            {
                title: 'Payments',
                icon: CreditCard,
                items: [
                    { 
                        title: 'Fees', href: '/admin/fees', icon: DollarSign,
                        description: 'Manage fees', 
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) => url.startsWith('/admin/fees') && !url.includes('/create'),
                        requiredPermission: 'view-fees',
                        // ❌ REMOVE BADGE - configuration item
                    },
                    { 
                        title: 'Payments', href: '/admin/payments', icon: CreditCard,
                        description: 'Payment records', 
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url.startsWith('/admin/payments') && !url.includes('/create'),
                        requiredPermission: 'view-payments',
                        // ✅ KEEP BADGE - informative
                        badge: formatNumber(paymentStats.total_payments),
                        badgeColor: 'info'
                    },
                    { 
                        title: 'Pending Payments', href: '/admin/payments?status=pending', icon: Clock,
                        description: 'Awaiting payment', 
                        color: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-400',
                        isActive: (url: string) => url.includes('status=pending'),
                        requiredPermission: 'view-payments',
                        // ✅ KEEP BADGE - actionable!
                        badge: formatNumber(paymentStats.pending_payments),
                        badgeColor: getBadgeColor(paymentStats.pending_payments > 0, 'warning', 'default'),
                    },
                    { 
                        title: 'Receipts', href: '/admin/receipts', icon: Receipt,
                        description: 'Generate receipts', 
                        color: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
                        isActive: (url: string) => url.startsWith('/admin/receipts'),
                        requiredPermission: 'manage-payments' 
                        // ❌ REMOVE BADGE - action, not list
                    },
                ],
            },
            {
                title: 'Reports',
                icon: BarChart3,
                items: [
                    { 
                        title: 'Collections', href: '/admin/reports/collections', icon: FileText,
                        description: 'Payment collections', 
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) => url === '/admin/reports/collections',
                        requiredPermission: 'view-reports',
                        // ✅ KEEP BADGE - KPI
                        badge: formatCurrency(paymentStats.total_revenue),
                        badgeColor: 'success'
                    },
                    { 
                        title: 'Revenue', href: '/admin/reports/revenue', icon: BarChart3,
                        description: 'Revenue analytics', 
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url === '/admin/reports/revenue',
                        requiredPermission: 'view-reports',
                        // ✅ KEEP BADGE - KPI
                        badge: formatCurrency(paymentStats.monthly_collections),
                        badgeColor: 'info'
                    },
                ],
            },
        ];

        return allCategories
            .map((category) => ({ ...category, items: category.items.filter((item) => hasPermission(item.requiredPermission)) }))
            .filter((category) => category.items.length > 0);
    }, [userPermissions, userRoleName, reportStats, residentStats, paymentStats, serviceStats]);

    const settingsCategories = useMemo(() => {
        const allCategories: SidebarCategory[] = [
            {
                title: 'Personal',
                icon: UserCog,
                items: [
                    { 
                        title: 'Profile', href: '/admin/settings/profile', icon: User,
                        description: 'Personal info', 
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url === '/admin/settings/profile',
                        requiredPermission: undefined 
                    },
                ],
            },
            {
                title: 'Barangay',
                icon: Building2,
                items: [
                    { 
                        title: 'Puroks', href: '/admin/puroks', icon: Briefcase,
                        description: 'Manage zones', 
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url.startsWith('/admin/puroks') && !url.includes('/create'),
                        requiredPermission: 'manage-puroks',
                        // ❌ REMOVE BADGE - configuration
                    },
                    { 
                        title: 'Positions', href: '/admin/positions', icon: Briefcase,
                        description: 'Official roles', 
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) => url.startsWith('/admin/positions') && !url.includes('/create'),
                        requiredPermission: 'manage-positions',
                        // ❌ REMOVE BADGE - configuration
                    },
                    { 
                        title: 'Committees', href: '/admin/committees', icon: Users2,
                        description: 'Barangay committees', 
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url.startsWith('/admin/committees') && !url.includes('/create'),
                        requiredPermission: 'manage-committees',
                        // ❌ REMOVE BADGE - configuration
                    },
                    { 
                        title: 'Officials', href: '/admin/officials', icon: Award,
                        description: 'Manage officials', 
                        color: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
                        isActive: (url: string) => url.startsWith('/admin/officials') && !url.includes('/create'),
                        requiredPermission: 'manage-officials',
                        // ❌ REMOVE BADGE - configuration
                    },
                ],
            },
            {
                title: 'Users & Roles',
                icon: Users,
                items: [
                    { 
                        title: 'Users', href: '/admin/users', icon: Users,
                        description: 'Manage users', 
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url.startsWith('/admin/users') && !url.includes('/create'),
                        requiredPermission: 'manage-users',
                        // ✅ KEEP BADGE - admin needs user count
                        badge: formatNumber(systemStats.total_users),
                        badgeColor: 'default'
                    },
                    { 
                        title: 'Roles', href: '/admin/roles', icon: Shield,
                        description: 'Manage roles', 
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url.startsWith('/admin/roles') && !url.includes('/create'),
                        requiredPermission: 'manage-roles',
                        // ❌ REMOVE BADGE - configuration
                    },
                    { 
                        title: 'Permissions', href: '/admin/permissions', icon: Key,
                        description: 'Manage permissions', 
                        color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
                        isActive: (url: string) => url.startsWith('/admin/permissions') && !url.includes('/create'),
                        requiredPermission: 'manage-permissions',
                        // ❌ REMOVE BADGE - configuration
                    },
                    { 
                        title: 'Assign Permissions', href: '/admin/role-permissions', icon: LinkIcon,
                        description: 'Assign permissions to roles', 
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) => url.startsWith('/admin/role-permissions'),
                        requiredPermission: 'manage-permissions', 
                        isNew: true 
                    },
                ],
            },
            {
                title: 'Security',
                icon: ShieldCheck,
                items: [
                    { 
                        title: 'Security Audit', href: '/admin/security/security-audit', icon: ShieldCheck,
                        description: 'Compliance reports', 
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url === '/admin/security/security-audit',
                        requiredPermission: 'view-security-logs',
                        // ❌ REMOVE BADGE - logs are informational
                    },
                    { 
                        title: 'Access Logs', href: '/admin/security/access-logs', icon: Eye,
                        description: 'Access monitoring', 
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) => url === '/admin/security/access-logs',
                        requiredPermission: 'view-security-logs',
                        // ❌ REMOVE BADGE - logs are informational
                    },
                    { 
                        title: 'Audit Logs', href: '/admin/reports/audit-logs', icon: History,
                        description: 'Compliance audit trail', 
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url === '/admin/reports/audit-logs',
                        requiredPermission: 'view-reports',
                        // ❌ REMOVE BADGE - logs are informational
                    },
                    { 
                        title: 'Activity Logs', href: '/admin/reports/activity-logs', icon: Activity,
                        description: 'System activities', 
                        color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
                        isActive: (url: string) => url.startsWith('/admin/reports/activity-logs'),
                        requiredPermission: 'view-reports',
                        // ❌ REMOVE BADGE - logs are informational
                    },
                    { 
                        title: 'Login Logs', href: '/admin/reports/login-logs', icon: LogIn,
                        description: 'Authentication history', 
                        color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
                        isActive: (url: string) => url.startsWith('/admin/reports/login-logs'),
                        requiredPermission: 'view-reports',
                        // ❌ REMOVE BADGE - logs are informational
                    },
                    { 
                        title: 'Sessions', href: '/admin/security/sessions', icon: Monitor,
                        description: 'Active sessions', 
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url === '/admin/security/sessions',
                        requiredPermission: 'view-security-logs',
                        // ✅ KEEP BADGE - actionable if too many sessions
                        badge: formatNumber(securityStats.active_sessions),
                        badgeColor: getBadgeColor(securityStats.active_sessions > 10, 'warning', 'default'),
                    },
                ],
            },
            {
                title: 'System',
                icon: Server,
                items: [
                    { 
                        title: 'Portal Banner', href: '/admin/banners', icon: Image,
                        description: 'Manage portal banner', 
                        color: 'bg-pink-100 dark:bg-pink-800 text-pink-600 dark:text-pink-400',
                        isActive: (url: string) => url.startsWith('/admin/banners'),
                        requiredPermission: 'manage-portal-banner',
                        // ✅ KEEP BADGE - shows if banner is active
                        badge: systemStats.portal_banner_active ? 'Active' : 'Inactive',
                        badgeColor: systemStats.portal_banner_active ? 'success' : 'default',
                        isNew: true
                    },
                    { 
                        title: 'Backup', href: '/admin/backup', icon: Database,
                        description: 'Backup & restore', 
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url.startsWith('/admin/backup'),
                        requiredPermission: 'manage-backups' 
                    },
                    { 
                        title: 'Clearance Types', href: '/admin/clearance-types', icon: FileType,
                        description: 'Clearance categories', 
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) => url.startsWith('/admin/clearance-types') && !url.includes('/create'),
                        requiredPermission: 'manage-clearance-types',
                        // ❌ REMOVE BADGE - configuration
                    },
                    { 
                        title: 'Fee Types', href: '/admin/fee-types', icon: Tag,
                        description: 'Fee categories', 
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url.startsWith('/admin/fee-types') && !url.includes('/create'),
                        requiredPermission: 'manage-fee-types',
                        // ❌ REMOVE BADGE - configuration
                    },
                    { 
                        title: 'Report Types', href: '/admin/report-types', icon: FileText,
                        description: 'Community report categories', 
                        color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
                        isActive: (url: string) => url.startsWith('/admin/report-types') && !url.includes('/create'),
                        requiredPermission: 'manage-report-types',
                        // ❌ REMOVE BADGE - configuration
                        isNew: true 
                    },
                    { 
                        title: 'Document Types', href: '/admin/document-types', icon: FileBox,
                        description: 'Document categories & requirements', 
                        color: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400',
                        isActive: (url: string) => url.startsWith('/admin/document-types') && !url.includes('/create'),
                        requiredPermission: 'manage-document-types',
                        // ❌ REMOVE BADGE - configuration
                        isNew: true 
                    },
                ],
            },
        ];

        return allCategories
            .map((category) => ({ ...category, items: category.items.filter((item) => hasPermission(item.requiredPermission)) }))
            .filter((category) => category.items.length > 0);
    }, [userPermissions, userRoleName, systemStats, securityStats]);

    // ... rest of the file remains exactly the same (quick actions, etc.)
    const operationsQuickActionGroups = useMemo(() => {
        const groups = {
            reports: [
                { title: 'New Report', href: '/admin/community-reports/community-reports/create', icon: AlertCircle, color: 'orange' as const, requiredPermission: 'create-reports', description: 'Create incident report', isNew: true },
                { title: 'New Blotter', href: '/admin/blotters/create', icon: Scale, color: 'red' as const, requiredPermission: 'manage-blotters', description: 'File new blotter case', isUpdated: true },
            ],
            residents: [
                { title: 'Add Resident', href: '/admin/residents/create', icon: Users, color: 'blue' as const, requiredPermission: 'manage-residents', description: 'Register new resident' },
                { title: 'Add Household', href: '/admin/households/create', icon: Home, color: 'green' as const, requiredPermission: 'manage-households', description: 'Create new household' },
                { title: 'Add Business', href: '/admin/businesses/create', icon: Briefcase, color: 'purple' as const, requiredPermission: 'manage-businesses', description: 'Register new business' },
            ],
            services: [
                { title: 'Issue Clearance', href: '/admin/clearances/create', icon: CheckCircle, color: 'emerald' as const, requiredPermission: 'issue-clearances', description: 'Issue barangay clearance' },
                // { title: 'Approval Requests', href: '/admin/clearances/approval/requests', icon: CheckCircle, color: 'violet' as const, requiredPermission: 'issue-clearances', description: 'Review clearance requests', badge: formatNumber(reportStats.pending_clearances), isNew: true },
                { title: 'Record Payment', href: '/admin/payments/create', icon: CreditCard, color: 'cyan' as const, requiredPermission: 'manage-payments', description: 'Record new payment' },
                { title: 'Create Fee', href: '/admin/fees/create', icon: DollarSign, color: 'yellow' as const, requiredPermission: 'manage-fees', description: 'Add new fee type' },
                { title: 'Upload Form', href: '/admin/forms/create', icon: FileText, color: 'indigo' as const, requiredPermission: 'manage-forms', description: 'Upload new form' },
                { title: 'New Announcement', href: '/admin/announcements/create', icon: Megaphone, color: 'pink' as const, requiredPermission: 'manage-announcements', description: 'Create announcement' },
                { title: 'Add Privilege', href: '/admin/privileges/create', icon: Award, color: 'amber' as const, requiredPermission: 'manage-privileges', description: 'Create new privilege' },
                // { title: 'Assign Privilege', href: '/admin/privileges/assign', icon: UserCheck, color: 'violet' as const, requiredPermission: 'assign-privileges', description: 'Assign privilege to resident', isNew: true },
            ],
        };

        return {
            reports: groups.reports.filter(a => hasPermission(a.requiredPermission)),
            residents: groups.residents.filter(a => hasPermission(a.requiredPermission)),
            services: groups.services.filter(a => hasPermission(a.requiredPermission)),
        };
    }, [userPermissions, userRoleName, reportStats]);

    const settingsQuickActionGroups = useMemo(() => {
        const groups = {
            personal: [
                { title: 'Edit Profile', href: '/admin/settings/profile', icon: User, color: 'blue' as const, requiredPermission: undefined, description: 'Update personal info' },
                { title: 'Change Password', href: '/admin/settings/password', icon: Lock, color: 'red' as const, requiredPermission: undefined, description: 'Update password' },
                { title: 'Customize Theme', href: '/admin/settings/appearance', icon: Palette, color: 'purple' as const, requiredPermission: undefined, description: 'Change appearance' },
            ],
            barangay: [
                { title: 'Add Purok', href: '/admin/puroks/create', icon: Briefcase, color: 'violet' as const, requiredPermission: 'manage-puroks', description: 'Create new purok' },
                { title: 'Add Position', href: '/admin/positions/create', icon: Briefcase, color: 'teal' as const, requiredPermission: 'manage-positions', description: 'Create new position' },
                { title: 'New Committee', href: '/admin/committees/create', icon: Users2, color: 'lime' as const, requiredPermission: 'manage-committees', description: 'Create committee' },
                { title: 'Add Official', href: '/admin/officials/create', icon: Award, color: 'amber' as const, requiredPermission: 'manage-officials', description: 'Add barangay official' },
            ],
            users: [
                { title: 'Add User', href: '/admin/users/create', icon: Users, color: 'indigo' as const, requiredPermission: 'manage-users', description: 'Create new user' },
                { title: 'Add Role', href: '/admin/roles/create', icon: Shield, color: 'purple' as const, requiredPermission: 'manage-roles', description: 'Create new role' },
                { title: 'Add Permission', href: '/admin/permissions/create', icon: Key, color: 'red' as const, requiredPermission: 'manage-permissions', description: 'Create new permission' },
            ],
            system: [
                { title: 'Manage Portal Banner', href: '/admin/banners', icon: Image, color: 'pink' as const, requiredPermission: 'manage-portal-banner', description: 'Update portal banner', isNew: true },
                { title: 'Run Backup', href: '/admin/backup', icon: Database, color: 'blue' as const, requiredPermission: 'manage-backups', description: 'Create system backup' },
                { title: 'Add Clearance Type', href: '/admin/clearance-types/create', icon: FileType, color: 'emerald' as const, requiredPermission: 'manage-clearance-types', description: 'Create clearance type' },
                { title: 'Add Fee Type', href: '/admin/fee-types/create', icon: Tag, color: 'yellow' as const, requiredPermission: 'manage-fee-types', description: 'Create fee type' },
                { title: 'Add Report Type', href: '/admin/report-types/create', icon: FileText, color: 'orange' as const, requiredPermission: 'manage-report-types', description: 'Create report type', isNew: true },
                { title: 'Add Document Type', href: '/admin/document-types/create', icon: FileBox, color: 'indigo' as const, requiredPermission: 'manage-document-types', description: 'Create document type', isNew: true },
            ],
            security: [
                { title: 'View Audit Logs', href: '/admin/reports/audit-logs', icon: History, color: 'purple' as const, requiredPermission: 'view-reports', description: 'Check audit trail' },
                { title: 'View Activity Logs', href: '/admin/reports/activity-logs', icon: Activity, color: 'orange' as const, requiredPermission: 'view-reports', description: 'Monitor activities' },
                { title: 'View Sessions', href: '/admin/security/sessions', icon: Monitor, color: 'cyan' as const, requiredPermission: 'view-security-logs', description: 'Active sessions' },
            ],
        };

        return {
            personal: groups.personal.filter(a => hasPermission(a.requiredPermission)),
            barangay: groups.barangay.filter(a => hasPermission(a.requiredPermission)),
            users: groups.users.filter(a => hasPermission(a.requiredPermission)),
            system: groups.system.filter(a => hasPermission(a.requiredPermission)),
            security: groups.security.filter(a => hasPermission(a.requiredPermission)),
        };
    }, [userPermissions, userRoleName]);

    const mainOperationsQuickActions = useMemo(() => {
        return [
            ...operationsQuickActionGroups.reports.slice(0, 2),
            ...operationsQuickActionGroups.residents.slice(0, 1),
            ...operationsQuickActionGroups.services.slice(0, 2),
        ].slice(0, 5);
    }, [operationsQuickActionGroups]);

    const mainSettingsQuickActions = useMemo(() => {
        return [
            ...settingsQuickActionGroups.personal.slice(0, 1),
            ...settingsQuickActionGroups.barangay.slice(0, 1),
            ...settingsQuickActionGroups.users.slice(0, 1),
            ...settingsQuickActionGroups.system.slice(0, 1),
            ...settingsQuickActionGroups.security.slice(0, 1),
        ].slice(0, 5);
    }, [settingsQuickActionGroups]);

    const remainingOperationsActions = useMemo(() => {
        const mainActionHrefs = new Set(mainOperationsQuickActions.map(a => a.href));
        const allOperationsActions = [
            ...operationsQuickActionGroups.reports,
            ...operationsQuickActionGroups.residents,
            ...operationsQuickActionGroups.services,
        ];
        return allOperationsActions.filter(action => !mainActionHrefs.has(action.href));
    }, [operationsQuickActionGroups, mainOperationsQuickActions]);

    const remainingSettingsActions = useMemo(() => {
        const mainActionHrefs = new Set(mainSettingsQuickActions.map(a => a.href));
        const allSettingsActions = [
            ...settingsQuickActionGroups.personal,
            ...settingsQuickActionGroups.barangay,
            ...settingsQuickActionGroups.users,
            ...settingsQuickActionGroups.system,
            ...settingsQuickActionGroups.security,
        ];
        return allSettingsActions.filter(action => !mainActionHrefs.has(action.href));
    }, [settingsQuickActionGroups, mainSettingsQuickActions]);

    const remainingOperationsByCategory = useMemo(() => {
        const grouped = {
            reports: remainingOperationsActions.filter(action => operationsQuickActionGroups.reports.some(r => r.href === action.href)),
            residents: remainingOperationsActions.filter(action => operationsQuickActionGroups.residents.some(r => r.href === action.href)),
            services: remainingOperationsActions.filter(action => operationsQuickActionGroups.services.some(s => s.href === action.href)),
        };
        return Object.entries(grouped).filter(([_, items]) => items.length > 0);
    }, [remainingOperationsActions, operationsQuickActionGroups]);

    const remainingSettingsByCategory = useMemo(() => {
        const grouped = {
            personal: remainingSettingsActions.filter(action => settingsQuickActionGroups.personal.some(p => p.href === action.href)),
            barangay: remainingSettingsActions.filter(action => settingsQuickActionGroups.barangay.some(b => b.href === action.href)),
            users: remainingSettingsActions.filter(action => settingsQuickActionGroups.users.some(u => u.href === action.href)),
            system: remainingSettingsActions.filter(action => settingsQuickActionGroups.system.some(s => s.href === action.href)),
            security: remainingSettingsActions.filter(action => settingsQuickActionGroups.security.some(s => s.href === action.href)),
        };
        return Object.entries(grouped).filter(([_, items]) => items.length > 0);
    }, [remainingSettingsActions, settingsQuickActionGroups]);

    const hasAnyAccess = operationsCategories.length > 0 || settingsCategories.length > 0;

    const summaryCounts = {
        totalReports: formatNumber(reportStats.total) as number,
        pendingReports: formatNumber(reportStats.pending) as number,
        totalBlotters: formatNumber(reportStats.blotters) as number,
        totalResidents: formatNumber(residentStats.total) as number,
        totalHouseholds: formatNumber(residentStats.households) as number,
        totalBusinesses: formatNumber(residentStats.businesses) as number,
        pendingClearances: formatNumber(reportStats.pending_clearances) as number,
        totalClearances: formatNumber(serviceStats.total_clearances) as number,
        totalPayments: formatNumber(paymentStats.total_payments) as number,
        pendingPayments: formatNumber(paymentStats.pending_payments) as number,
        totalRevenue: formatNumber(paymentStats.total_revenue) as number,
        totalUsers: formatNumber(systemStats.total_users) as number,
        totalPuroks: formatNumber(systemStats.total_puroks) as number,
        totalOfficials: formatNumber(systemStats.total_officials) as number,
    };

    return {
        operationsCategories,
        settingsCategories,
        mainOperationsQuickActions,
        remainingOperationsByCategory,
        remainingOperationsActions,
        mainSettingsQuickActions,
        remainingSettingsByCategory,
        remainingSettingsActions,
        hasAnyAccess,
        summaryCounts,
        reportStats,
        residentStats,
        paymentStats,
        serviceStats,
        systemStats,
        securityStats,
    };
}
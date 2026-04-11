import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import {
    LayoutGrid, AlertCircle, Clock, UserCheck, Scale, Users, Home, Briefcase,
    FileText, Award, Megaphone, CheckCircle, CreditCard, DollarSign, Receipt,
    BarChart3, Building2, Shield, Key, Link as LinkIcon, ShieldCheck, History,
    Activity, LogIn, Monitor, Server, Database, FileType, Tag, FileBox, UserCog,
    User, Lock, Palette, Users2, PlusCircle, FolderOpen, Zap,
    Eye
} from 'lucide-react';
import { SidebarCategory, QuickAction } from './types';

export function useSidebarData() {
    const { props } = usePage() as any;
    const user = props?.auth?.user || {};
    const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const userRoleName = user?.role_name || user?.role?.name || '';
    const reportStats = props?.reportStats || { total: 0, pending: 0, community_reports: 0, blotters: 0, today: 0, under_review: 0, assigned: 0, in_progress: 0, resolved: 0, rejected: 0, high_priority: 0, pending_clearances: 0 };

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
                    description: 'System overview', color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                    isActive: (url: string) => url === '/admin/dashboard' || url === '/admin',
                    requiredPermission: 'view-dashboard',
                }],
            },
            {
                title: 'Incident Management',
                icon: AlertCircle,
                items: [
                    { title: 'All Reports', href: '/admin/community-reports', icon: FolderOpen, description: 'Community reports', color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400', isActive: (url: string) => url.startsWith('/admin/community-reports') && !url.includes('/create'), requiredPermission: 'view-reports', badge: reportStats.total },
                    { title: 'Pending Review', href: '/admin/community-reports?status=pending', icon: AlertCircle, description: 'Needs attention', color: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-400', isActive: (url: string) => url.includes('status=pending'), requiredPermission: 'review-reports', badge: reportStats.pending },
                    { title: 'In Progress', href: '/admin/community-reports?status=in_progress', icon: Clock, description: 'Being processed', color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400', isActive: (url: string) => url.includes('status=in_progress'), requiredPermission: 'view-reports', badge: reportStats.in_progress },
                    { title: 'Assigned', href: '/admin/community-reports?status=assigned', icon: UserCheck, description: 'Assigned to staff', color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400', isActive: (url: string) => url.includes('status=assigned'), requiredPermission: 'view-reports', badge: reportStats.assigned },
                    { title: 'Blotters', href: '/admin/blotters', icon: Scale, description: 'Mediation cases', color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400', isActive: (url: string) => url.startsWith('/admin/blotters') && !url.includes('/create'), requiredPermission: 'manage-blotters', badge: reportStats.blotters, isUpdated: true },
                ],
            },
            {
                title: 'Residents',
                icon: Users,
                items: [
                    { title: 'All Residents', href: '/admin/residents', icon: Users, description: 'Manage residents', color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400', isActive: (url: string) => url.startsWith('/admin/residents') && !url.includes('/create'), requiredPermission: 'manage-residents' },
                    { title: 'Households', href: '/admin/households', icon: Home, description: 'Manage households', color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400', isActive: (url: string) => url.startsWith('/admin/households') && !url.includes('/create'), requiredPermission: 'manage-households' },
                    { title: 'Businesses', href: '/admin/businesses', icon: Briefcase, description: 'Manage businesses', color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400', isActive: (url: string) => url.startsWith('/admin/businesses') && !url.includes('/create'), requiredPermission: 'manage-businesses' },
                ],
            },
            {
                title: 'Services',
                icon: FileText,
                items: [
                    { title: 'Forms', href: '/admin/forms', icon: FileText, description: 'Downloadable forms', color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400', isActive: (url: string) => url.startsWith('/admin/forms') && !url.includes('/create'), requiredPermission: 'manage-forms' },
                    { title: 'Privileges', href: '/admin/privileges', icon: Award, description: 'Manage resident privileges & discounts', color: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400', isActive: (url: string) => url.startsWith('/admin/privileges') && !url.includes('/create'), requiredPermission: 'manage-privileges' },
                    { title: 'Announcements', href: '/admin/announcements', icon: Megaphone, description: 'Public announcements', color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400', isActive: (url: string) => url.startsWith('/admin/announcements') && !url.includes('/create'), requiredPermission: 'view-announcements' },
                    { title: 'Clearances', href: '/admin/clearances', icon: CheckCircle, description: 'Barangay clearances', color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400', isActive: (url: string) => url.startsWith('/admin/clearances') && !url.startsWith('/admin/clearances/approval') && !url.includes('/create'), requiredPermission: 'view-clearances' },
                    { title: 'Approval Requests', href: '/admin/clearances/approval/requests', icon: CheckCircle, description: 'Review clearance requests', color: 'bg-violet-100 dark:bg-violet-800 text-violet-600 dark:text-violet-400', isActive: (url: string) => url.startsWith('/admin/clearances/approval'), requiredPermission: 'issue-clearances', badge: reportStats.pending_clearances || 0, isNew: true },
                ],
            },
            {
                title: 'Payments',
                icon: CreditCard,
                items: [
                    { title: 'Fees', href: '/admin/fees', icon: DollarSign, description: 'Manage fees', color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400', isActive: (url: string) => url.startsWith('/admin/fees') && !url.includes('/create'), requiredPermission: 'view-fees' },
                    { title: 'Payments', href: '/admin/payments', icon: CreditCard, description: 'Payment records', color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400', isActive: (url: string) => url.startsWith('/admin/payments') && !url.includes('/create'), requiredPermission: 'view-payments' },
                    { title: 'Receipts', href: '/admin/receipts', icon: Receipt, description: 'Generate receipts', color: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400', isActive: (url: string) => url.startsWith('/admin/receipts'), requiredPermission: 'manage-payments' },
                ],
            },
            {
                title: 'Reports',
                icon: BarChart3,
                items: [
                    { title: 'Collections', href: '/admin/reports/collections', icon: FileText, description: 'Payment collections', color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400', isActive: (url: string) => url === '/admin/reports/collections', requiredPermission: 'view-reports' },
                    { title: 'Revenue', href: '/admin/reports/revenue', icon: BarChart3, description: 'Revenue analytics', color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400', isActive: (url: string) => url === '/admin/reports/revenue', requiredPermission: 'view-reports' },
                ],
            },
        ];

        return allCategories
            .map((category) => ({ ...category, items: category.items.filter((item) => hasPermission(item.requiredPermission)) }))
            .filter((category) => category.items.length > 0);
    }, [userPermissions, userRoleName, reportStats]);

    const settingsCategories = useMemo(() => {
        const allCategories: SidebarCategory[] = [
            {
                title: 'Personal',
                icon: UserCog,
                items: [
                    { title: 'Profile', href: '/admin/settings/profile', icon: User, description: 'Personal info', color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400', isActive: (url: string) => url === '/admin/settings/profile', requiredPermission: undefined },
                ],
            },
            {
                title: 'Barangay',
                icon: Building2,
                items: [
                    { title: 'Puroks', href: '/admin/puroks', icon: Briefcase, description: 'Manage zones', color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400', isActive: (url: string) => url.startsWith('/admin/puroks') && !url.includes('/create'), requiredPermission: 'manage-puroks' },
                    { title: 'Positions', href: '/admin/positions', icon: Briefcase, description: 'Official roles', color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400', isActive: (url: string) => url.startsWith('/admin/positions') && !url.includes('/create'), requiredPermission: 'manage-positions' },
                    { title: 'Committees', href: '/admin/committees', icon: Users2, description: 'Barangay committees', color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400', isActive: (url: string) => url.startsWith('/admin/committees') && !url.includes('/create'), requiredPermission: 'manage-committees' },
                    { title: 'Officials', href: '/admin/officials', icon: Award, description: 'Manage officials', color: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400', isActive: (url: string) => url.startsWith('/admin/officials') && !url.includes('/create'), requiredPermission: 'manage-officials' },
                ],
            },
            {
                title: 'Users & Roles',
                icon: Users,
                items: [
                    { title: 'Users', href: '/admin/users', icon: Users, description: 'Manage users', color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400', isActive: (url: string) => url.startsWith('/admin/users') && !url.includes('/create'), requiredPermission: 'manage-users' },
                    { title: 'Roles', href: '/admin/roles', icon: Shield, description: 'Manage roles', color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400', isActive: (url: string) => url.startsWith('/admin/roles') && !url.includes('/create'), requiredPermission: 'manage-roles' },
                    { title: 'Permissions', href: '/admin/permissions', icon: Key, description: 'Manage permissions', color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400', isActive: (url: string) => url.startsWith('/admin/permissions') && !url.includes('/create'), requiredPermission: 'manage-permissions' },
                    { title: 'Assign Permissions', href: '/admin/role-permissions', icon: LinkIcon, description: 'Assign permissions to roles', color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400', isActive: (url: string) => url.startsWith('/admin/role-permissions'), requiredPermission: 'manage-permissions', isNew: true },
                ],
            },
            {
                title: 'Security',
                icon: ShieldCheck,
                items: [
                    { title: 'Security Audit', href: '/admin/security/security-audit', icon: ShieldCheck, description: 'Compliance reports', color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400', isActive: (url: string) => url === '/admin/security/security-audit', requiredPermission: 'view-security-logs' },
                    { title: 'Access Logs', href: '/admin/security/access-logs', icon: Eye, description: 'Access monitoring', color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400', isActive: (url: string) => url === '/admin/security/access-logs', requiredPermission: 'view-security-logs' },
                    { title: 'Audit Logs', href: '/admin/reports/audit-logs', icon: History, description: 'Compliance audit trail', color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400', isActive: (url: string) => url === '/admin/reports/audit-logs', requiredPermission: 'view-reports' },
                    { title: 'Activity Logs', href: '/admin/reports/activity-logs', icon: Activity, description: 'System activities', color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400', isActive: (url: string) => url.startsWith('/admin/reports/activity-logs'), requiredPermission: 'view-reports' },
                    { title: 'Login Logs', href: '/admin/reports/login-logs', icon: LogIn, description: 'Authentication history', color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400', isActive: (url: string) => url.startsWith('/admin/reports/login-logs'), requiredPermission: 'view-reports' },
                    { title: 'Sessions', href: '/admin/security/sessions', icon: Monitor, description: 'Active sessions', color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400', isActive: (url: string) => url === '/admin/security/sessions', requiredPermission: 'view-security-logs' },
                ],
            },
            {
                title: 'System',
                icon: Server,
                items: [
                    { title: 'Backup', href: '/admin/backup', icon: Database, description: 'Backup & restore', color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400', isActive: (url: string) => url.startsWith('/admin/backup'), requiredPermission: 'manage-backups' },
                    { title: 'Clearance Types', href: '/admin/clearance-types', icon: FileType, description: 'Clearance categories', color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400', isActive: (url: string) => url.startsWith('/admin/clearance-types') && !url.includes('/create'), requiredPermission: 'manage-clearance-types' },
                    { title: 'Fee Types', href: '/admin/fee-types', icon: Tag, description: 'Fee categories', color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400', isActive: (url: string) => url.startsWith('/admin/fee-types') && !url.includes('/create'), requiredPermission: 'manage-fee-types' },
                    { title: 'Report Types', href: '/admin/report-types', icon: FileText, description: 'Community report categories', color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400', isActive: (url: string) => url.startsWith('/admin/report-types') && !url.includes('/create'), requiredPermission: 'manage-report-types', isNew: true },
                    { title: 'Document Types', href: '/admin/document-types', icon: FileBox, description: 'Document categories & requirements', color: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400', isActive: (url: string) => url.startsWith('/admin/document-types') && !url.includes('/create'), requiredPermission: 'manage-document-types', isNew: true },
                ],
            },
        ];

        return allCategories
            .map((category) => ({ ...category, items: category.items.filter((item) => hasPermission(item.requiredPermission)) }))
            .filter((category) => category.items.length > 0);
    }, [userPermissions, userRoleName]);

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
                { title: 'Issue Clearance', href: '/admin/clearances/clearances/create', icon: CheckCircle, color: 'emerald' as const, requiredPermission: 'issue-clearances', description: 'Issue barangay clearance' },
                { title: 'Approval Requests', href: '/admin/clearances/approval/requests', icon: CheckCircle, color: 'violet' as const, requiredPermission: 'issue-clearances', description: 'Review clearance requests', badge: reportStats.pending_clearances || 0, isNew: true },
                { title: 'Record Payment', href: '/admin/payments/payments/create', icon: CreditCard, color: 'cyan' as const, requiredPermission: 'manage-payments', description: 'Record new payment' },
                { title: 'Create Fee', href: '/admin/fees/fees/create', icon: DollarSign, color: 'yellow' as const, requiredPermission: 'manage-fees', description: 'Add new fee type' },
                { title: 'Upload Form', href: '/admin/forms/create', icon: FileText, color: 'indigo' as const, requiredPermission: 'manage-forms', description: 'Upload new form' },
                { title: 'New Announcement', href: '/admin/announcements/create', icon: Megaphone, color: 'pink' as const, requiredPermission: 'manage-announcements', description: 'Create announcement' },
                { title: 'Add Privilege', href: '/admin/privileges/create', icon: Award, color: 'amber' as const, requiredPermission: 'manage-privileges', description: 'Create new privilege' },
                { title: 'Assign Privilege', href: '/admin/privileges/assign', icon: UserCheck, color: 'violet' as const, requiredPermission: 'assign-privileges', description: 'Assign privilege to resident', isNew: true },
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
    };
}
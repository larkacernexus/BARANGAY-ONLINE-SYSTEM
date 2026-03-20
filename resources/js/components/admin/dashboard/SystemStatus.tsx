import { Link } from '@inertiajs/react';
import { 
    Wifi, Database, HardDrive, Archive, FileText, 
    DownloadCloud, CreditCard, Activity, Globe 
} from 'lucide-react';
import type { SystemStatus as SystemStatusType } from '@/components/admin/dashboard/types/dashboard';

interface SystemStatusProps {
    statuses: SystemStatusType[];
    storageUsage: {
        percentage: number;
        usedPrecise: string;
        total: string;
        database: number;
        files: number;
        backups: number;
        logs: number;
        details: {
            tableCount: number;
            totalRows: number;
            residentCount: number;
            householdCount: number;
            paymentCount: number;
            clearanceCount: number;
        };
        backupStatus: {
            lastBackup: string;
            backupSize: string;
        };
        topTables: Array<[string, { size_kb: number; rows: number }]>;
    };
    autoRefresh: boolean;
    onAutoRefreshToggle: () => void;
}

export function SystemStatus({ 
    statuses = [], // Default to empty array
    storageUsage, 
    autoRefresh, 
    onAutoRefreshToggle 
}: SystemStatusProps) {
    // Ensure statuses is an array
    const safeStatuses = Array.isArray(statuses) ? statuses : [];
    
    // Ensure storageUsage has default values
    const safeStorageUsage = storageUsage || {
        percentage: 0,
        usedPrecise: '0 KB',
        total: '0 MB',
        database: 0,
        files: 0,
        backups: 0,
        logs: 0,
        details: {
            tableCount: 0,
            totalRows: 0,
            residentCount: 0,
            householdCount: 0,
            paymentCount: 0,
            clearanceCount: 0,
        },
        backupStatus: {
            lastBackup: 'Never',
            backupSize: '0 MB',
        },
        topTables: []
    };

    const getStatusColor = (status: SystemStatusType['status'] = 'offline') => {
        switch(status) {
            case 'online': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'warning': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            case 'offline': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
            case 'maintenance': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    const getSystemStatusIcon = (service: string) => {
        switch(service) {
            case 'Database': return Database;
            case 'Payment System': return CreditCard;
            case 'Clearance System': return FileText;
            case 'User Activity': return Activity;
            case 'Backup System': return HardDrive;
            case 'API Services': return Globe;
            default: return Activity;
        }
    };

    const renderTopTables = () => {
        if (!safeStorageUsage.topTables || safeStorageUsage.topTables.length === 0) {
            return null;
        }
        
        return (
            <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Top Tables by Size</h4>
                <div className="space-y-2">
                    {safeStorageUsage.topTables.map((tableEntry, index) => {
                        // Safely handle table entry
                        if (!tableEntry || !Array.isArray(tableEntry) || tableEntry.length < 2) {
                            return null;
                        }
                        
                        const [tableName, tableData] = tableEntry;
                        
                        // Safely handle table data
                        const sizeKb = tableData?.size_kb ? Number(tableData.size_kb) || 0 : 0;
                        const rows = tableData?.rows ? Number(tableData.rows) || 0 : 0;
                        
                        return (
                            <div key={tableName || `table-${index}`} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        {index + 1}.
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                                        {tableName ? tableName.replace(/_/g, ' ') : 'Unknown'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {sizeKb.toFixed(1)} KB
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                        ({rows.toLocaleString()} rows)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Early return if no statuses
    if (safeStatuses.length === 0) {
        return (
            <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            System Status
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Real-time service monitoring
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wifi className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">
                            Loading...
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-center py-8">
                    <p className="text-gray-500">System status data is loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        System Status
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Real-time service monitoring
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        All systems operational
                    </span>
                </div>
            </div>
            
            <div className="space-y-4">
                {safeStatuses.slice(0, 4).map((status, index) => {
                    // Skip if status is undefined
                    if (!status) return null;
                    
                    const Icon = getSystemStatusIcon(status.service || 'Unknown');
                    const statusValue = status.status || 'offline';
                    
                    return (
                        <div 
                            key={status.service || `status-${index}`}
                            className="flex items-center justify-between rounded-lg border border-sidebar-border/70 p-3 dark:border-sidebar-border"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`rounded-lg p-2 ${
                                    statusValue === 'online' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                    statusValue === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                    'bg-rose-100 dark:bg-rose-900/30'
                                }`}>
                                    <Icon className={`h-4 w-4 ${
                                        statusValue === 'online' ? 'text-emerald-600 dark:text-emerald-400' :
                                        statusValue === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                                        'text-rose-600 dark:text-rose-400'
                                    }`} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {status.service || 'Unknown Service'}
                                    </p>
                                    {status.details && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {status.details}
                                        </p>
                                    )}
                                    {status.uptime && (
                                        <p className="text-xs text-gray-400">
                                            Uptime: {status.uptime}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(statusValue)}`}>
                                    {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
                                </span>
                                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {status.lastCheck || 'Unknown'}
                                </span>
                                {status.responseTime && status.responseTime !== 'N/A' && (
                                    <span className="text-xs text-gray-400">
                                        {status.responseTime}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Storage Usage</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {safeStorageUsage.details?.tableCount || 0} tables, {(safeStorageUsage.details?.totalRows || 0).toLocaleString()} total rows
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="font-bold text-gray-900 dark:text-white">{safeStorageUsage.percentage}%</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {safeStorageUsage.usedPrecise} / {safeStorageUsage.total}
                        </p>
                    </div>
                </div>
                
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: `${Math.max(1, safeStorageUsage.percentage)}%` }}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Database</p>
                                <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{safeStorageUsage.database}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-purple-600" />
                            <div>
                                <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Files</p>
                                <p className="text-lg font-bold text-purple-800 dark:text-purple-200">{safeStorageUsage.files}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                        <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4 text-amber-600" />
                            <div>
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Backups</p>
                                <p className="text-lg font-bold text-amber-800 dark:text-amber-200">{safeStorageUsage.backups}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-cyan-50 p-3 dark:bg-cyan-900/20">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-cyan-600" />
                            <div>
                                <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300">Logs</p>
                                <p className="text-lg font-bold text-cyan-800 dark:text-cyan-200">{safeStorageUsage.logs}%</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DownloadCloud className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Last Backup</span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {safeStorageUsage.backupStatus?.lastBackup || 'Never'}
                            </span>
                            <p className="text-xs text-gray-500">
                                Size: {safeStorageUsage.backupStatus?.backupSize || '0 MB'}
                            </p>
                        </div>
                    </div>
                </div>
                
                {renderTopTables()}
                
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                        <span>Residents</span>
                        <span className="font-medium text-gray-900 dark:text-white">{(safeStorageUsage.details?.residentCount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                        <span>Households</span>
                        <span className="font-medium text-gray-900 dark:text-white">{(safeStorageUsage.details?.householdCount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                        <span>Payments</span>
                        <span className="font-medium text-gray-900 dark:text-white">{(safeStorageUsage.details?.paymentCount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                        <span>Clearances</span>
                        <span className="font-medium text-gray-900 dark:text-white">{(safeStorageUsage.details?.clearanceCount || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onAutoRefreshToggle}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoRefresh ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <span 
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-5' : 'translate-x-0.5'}`} 
                        />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh (5 min)</span>
                </div>
                <Link 
                    href="/admin/system/status"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                    System Health
                </Link>
            </div>
        </div>
    );
}
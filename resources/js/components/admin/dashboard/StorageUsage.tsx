import { Database, HardDrive, Archive, FileText, DownloadCloud } from 'lucide-react';

interface StorageUsageProps {
    storageUsage: any;
}

export function StorageUsage({ storageUsage }: StorageUsageProps) {
    const renderTopTables = () => {
        if (!storageUsage.topTables || storageUsage.topTables.length === 0) {
            return null;
        }
        
        return (
            <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Top Tables by Size</h4>
                <div className="space-y-2">
                    {storageUsage.topTables.map((tableEntry: any, index: number) => {
                        const [tableName, tableData] = tableEntry as [string, { size_kb: number; rows: number }];
                        
                        const sizeKb = Number(tableData.size_kb) || 0;
                        const rows = Number(tableData.rows) || 0;
                        
                        return (
                            <div key={tableName} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                        {index + 1}.
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                                        {tableName.replace(/_/g, ' ')}
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

    return (
        <>
            {/* Storage Usage - Based on ACTUAL Database Size */}
            <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Storage Usage</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {storageUsage.details.tableCount} tables, {storageUsage.details.totalRows.toLocaleString()} total rows
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="font-bold text-gray-900 dark:text-white">{storageUsage.percentage}%</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {storageUsage.usedPrecise} / {storageUsage.total}
                        </p>
                    </div>
                </div>
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: `${Math.max(1, storageUsage.percentage)}%` }}
                    />
                </div>
                
                {/* Storage Breakdown */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Database</p>
                                <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{storageUsage.database}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-purple-600" />
                            <div>
                                <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Files</p>
                                <p className="text-lg font-bold text-purple-800 dark:text-purple-200">{storageUsage.files}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                        <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4 text-amber-600" />
                            <div>
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Backups</p>
                                <p className="text-lg font-bold text-amber-800 dark:text-amber-200">{storageUsage.backups}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-cyan-50 p-3 dark:bg-cyan-900/20">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-cyan-600" />
                            <div>
                                <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300">Logs</p>
                                <p className="text-lg font-bold text-cyan-800 dark:text-cyan-200">{storageUsage.logs}%</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Backup Status - FIXED with null checks */}
                <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DownloadCloud className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Last Backup</span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {storageUsage.backupStatus?.lastBackup || 'Never'}
                            </span>
                            <p className="text-xs text-gray-500">
                                Size: {storageUsage.backupStatus?.backupSize || '0 MB'}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Top Tables by Size */}
                {renderTopTables()}
                
                {/* Data Statistics */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                        <span>Residents</span>
                        <span className="font-medium text-gray-900 dark:text-white">{storageUsage.details.residentCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                        <span>Households</span>
                        <span className="font-medium text-gray-900 dark:text-white">{storageUsage.details.householdCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                        <span>Payments</span>
                        <span className="font-medium text-gray-900 dark:text-white">{storageUsage.details.paymentCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                        <span>Clearances</span>
                        <span className="font-medium text-gray-900 dark:text-white">{storageUsage.details.clearanceCount.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
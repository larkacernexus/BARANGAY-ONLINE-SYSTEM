// types/admin/backup/backup.ts

import { PageProps as InertiaPageProps } from '@inertiajs/core';

export type BackupType = 'full' | 'database' | 'files';

export interface BackupFile {
    created_by: any;
    id: number;
    filename: string;
    name?: string; 
    size: string;
    size_bytes: number;
    modified: string;
    type: BackupType;
    download_url: string;
    is_protected?: boolean;
    description?: string;
    created_at: string;
    updated_at?: string;
    status?: 'completed' | 'failed' | 'pending' | 'processing';
}

export interface DiskSpaceInfo {
    total: string;
    free: string;
    used: string;
    used_percentage: number;
    total_bytes: number;
    free_bytes: number;
    used_bytes: number;
}

export interface BackupStats {
    total: number;
    full: number;
    database: number;
    files: number;
    recent: number;
    protected: number;
    total_size_bytes: number;
}

export interface BackupFilters {
    search?: string;
    type?: string;
    size?: string;
    from_date?: string;
    to_date?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface PaginatedBackupsResponse {
    data: BackupFile[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    per_page: number;
}

export interface BackupFormData {
    type: BackupType;
    description?: string;
}

export interface BackupResponse {
    success: boolean;
    message: string;
    filename?: string;
    download_url?: string;
}

// Add BackupProgress interface
export interface BackupProgress {
    estimatedTimeRemaining: any;
    percentage: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    message: string;
    currentStep?: string;
    details?: string;
}

// Add BulkOperation type (alias for BulkOperationType or separate)
export type BulkOperation = 
    | 'delete'
    | 'restore'
    | 'export'
    | 'protect'
    | 'unprotect'
    | 'copy_data'
    | 'download'
    | 'print'
    | 'exit';

export type BulkOperationType = 
    | 'delete'
    | 'restore'
    | 'export'
    | 'protect'
    | 'unprotect'
    | 'copy_data';

export type SelectionMode = 'page' | 'filtered' | 'all';

export interface SelectionStats {
    total: number;
    total_size: string;
    total_size_bytes: number;
    formattedSize: string;
    protectedCount: number;
    largestSize: number;
    fullCount: number;
    databaseCount: number;
    filesCount: number;
    types: Record<BackupType, number>;
    oldest_date: string | null;
    newest_date: string | null;
}

// Extend Inertia PageProps with index signature
export interface PageProps extends InertiaPageProps {
    backups: PaginatedBackupsResponse;
    diskSpace: DiskSpaceInfo;
    lastBackup: string | null;
    stats: BackupStats;
    filters: BackupFilters;
    flash: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    auth: {
        user: any;
    };
    [key: string]: any;
}
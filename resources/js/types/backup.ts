export type BackupType = 'full' | 'database' | 'files';

export interface BackupFile {
    filename: string;
    size: string;
    size_bytes: number;
    modified: string;
    type: BackupType;
    download_url: string;
}

export interface DiskSpaceInfo {
    total: string;
    free: string;
    used: string;
    used_percentage: number;
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

export interface BackupPageProps {
    backups: BackupFile[];
    diskSpace: DiskSpaceInfo;
    lastBackup: string | null;
    auth: {
        user: any;
    };
}
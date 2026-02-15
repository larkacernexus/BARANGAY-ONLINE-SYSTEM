// Add these to your existing types.ts file

export interface Purok {
    id: number;
    name: string;
    slug: string;
    description: string;
    leader_name: string;
    leader_contact: string;
    google_maps_url: string;
    total_households: number;
    total_residents: number;
    status: string;
    created_at: string;
    households_count?: number;
    residents_count?: number;
}

export interface PurokFilters {
    search?: string;
    status?: string;
    sort_by?: 'name' | 'total_households' | 'total_residents' | 'created_at' | 'status';
    sort_order?: 'asc' | 'desc';
}

export interface PurokStats {
    label: string;
    value: number | string;
}

export interface PaginationData {
    data: Purok[];
    total: number;
}

// Update BulkOperation type to include purok operations
export type BulkOperation = 'export' | 'delete' | 'update_status' | 'send_message' | 'print' | 'export_csv' | 'generate_report' | 'copy_data' | 'activate' | 'deactivate' | 'publish' | 'archive' | 'change_type' | 'change_status';
// resources/js/Pages/Admin/Users/types.ts
export interface User {
    last_ip: any;
    is_superadmin: any;
    middle_name: any;
    department: any;
    suffix: any;
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    username: string | null;
    contact_number: string | null;
    position: string | null;
    department_id: number | null;
    role_id: number;
    status: 'active' | 'inactive';
    email_verified_at: string | null;
    require_password_change: boolean;
    password_changed_at: string | null;
    two_factor_secret: string | null;
    two_factor_recovery_codes: string | null;
    two_factor_confirmed_at: string | null;
    created_at: string;
    updated_at: string;
    last_login_at: string | null;
    last_login_ip: string | null;
    role?: {
        id: number;
        name: string;
        description?: string;
        permissions?: Array<{
            id: number;
            name: string;
            display_name: string;
            description?: string;
        }>;
    };
    
    permissions?: Array<{
        id: number;
        name: string;
        display_name: string;
        description?: string;
        module?: string;
    }>;
}

export interface ActivityLog {
    id: number;
    log_name: string;
    description: string;
    subject_type: string;
    subject_id: number;
    causer_type: string;
    causer_id: number;
    properties: any;
    created_at: string;
    causer?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface UserShowProps {
    user: User;
    activityLogs?: ActivityLog[];
    stats?: {
        residents_managed?: number;
        payments_processed?: number;
        clearances_issued?: number;
        users_created?: number;
        login_count?: number;
        session_count?: number;
    };
}
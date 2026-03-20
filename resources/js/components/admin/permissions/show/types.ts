// resources/js/Pages/Admin/Permissions/types.ts
import { Permission } from '@/types';

export interface PermissionShowProps {
    permission: Permission & {
        roles_count?: number;
        users_count?: number;
        created_by?: {
            name: string;
            email: string;
        };
    };
    roles?: Array<{
        id: number;
        name: string;
        display_name: string;
        description: string | null;
        users_count?: number;
        created_at?: string;
    }>;
    users?: Array<{
        id: number;
        name: string;
        email: string;
        position?: string;
        role_name?: string;
        status?: string;
        avatar?: string;
    }>;
    can?: {
        edit: boolean;
        delete: boolean;
    };
}

export interface Statistic {
    label: string;
    value: string | number;
    icon: React.ElementType;
    description: string;
    color: string;
}
import { RolePermission } from "@/admin-utils/rolePermissionsUtils";

// types/rolePermissions.types.ts
export interface RolePermissionProps {
    role_permissions?: {
        data: RolePermission[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            from: number;
            to: number;
        };
    };
    filters?: {
        search?: string;
        role?: string;
        module?: string;
        granter?: string;
        sort?: string;
        order?: 'asc' | 'desc';
    };
    roles?: Array<{ id: number; name: string }>;
    modules?: Array<string>;
    granters?: Array<{ id: number; name: string }>;
}
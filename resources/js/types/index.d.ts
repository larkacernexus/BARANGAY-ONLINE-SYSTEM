// // Add these types to your existing types file

// // ==================== HOUSEHOLD RELATED TYPES ====================

// export interface Household {
//     id: number;
//     household_number: string;
//     head_of_household?: string;
//     member_count: number;
//     status: 'active' | 'inactive';
//     purok_id: number;
//     purok?: Purok;
//     address?: string;
//     created_at?: string;
//     updated_at?: string;
//     members?: Resident[];
// }

// export interface HouseholdStats {
//     total: number;
//     active: number;
//     inactive: number;
//     totalMembers: number;
//     averageMembers: number;
//     purokCount: number;
// }

// export interface HouseholdFilters {
//     search?: string;
//     status?: string;
//     purok_id?: string | number;
//     sort_by?: string;
//     sort_order?: 'asc' | 'desc';
//     [key: string]: any;
// }

// export interface Purok {
//     id: number;
//     name: string;
//     code?: string;
//     description?: string;
//     households_count?: number;
//     created_at?: string;
//     updated_at?: string;
// }

// export type BulkAction = 
//     | 'delete'
//     | 'activate'
//     | 'deactivate'
//     | 'change_status'
//     | 'change_purok'
//     | 'export'
//     | 'print'
//     | 'update_status'
//     | 'update_purok';

// export type SelectionMode = 'page' | 'filtered' | 'all';

// export interface SelectionStats {
//     total: number;
//     active: number;
//     inactive: number;
//     totalMembers: number;
//     averageMembers: number;
//     purokCount: number;
//     households: Household[];
// }

// export interface FlashMessage {
//     success?: string;
//     error?: string;
//     warning?: string;
//     info?: string;
// }

// // ==================== RESIDENT RELATED TYPES ====================

// export interface Resident {
//     id: number;
//     first_name: string;
//     last_name: string;
//     middle_name?: string;
//     suffix?: string;
//     email?: string;
//     phone?: string;
//     birth_date?: string;
//     age?: number;
//     gender?: 'male' | 'female' | 'other';
//     civil_status?: 'single' | 'married' | 'divorced' | 'widowed';
//     occupation?: string;
//     address?: string;
//     status?: string;
//     household_id?: number;
//     household?: Household;
//     purok_id?: number;
//     purok?: Purok;
//     photo_url?: string | null;
//     is_head_of_household?: boolean;
//     created_at?: string;
//     updated_at?: string;
// }

// // ==================== PRIVILEGE RELATED TYPES ====================

// export interface Privilege {
//     id: number;
//     name: string;
//     code: string;
//     description?: string;
//     discount_type_id: number;
//     discount_type?: DiscountType;
//     requires_id_number: boolean;
//     requires_verification: boolean;
//     validity_years?: number;
//     is_active: boolean;
//     created_at?: string;
//     updated_at?: string;
// }

// export interface ResidentPrivilege {
//     id: number;
//     resident_id: number;
//     privilege_id: number;
//     privilege?: Privilege;
//     id_number?: string;
//     verified_at?: string;
//     expires_at?: string;
//     status?: 'active' | 'expiring_soon' | 'expired' | 'pending';
//     created_at?: string;
//     updated_at?: string;
// }

// export interface DiscountType {
//     id: number;
//     name: string;
//     code: string;
//     description?: string;
//     is_percentage: boolean;
//     value: number;
//     max_discount?: number;
//     min_purchase?: number;
//     is_active: boolean;
//     created_at?: string;
//     updated_at?: string;
// }

// // ==================== ANNOUNCEMENT RELATED TYPES ====================

// export interface Announcement {
//     id: number;
//     title: string;
//     content: string;
//     type: string;
//     priority: number;
//     status: 'published' | 'draft' | 'archived';
//     published_at?: string;
//     created_at?: string;
//     updated_at?: string;
// }

// // ==================== FORM RELATED TYPES ====================

// export interface Form {
//     is_active: any;
//     title: string;
//     created_by: any;
//     issuing_agency: string;
//     download_count: number;
//     file_name: string;
//     id: number;
//     name: string;
//     description?: string;
//     category: string;
//     file_path: string;
//     file_size: number;
//     status: 'active' | 'inactive';
//     downloads_count?: number;
//     created_at?: string;
//     updated_at?: string;
// }

// // ==================== OFFICIAL RELATED TYPES ====================

// export interface Official {
//     id: number;
//     name: string;
//     position: string;
//     term_start: string;
//     term_end?: string;
//     status: 'active' | 'inactive';
//     contact?: string;
//     email?: string;
//     photo_url?: string;
//     created_at?: string;
//     updated_at?: string;
// }

// // ==================== API AND UTILITY TYPES ====================

// export interface ApiResponse<T = any> {
//     success: boolean;
//     message?: string;
//     data?: T;
//     errors?: Record<string, string[]>;
// }

// export interface Paginated<T> {
//     data: T[];
//     current_page: number;
//     last_page: number;
//     per_page: number;
//     total: number;
//     from: number;
//     to: number;
// }

// export interface FilterParams {
//     page?: number;
//     per_page?: number;
//     search?: string;
//     sort_by?: string;
//     sort_order?: 'asc' | 'desc';
//     [key: string]: any;
// }

// export interface Stats {
//     total: number;
//     [key: string]: any;
// }

// // ==================== AUTH TYPES ====================

// export interface User {
//     id: number;
//     name: string;
//     email: string;
//     role_id?: number;
//     role?: Role;
//     permissions?: Permission[];
//     created_at?: string;
//     updated_at?: string;
// }

// export interface Role {
//     id: number;
//     name: string;
//     permissions?: Permission[];
// }

// export interface Permission {
//     id: number;
//     name: string;
//     guard_name?: string;
// }

// export interface Auth {
//     user: User;
//     permissions?: string[];
//     roles?: string[];
// }

// // ==================== SHARED DATA TYPE ====================
// // This is the main type that extends Auth and includes flash messages
// export interface SharedData {
//     auth: Auth;
//     flash?: FlashMessage;
//     errors?: Record<string, string>;
//     [key: string]: any;
// }

// // ==================== BREADCRUMB TYPES ====================
// export interface BreadcrumbItem {
//     title: string;
//     href: string;
//     icon?: React.ReactNode;
//     active?: boolean;
// }

// // ==================== FEE TYPES ====================

// export interface Fee {
//     id: number;
//     name: string;
//     amount: number;
//     description?: string;
//     is_required: boolean;
//     frequency?: 'monthly' | 'quarterly' | 'annually' | 'one-time';
//     created_at?: string;
//     updated_at?: string;
// }

// // ==================== GRID LAYOUT TYPES ====================

// export interface GridLayoutProps {
//     isEmpty: boolean;
//     emptyState: React.ReactNode;
//     gridCols?: {
//         base?: number;
//         sm?: number;
//         md?: number;
//         lg?: number;
//         xl?: number;
//         '2xl'?: number;
//     };
//     gap?: {
//         base?: string;
//         sm?: string;
//         md?: string;
//         lg?: string;
//         xl?: string;
//     };
//     padding?: string;
//     children: React.ReactNode;
//     className?: string;
// }

// // ==================== UTILITY FUNCTIONS TYPES ====================

// export type TruncateFunction = (text: string, maxLength: number) => string;
// export type FormatDateFunction = (date: string | null) => string;
// export type FormatDateTimeFunction = (date: string) => string;
// export type FormatFileSizeFunction = (bytes: number) => string;
// export type GetCategoryColorFunction = (category: string) => string;
// export type GetPriorityColorFunction = (priority: number) => string;
// export type GetTypeColorFunction = (type: string) => string;
// export type GetStatusColorFunction = (status: string) => string;

// // ==================== PAGE PROPS ====================

// export interface PageProps {
//     auth?: Auth;
//     flash?: FlashMessage;
//     errors?: Record<string, string>;
//     [key: string]: any;
// }
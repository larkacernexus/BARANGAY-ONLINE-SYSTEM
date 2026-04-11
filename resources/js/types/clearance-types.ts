// // types/clearance-types.ts
// export interface ClearanceType {
//     id: number;
//     name: string;
//     code: string;
//     description: string;
//     fee: number;
//     formatted_fee: string;
//     processing_days: number;
//     validity_days: number;
//     is_active: boolean;
//     requires_payment: boolean;
//     requires_approval: boolean;
//     is_online_only: boolean;
//     clearances_count?: number;
//     created_at: string;
//     updated_at: string;
//     purpose_options?: string;
//     document_types_count?: number;
// }

// export type BulkOperation = 'activate' | 'deactivate' | 'delete' | 'export' | 'duplicate' | 'toggle-payment' | 'toggle-approval' | 'toggle-online' | 'update';

// export type BulkEditField = 'processing_days' | 'validity_days' | 'fee' | 'requires_payment' | 'requires_approval' | 'is_online_only';

// export type SelectionMode = 'page' | 'filtered' | 'all';

// export interface FilterState {
//     search: string;
//     status: string;
//     requires_payment: string;
//     sort: string;
//     direction: string;
// }

// export interface SelectionStats {
//     active: number;
//     inactive: number;
//     paid: number;
//     free: number;
//     needsApproval: number;
//     onlineOnly: number;
//     totalValue: number;
//     avgProcessingDays: number;
// }

// export interface PageProps {
//     clearanceTypes: {
//         data: ClearanceType[];
//         current_page: number;
//         last_page: number;
//         per_page: number;
//         total: number;
//         from: number;
//         to: number;
//         links: Array<{ url: string | null; label: string; active: boolean }>;
//     };
//     filters: FilterState;
//     stats: {
//         total: number;
//         active: number;
//         requires_payment: number;
//         requires_approval: number;
//         online_only: number;
//     };
// }
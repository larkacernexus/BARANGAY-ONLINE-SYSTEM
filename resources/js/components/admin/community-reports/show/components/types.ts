// // resources/js/components/admin/community-reports/show/components/types.ts

// export interface StaffMember {
//     id: number; // user.id
//     user_id: number;
//     resident_id: number | null;
//     name: string;
//     first_name: string;
//     last_name: string;
//     email: string | null;
//     phone: string | null;
//     username: string | null;
//     position: string | null;
//     role: string | null;
//     purok: string | null;
//     address: string | null;
//     is_active: boolean;
//     initials: string;
//     avatar: string | null;
// }

// export interface CommunityReport {
//     id: number;
//     report_number: string;
//     user_id: number | null;
//     user: {
//         id: number;
//         first_name: string | null;
//         last_name: string | null;
//         full_name: string | null;
//         email: string | null;
//         phone: string | null;
//         address: string | null;
//         purok: string | null;
//         has_resident: boolean;
//     } | null;
//     report_type_id: number | null;
//     report_type: {
//         id: number;
//         name: string;
//         category: string;
//         description: string | null;
//     } | null;
//     title: string;
//     description: string;
//     detailed_description: string | null;
//     location: string | null;
//     incident_date: string | null;
//     incident_time: string | null;
//     urgency_level: string;
//     recurring_issue: boolean;
//     affected_people: string;
//     estimated_affected_count: number | null;
//     is_anonymous: boolean;
//     reporter_name: string | null;
//     reporter_contact: string | null;
//     reporter_address: string | null;
//     perpetrator_details: string | null;
//     preferred_resolution: string | null;
//     has_previous_report: boolean;
//     previous_report_id: number | null;
//     previous_report: {
//         id: number;
//         report_number: string;
//         title: string;
//         status: string;
//     } | null;
//     impact_level: string;
//     safety_concern: boolean;
//     environmental_impact: boolean;
//     noise_level: string | null;
//     duration_hours: number | null;
//     status: string;
//     priority: string;
//     assigned_to: number | null;
//     assignedTo: StaffMember | null;
//     resolution_notes: string | null;
//     resolved_at: string | null;
//     acknowledged_at: string | null;
//     created_at: string | null;
//     updated_at: string | null;
//     evidences: Array<{
//         id: number;
//         file_path: string;
//         file_name: string;
//         file_type: string;
//         file_size: number;
//         url: string;
//     }>;
//     status_color: string | null;
//     priority_color: string | null;
//     urgency_color: string | null;
// }

// export interface ActivityLog {
//     id: number;
//     user_id: number | null;
//     user_name: string;
//     action: string;
//     details: string;
//     changes: any;
//     created_at: string | null;
// }

// export interface FlashMessage {
//     success?: string;
//     error?: string;
// }

// export interface StatusBanner {
//     color: string;
//     icon: React.ReactNode;
//     title: string;
//     message: string;
// }

// export interface Tab {
//     id: string;
//     label: string;
//     icon: React.ReactNode;
//     count?: number;
// }

// // Helper function to get display name for staff (from resident data)
// export const getStaffDisplayName = (staff: StaffMember | null): string => {
//     if (!staff) return 'Unknown Staff';
//     if (staff.name) return staff.name;
//     if (staff.first_name && staff.last_name) {
//         return `${staff.first_name} ${staff.last_name}`.trim();
//     }
//     if (staff.first_name) return staff.first_name;
//     if (staff.last_name) return staff.last_name;
//     if (staff.username) return `@${staff.username}`;
//     if (staff.email) return staff.email;
//     if (staff.role) return staff.role;
//     return 'Unknown Staff';
// };

// // Helper to get staff initials (from resident data)
// export const getStaffInitials = (staff: StaffMember | null): string => {
//     if (!staff) return '?';
//     if (staff.initials) return staff.initials;
//     if (staff.first_name && staff.last_name) {
//         return `${staff.first_name.charAt(0)}${staff.last_name.charAt(0)}`.toUpperCase();
//     }
//     if (staff.first_name) {
//         return staff.first_name.substring(0, 2).toUpperCase();
//     }
//     if (staff.last_name) {
//         return staff.last_name.substring(0, 2).toUpperCase();
//     }
//     if (staff.name) {
//         const parts = staff.name.split(' ');
//         if (parts.length >= 2) {
//             return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
//         }
//         return parts[0].substring(0, 2).toUpperCase();
//     }
//     if (staff.username) {
//         return staff.username.substring(0, 2).toUpperCase();
//     }
//     if (staff.role) {
//         return staff.role.substring(0, 2).toUpperCase();
//     }
//     return 'ST';
// };
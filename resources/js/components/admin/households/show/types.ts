// // resources/js/Pages/Admin/Households/Show/types.ts

// export interface Privilege {
//     id: number;
//     name: string;
//     code: string;
//     description?: string;
//     is_active?: boolean;
//     id_number?: string;
//     verified_at?: string;
//     expires_at?: string;
//     remarks?: string;
//     status: 'pending' | 'active' | 'expired' | 'expiring_soon';
//     discount_percentage?: number;
// }

// export interface Resident {
//     id: number;
//     first_name: string;
//     last_name: string;
//     middle_name?: string;
//     suffix?: string;
//     full_name: string;
//     age: number;
//     gender: string;
//     civil_status: string;
//     contact_number?: string;
//     email?: string;
//     occupation?: string;
//     education?: string;
//     religion?: string;
//     is_voter: boolean;
//     place_of_birth?: string;
//     purok: string;
//     purok_id?: number;
//     photo_path?: string;
//     photo_url?: string;
//     has_photo: boolean;
    
//     // Privilege information
//     privileges_list: Privilege[];
//     privileges_count: number;
//     active_privileges_count: number;
    
//     // Household relationship
//     is_head_of_household: boolean;
//     relationship_to_head?: string;
//     has_user_account: boolean;
//     activities_count: number;
// }

// export interface HouseholdMember {
//     created_at: any;
//     updated_at: any;
//     id: number;
//     resident_id: number;
//     relationship_to_head: string;
//     is_head: boolean;
//     resident: Resident;
// }

// export interface HouseholdStatistics {
//     total_seniors?: number;
//     total_minors?: number;
//     total_voters?: number;
//     [key: string]: number | undefined;
// }

// export interface Household {
//     google_maps_url: any;
//     full_address: string;
//     latitude: number | null | undefined;
//     longitude: number | null | undefined;
//     id: number;
//     household_number: string;
//     contact_number: string;
//     email?: string;
//     address: string ;
//     purok: string;
//     purok_id?: number;
//     member_count: number;
//     income_range?: string;
//     housing_type?: string;
//     ownership_status?: string;
//     water_source?: string;
//     electricity: boolean;
//     internet: boolean;
//     vehicle: boolean;
//     remarks?: string;
//     status: 'active' | 'inactive';
//     created_at: string;
//     updated_at: string;
//     household_members: HouseholdMember[];
//     head_resident?: Resident | null;
//     statistics?: HouseholdStatistics;
    
//     // Head resident's privileges
//     head_privileges?: Privilege[];
//     has_discount_eligible_head?: boolean;
// }

// export interface PageProps {
//     household: Household;
//     flash?: {
//         success?: string;
//         error?: string;
//     };
// }
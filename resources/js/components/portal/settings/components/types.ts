import { type BreadcrumbItem, type SharedData } from '@/types';

// ========== DYNAMIC PRIVILEGE TYPES ==========

export interface PrivilegeData {
  id: number;
  privilege_id: number;
  code: string;
  name: string;
  id_number?: string;
  discount_percentage?: number;
  status?: 'active' | 'pending' | 'expired' | 'expiring_soon';
  verified_at?: string;
  expires_at?: string;
  requires_verification?: boolean;
  requires_id_number?: boolean;
  validity_years?: number;
}

export interface ResidentData {
  id: number;
  resident_id?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  full_name?: string;
  birth_date?: string;
  age?: number;
  gender?: string;
  civil_status?: string;
  contact_number?: string;
  email?: string;
  address?: string;
  occupation?: string;
  education?: string;
  religion?: string;
  is_voter: boolean;
  place_of_birth?: string;
  remarks?: string;
  photo_path?: string;
  photo_url?: string;
  has_photo?: boolean;
  status?: string;
  is_head_of_household: boolean;
  
  // DYNAMIC: Privilege data
  privileges?: PrivilegeData[];
  privileges_count?: number;
  active_privileges_count?: number;
  has_privileges?: boolean;
  
  // For backward compatibility during transition
  discount_eligibilities?: any;
  
  purok?: {
    id: number;
    name: string;
    leader_name?: string;
    leader_contact?: string;
    google_maps_url?: string;
  };
  
  household?: HouseholdData;
  

  [key: string]: any;
}

export interface HouseholdMemberData {
  id: number;
  resident_id: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  relationship_to_head: string;
  is_head: boolean;
  age?: number;
  gender?: string;
  civil_status?: string;
  contact_number?: string;
  email?: string;
  occupation?: string;
  education?: string;
  religion?: string;
  is_voter?: boolean;
  
  // DYNAMIC: Privilege data for household members
  privileges?: PrivilegeData[];
  privileges_count?: number;
  has_privileges?: boolean;
  
  // DYNAMIC: Individual privilege flags
  [key: string]: any;
}

export interface HouseholdData {
  id: number;
  household_number?: string;
  address?: string;
  full_address?: string;
  contact_number?: string;
  email?: string;
  member_count?: number;
  income_range?: string;
  housing_type?: string;
  ownership_status?: string;
  water_source?: string;
  electricity: boolean;
  has_electricity: boolean;
  internet: boolean;
  has_internet: boolean;
  vehicle: boolean;
  has_vehicle: boolean;
  remarks?: string;
  purok?: {
    id: number;
    name: string;
  };
  head_of_household?: {
    id: number;
    full_name: string;
    first_name?: string;
    last_name?: string;
  };
  
  // DYNAMIC: Household members with privileges
  members?: HouseholdMemberData[];
  
  // Head resident's privileges (summary)
  head_privileges?: PrivilegeData[];
  has_discount_eligible_head?: boolean;
}

export interface ProfileUserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  contact_number?: string;
  position?: string;
  status: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  qr_login_token?: string;
  qr_code_url?: string;
  qr_login_enabled?: boolean;
  
  // User's resident data with dynamic privileges
  resident?: ResidentData;
  
  department?: {
    id: number;
    name: string;
  };
  
  role?: {
    id: number;
    name: string;
  };
  
  // Convenience fields (may be duplicates)
  is_household_head?: boolean;
  household_members_count?: number;
  unit_number?: string;
  purok?: string;
  
  // DYNAMIC: All privileges for reference
  all_privileges?: PrivilegeData[];
  
  // DYNAMIC: Individual privilege flags for the user
  [key: string]: any;
}

export interface ProfileProps {
  mustVerifyEmail: boolean;
  status?: string;
  
  // DYNAMIC: All privileges passed from backend
  allPrivileges?: PrivilegeData[];
}

// ========== HELPER FUNCTIONS FOR TYPES ==========

/**
 * Check if resident has a specific privilege
 */
export function hasPrivilege(resident: ResidentData | null, privilegeCode: string): boolean {
  if (!resident || !resident.privileges) return false;
  
  return resident.privileges.some((p: PrivilegeData) => 
    p.code?.toUpperCase() === privilegeCode?.toUpperCase() && 
    (p.status === 'active' || p.status === 'expiring_soon')
  );
}

/**
 * Get active privileges from resident
 */
export function getActivePrivileges(resident: ResidentData | null): PrivilegeData[] {
  if (!resident || !resident.privileges) return [];
  
  return resident.privileges.filter((p: PrivilegeData) => 
    p.status === 'active' || p.status === 'expiring_soon'
  );
}

/**
 * Get privilege by code
 */
export function getPrivilegeByCode(resident: ResidentData | null, privilegeCode: string): PrivilegeData | null {
  if (!resident || !resident.privileges) return null;
  
  const found = resident.privileges.find((p: PrivilegeData) => 
    p.code?.toUpperCase() === privilegeCode?.toUpperCase()
  );
  
  return found || null;
}

/**
 * Get privilege icon based on code (for UI)
 */
export function getPrivilegeIcon(code: string): string {
  const firstChar = (code?.[0] || 'A').toUpperCase();
  
  const iconMap: Record<string, string> = {
    'S': '👴',
    'P': '♿',
    'I': '🏠',
    'F': '🌾',
    'O': '✈️',
    '4': '📦',
    'U': '💼',
    'A': '🎫',
    'B': '🎫',
    'C': '🎫',
    'D': '🎫',
    'E': '🎫',
  };
  
  return iconMap[firstChar] || '🎫';
}

/**
 * Get privilege color based on code hash (for UI)
 */
export function getPrivilegeColor(code: string): string {
  const firstChar = (code?.[0] || 'A').toUpperCase().charCodeAt(0);
  const colorIndex = firstChar % 8;
  
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-red-100 text-red-800 border-red-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-amber-100 text-amber-800 border-amber-200',
  ];
  
  return colors[colorIndex] || 'bg-gray-100 text-gray-800 border-gray-200';
}
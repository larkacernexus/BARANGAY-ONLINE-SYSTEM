// resources/js/types/index.ts (add these types)

export interface Blotter {
  id: number;
  blotter_number: string;
  incident_type: string;
  incident_description: string;
  incident_datetime: string;
  formatted_datetime: string;
  location: string;
  barangay: string;
  reporter_name: string;
  reporter_contact: string | null;
  reporter_address: string | null;
  respondent_name: string | null;
  respondent_address: string | null;
  witnesses: string | null;
  evidence: string | null;
  status: 'pending' | 'investigating' | 'resolved' | 'archived';
  status_badge: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priority_badge: string;
  action_taken: string | null;
  investigator: string | null;
  resolved_datetime: string | null;
  attachments: Array<{
    name: string;
    path: string;
    size: number;
    type: string;
  }> | null;
  involved_residents: Array<{
    id: number;
    name: string;
    address: string;
    contact: string;
  }> | null;
  created_at: string;
  updated_at: string;
}

export interface BlotterFilters {
  search?: string;
  status?: string;
  priority?: string;
  date_from?: string;
  date_to?: string;
  barangay?: string;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}
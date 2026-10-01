export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "FOLLOW_UP"
  | "CONVERTED"
  | "NOT_INTERESTED"
  | "NO_RESPONSE"
  | "INVALID"
  | "CLOSED";

export type LeadPriority = "LOW" | "MEDIUM" | "HIGH";

export interface LeadListItem {
  id: string;
  lead_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string | null;
  product: string;
  product_name: string;
  source: string;
  campaign: string | null;
  campaign_name_display: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  assigned_to: string | null;
  assigned_to_name: string | null;
  is_potential_duplicate: boolean;
  created_at: string;
}

export interface LeadStatusHistoryItem {
  id: string;
  old_status: LeadStatus | null;
  new_status: LeadStatus;
  changed_by: { id: string; full_name: string } | null;
  note: string | null;
  created_at: string;
}

export interface LeadNoteItem {
  id: string;
  note: string;
  created_by: { id: string; full_name: string } | null;
  created_at: string;
}

export interface LeadDetail extends Omit<LeadListItem, "campaign_name_display"> {
  email: string | null;
  state: string | null;
  quantity: number | null;
  preferred_contact_method: string;
  message: string | null;
  medium: string | null;
  campaign_name: string | null;
  landing_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  assigned_to_detail: { id: string; full_name: string; email: string } | null;
  consent_given: boolean;
  consent_timestamp: string | null;
  status_history: LeadStatusHistoryItem[];
  notes: LeadNoteItem[];
  updated_at: string;
}

export interface LeadFilters {
  status?: LeadStatus;
  priority?: LeadPriority;
  assigned_to?: string;
  source?: string;
  campaign?: string;
  search?: string;
  created_after?: string;
  created_before?: string;
  page?: number;
}

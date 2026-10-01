export type FollowUpStatus = "PENDING" | "COMPLETED" | "MISSED" | "CANCELLED";

export interface FollowUp {
  id: string;
  lead: string;
  lead_number: string;
  assigned_to: string | null;
  assigned_to_name: string | null;
  scheduled_at: string;
  completed_at: string | null;
  outcome: string | null;
  notes: string | null;
  status: FollowUpStatus;
  created_at: string;
  updated_at: string;
}

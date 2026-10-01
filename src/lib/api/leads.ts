import { apiClient } from "@/lib/api/client";
import type { ApiSuccess, Paginated } from "@/types/common";
import type { LeadDetail, LeadFilters, LeadListItem } from "@/types/lead";

export async function getLeads(filters: LeadFilters): Promise<Paginated<LeadListItem>> {
  const response = await apiClient.get<ApiSuccess<Paginated<LeadListItem>>>("/leads/", { params: filters });
  return response.data.data;
}

export async function getLead(id: string): Promise<LeadDetail> {
  const response = await apiClient.get<ApiSuccess<LeadDetail>>(`/leads/${id}/`);
  return response.data.data;
}

export async function updateLead(id: string, payload: Partial<LeadDetail>): Promise<LeadDetail> {
  const response = await apiClient.patch<ApiSuccess<LeadDetail>>(`/leads/${id}/`, payload);
  return response.data.data;
}

export async function assignLead(id: string, assignedTo: string): Promise<LeadDetail> {
  const response = await apiClient.post<ApiSuccess<LeadDetail>>(`/leads/${id}/assign/`, {
    assigned_to: assignedTo,
  });
  return response.data.data;
}

export async function changeLeadStatus(id: string, status: string, note = ""): Promise<LeadDetail> {
  const response = await apiClient.post<ApiSuccess<LeadDetail>>(`/leads/${id}/status/`, { status, note });
  return response.data.data;
}

export async function addLeadNote(id: string, note: string) {
  const response = await apiClient.post(`/leads/${id}/notes/`, { note });
  return response.data.data;
}

export interface PublicEnquiryPayload {
  first_name: string;
  last_name?: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  quantity?: number;
  preferred_contact_method?: string;
  message?: string;
  product_id: string;
  campaign_id?: string;
  source?: string;
  medium?: string;
  campaign_name?: string;
  landing_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  consent_given: boolean;
  website?: string;
}

export async function submitPublicEnquiry(payload: PublicEnquiryPayload) {
  const response = await apiClient.post("/public/leads/", payload);
  return response.data.data as { lead_number: string; message: string };
}

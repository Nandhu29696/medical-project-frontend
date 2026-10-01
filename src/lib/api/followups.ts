import { apiClient } from "@/lib/api/client";
import type { ApiSuccess, Paginated } from "@/types/common";
import type { FollowUp } from "@/types/followup";

export async function getFollowUps(params: Record<string, string> = {}): Promise<Paginated<FollowUp>> {
  const response = await apiClient.get<ApiSuccess<Paginated<FollowUp>>>("/followups/", { params });
  return response.data.data;
}

export async function completeFollowUp(id: string, outcome: string, notes = ""): Promise<FollowUp> {
  const response = await apiClient.post<ApiSuccess<FollowUp>>(`/followups/${id}/complete/`, { outcome, notes });
  return response.data.data;
}

export async function createFollowUp(payload: {
  lead: string;
  scheduled_at: string;
  assigned_to?: string;
}): Promise<FollowUp> {
  const response = await apiClient.post<ApiSuccess<FollowUp>>("/followups/", payload);
  return response.data.data;
}

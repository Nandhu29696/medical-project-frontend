import { apiClient } from "@/lib/api/client";
import type { ApiSuccess, Paginated } from "@/types/common";
import type { Campaign } from "@/types/campaign";

export async function getCampaigns(): Promise<Paginated<Campaign>> {
  const response = await apiClient.get<ApiSuccess<Paginated<Campaign>>>("/campaigns/");
  return response.data.data;
}

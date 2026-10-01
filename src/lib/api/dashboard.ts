import { apiClient } from "@/lib/api/client";
import type { ApiSuccess } from "@/types/common";

export interface DashboardSummary {
  total_leads: number;
  new_leads: number;
  today_leads: number;
  pending_followups: number;
  interested_leads: number;
  converted_leads: number;
  conversion_rate: number | null;
}

export interface FunnelItem {
  status: string;
  count: number;
}

export interface SourcePerformanceItem {
  source: string;
  total: number;
  converted: number;
}

export interface LeadTrendItem {
  date: string;
  count: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<ApiSuccess<DashboardSummary>>("/dashboard/summary/");
  return response.data.data;
}

export async function getLeadFunnel(): Promise<FunnelItem[]> {
  const response = await apiClient.get<ApiSuccess<FunnelItem[]>>("/dashboard/lead-funnel/");
  return response.data.data;
}

export async function getSourcePerformance(): Promise<SourcePerformanceItem[]> {
  const response = await apiClient.get<ApiSuccess<SourcePerformanceItem[]>>("/dashboard/source-performance/");
  return response.data.data;
}

export async function getLeadTrend(days = 14): Promise<LeadTrendItem[]> {
  const response = await apiClient.get<ApiSuccess<LeadTrendItem[]>>("/dashboard/lead-trend/", {
    params: { days },
  });
  return response.data.data;
}

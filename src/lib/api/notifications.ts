import { apiClient } from "@/lib/api/client";
import type { ApiSuccess, Paginated } from "@/types/common";
import type { AppNotification, AuditLogEntry } from "@/types/notification";

export async function getNotifications(): Promise<Paginated<AppNotification>> {
  const response = await apiClient.get<ApiSuccess<Paginated<AppNotification>>>("/notifications/", {
    params: { page_size: 15 },
  });
  return response.data.data;
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<ApiSuccess<{ count: number }>>("/notifications/unread-count/");
  return response.data.data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.post(`/notifications/${id}/read/`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post("/notifications/read-all/");
}

export async function getAuditLogs(params: Record<string, string> = {}): Promise<Paginated<AuditLogEntry>> {
  const response = await apiClient.get<ApiSuccess<Paginated<AuditLogEntry>>>("/audit-logs/", { params });
  return response.data.data;
}

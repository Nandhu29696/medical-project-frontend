export type NotificationCategory = "LEAD" | "CONSULTATION" | "PRESCRIPTION" | "DOCUMENT" | "ACCOUNT" | "SYSTEM";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string | null;
  actor_name: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

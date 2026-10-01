import { apiClient } from "@/lib/api/client";
import type { ApiSuccess, Paginated } from "@/types/common";

export type MessageChannel = "EMAIL" | "WHATSAPP";
export type DeliveryStatus = "PENDING" | "SENT" | "FAILED" | "SKIPPED";

export interface MessagingStatus {
  email: { mode: string; live: boolean; host: string | null; from_address: string; file_path: string | null };
  whatsapp: {
    provider: string;
    live: boolean;
    configured: boolean;
    phone_number_id: string | null;
    test_recipients: number;
  };
  delivery: string;
  reminder_hours_before: number;
  skip_domains: string[];
  frontend_url: string;
}

export interface MessageTemplate {
  id: string;
  event: string;
  event_label: string;
  channel: MessageChannel;
  subject: string;
  body: string;
  is_active: boolean;
  whatsapp_template_name: string;
  whatsapp_params: string[];
  updated_by_name: string | null;
  updated_at: string;
}

export interface DeliveryLog {
  id: string;
  recipient: string | null;
  recipient_name: string | null;
  channel: MessageChannel | "SMS";
  event: string;
  event_label: string;
  to_address: string;
  subject: string;
  body: string;
  status: DeliveryStatus;
  provider: string;
  provider_message_id: string;
  error: string;
  sent_at: string | null;
  created_at: string;
}

export interface ContactPreferences {
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  whatsapp_number: string;
  whatsapp_opt_in_at: string | null;
  reminders_enabled: boolean;
  effective_whatsapp_number: string;
  updated_at: string;
}

export async function getMessagingStatus(): Promise<MessagingStatus> {
  return (await apiClient.get<ApiSuccess<MessagingStatus>>("/messaging/status/")).data.data;
}

export async function getMessageTemplates(): Promise<MessageTemplate[]> {
  return (await apiClient.get<ApiSuccess<MessageTemplate[]>>("/messaging/templates/")).data.data;
}

export async function updateMessageTemplate(
  id: string,
  payload: Partial<Pick<MessageTemplate, "subject" | "body" | "is_active" | "whatsapp_template_name" | "whatsapp_params">>
): Promise<MessageTemplate> {
  return (await apiClient.patch<ApiSuccess<MessageTemplate>>(`/messaging/templates/${id}/`, payload)).data.data;
}

export async function resetMessageTemplate(id: string): Promise<MessageTemplate> {
  return (await apiClient.post<ApiSuccess<MessageTemplate>>(`/messaging/templates/${id}/reset/`)).data.data;
}

export async function getDeliveryLogs(params: Record<string, string> = {}): Promise<Paginated<DeliveryLog>> {
  return (await apiClient.get<ApiSuccess<Paginated<DeliveryLog>>>("/messaging/logs/", { params })).data.data;
}

export async function sendTestMessage(channel: MessageChannel, to: string): Promise<DeliveryLog> {
  return (await apiClient.post<ApiSuccess<DeliveryLog>>("/messaging/test/", { channel, to })).data.data;
}

export async function runReminders(): Promise<number> {
  return (await apiClient.post<ApiSuccess<{ sent: number }>>("/messaging/reminders/run/")).data.data.sent;
}

export async function getContactPreferences(): Promise<ContactPreferences> {
  return (await apiClient.get<ApiSuccess<ContactPreferences>>("/me/contact-preferences/")).data.data;
}

export async function updateContactPreferences(payload: Partial<ContactPreferences>): Promise<ContactPreferences> {
  return (await apiClient.patch<ApiSuccess<ContactPreferences>>("/me/contact-preferences/", payload)).data.data;
}

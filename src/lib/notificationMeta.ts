import { Bell, CalendarCheck, FileText, Info, Pill, UserRound, Users } from "lucide-react";

import type { NotificationCategory } from "@/types/notification";

/** Icon, label and tint per notification category (shared by the bell and the page). */
export const CATEGORY_META: Record<NotificationCategory, { icon: typeof Bell; label: string; tint: string }> = {
  CONSULTATION: { icon: CalendarCheck, label: "Appointments", tint: "bg-blue-50 text-blue-600" },
  PRESCRIPTION: { icon: Pill, label: "Prescriptions", tint: "bg-accent-50 text-accent-700" },
  DOCUMENT: { icon: FileText, label: "Reports", tint: "bg-amber-50 text-amber-600" },
  LEAD: { icon: Users, label: "Leads", tint: "bg-brand-50 text-brand-700" },
  ACCOUNT: { icon: UserRound, label: "Account", tint: "bg-slate-100 text-slate-600" },
  SYSTEM: { icon: Info, label: "System", tint: "bg-slate-100 text-slate-600" },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_META) as NotificationCategory[];

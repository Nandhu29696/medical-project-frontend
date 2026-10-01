import clsx from "clsx";

import type { LeadStatus } from "@/types/lead";

const STYLES: Record<LeadStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-amber-100 text-amber-700",
  INTERESTED: "bg-purple-100 text-purple-700",
  FOLLOW_UP: "bg-orange-100 text-orange-700",
  CONVERTED: "bg-green-100 text-green-700",
  NOT_INTERESTED: "bg-slate-200 text-slate-600",
  NO_RESPONSE: "bg-slate-100 text-slate-500",
  INVALID: "bg-red-100 text-red-700",
  CLOSED: "bg-slate-300 text-slate-700",
};

export default function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={clsx("rounded-full px-2 py-0.5 text-xs font-medium", STYLES[status])}>
      {status.replace("_", " ")}
    </span>
  );
}

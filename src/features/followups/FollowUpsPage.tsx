import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { AlarmClock, CalendarClock, CheckCircle2, PhoneCall } from "lucide-react";

import { useToast } from "@/components/Toast";
import { Avatar, EmptyState, PageHeader, SkeletonRows, StatCard, Tabs } from "@/components/ui";
import { CalendarIllustration } from "@/components/illustrations";
import { completeFollowUp, getFollowUps } from "@/lib/api/followups";
import { formatDateTime, timeAgo } from "@/lib/format";
import type { FollowUp } from "@/types/followup";

type View = "PENDING" | "COMPLETED" | "ALL";

const STATUS_STYLE: Record<FollowUp["status"], string> = {
  PENDING: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  MISSED: "bg-red-50 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export default function FollowUpsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("PENDING");
  const { data, isLoading } = useQuery({ queryKey: ["followups"], queryFn: () => getFollowUps({ page_size: "100" }) });

  const completeMutation = useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: string }) => completeFollowUp(id, outcome),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["followups"] });
      toast("Follow-up marked as completed.");
    },
  });

  const all = data?.results ?? [];
  const now = Date.now();
  const pending = all.filter((f) => f.status === "PENDING");
  const overdue = pending.filter((f) => new Date(f.scheduled_at).getTime() < now);
  const rows = (view === "ALL" ? all : all.filter((f) => f.status === view)).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));

  return (
    <div className="space-y-5">
      <PageHeader title="Follow-ups" subtitle="Calls and check-ins with leads" icon={CalendarClock} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending" icon={PhoneCall} tone="amber" value={isLoading ? undefined : pending.length} />
        <StatCard label="Overdue" icon={AlarmClock} tone="rose" value={isLoading ? undefined : overdue.length} />
        <StatCard label="Completed" icon={CheckCircle2} tone="brand" value={isLoading ? undefined : all.filter((f) => f.status === "COMPLETED").length} />
        <StatCard label="Total" icon={CalendarClock} tone="slate" value={isLoading ? undefined : all.length} />
      </div>
      <Tabs<View>
        tabs={[
          { id: "PENDING", label: "Pending", count: pending.length },
          { id: "COMPLETED", label: "Completed" },
          { id: "ALL", label: "All" },
        ]}
        active={view}
        onChange={setView}
      />
      {!isLoading && rows.length === 0 ? (
        <div className="card"><EmptyState title="Nothing here" message="No follow-ups in this view." illustration={<CalendarIllustration />} /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Assigned to</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Notes</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <SkeletonRows cols={6} />}
              {rows.map((f) => {
                const isOverdue = f.status === "PENDING" && new Date(f.scheduled_at).getTime() < now;
                return (
                  <tr key={f.id}>
                    <td>
                      <Link to={`/leads/${f.lead}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline">{f.lead_number}</Link>
                    </td>
                    <td>
                      {f.assigned_to_name ? (
                        <span className="flex items-center gap-2"><Avatar name={f.assigned_to_name} size={26} /> {f.assigned_to_name}</span>
                      ) : "—"}
                    </td>
                    <td className="whitespace-nowrap">
                      <span className={clsx("block font-medium", isOverdue ? "text-red-600" : "text-slate-700")}>{formatDateTime(f.scheduled_at)}</span>
                      <span className="text-xs text-slate-400">{timeAgo(f.scheduled_at)}</span>
                    </td>
                    <td><span className={clsx("badge", isOverdue ? STATUS_STYLE.MISSED : STATUS_STYLE[f.status])}>{isOverdue ? "OVERDUE" : f.status}</span></td>
                    <td className="max-w-xs truncate text-xs text-slate-500">{f.outcome || f.notes || "—"}</td>
                    <td className="text-right">
                      {f.status === "PENDING" && (
                        <button className="btn-outline btn-sm" onClick={() => completeMutation.mutate({ id: f.id, outcome: "Completed via CRM" })}>
                          <CheckCircle2 size={13} /> Complete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

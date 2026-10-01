import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import {
  ArrowLeft,
  Check,
  Globe,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquareText,
  Phone,
  RefreshCw,
  Send,
  UserCheck,
} from "lucide-react";

import { useToast } from "@/components/Toast";
import { Avatar, Badge, Skeleton } from "@/components/ui";
import { Field } from "@/features/clinical/components";
import LeadStatusBadge from "@/features/leads/components/LeadStatusBadge";
import { useAuth } from "@/features/auth/AuthContext";
import { addLeadNote, assignLead, changeLeadStatus, getLead } from "@/lib/api/leads";
import { getAssignableUsers } from "@/lib/api/users";
import { formatDateTime, timeAgo } from "@/lib/format";
import { MANAGER_ROLES, hasAnyRole } from "@/lib/roles";
import type { LeadStatus } from "@/types/lead";

const PIPELINE: LeadStatus[] = ["NEW", "CONTACTED", "INTERESTED", "FOLLOW_UP", "CONVERTED"];
const OTHER_STATUSES: LeadStatus[] = ["NOT_INTERESTED", "NO_RESPONSE", "INVALID", "CLOSED"];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState("");
  const canAssign = hasAnyRole(user, MANAGER_ROLES);

  const { data: lead, isLoading } = useQuery({ queryKey: ["lead", id], queryFn: () => getLead(id!), enabled: Boolean(id) });
  const assignable = useQuery({ queryKey: ["assignable-users"], queryFn: getAssignableUsers, enabled: canAssign });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["lead", id] });
  const statusMutation = useMutation({
    mutationFn: (status: string) => changeLeadStatus(id!, status),
    onSuccess: () => {
      void refresh();
      toast("Status updated.");
    },
  });
  const noteMutation = useMutation({
    mutationFn: (note: string) => addLeadNote(id!, note),
    onSuccess: () => {
      setNoteText("");
      void refresh();
      toast("Note added.");
    },
  });
  const assignMutation = useMutation({
    mutationFn: (userId: string) => assignLead(id!, userId),
    onSuccess: () => {
      void refresh();
      toast("Lead assigned — the assignee has been notified.");
    },
    onError: () => toast("Could not assign the lead.", "error"),
  });

  if (isLoading || !lead) return <Skeleton className="h-96 rounded-3xl" />;

  const fullName = `${lead.first_name} ${lead.last_name}`.trim();
  const stageIndex = PIPELINE.indexOf(lead.status);
  const activity = [
    ...lead.status_history.map((h) => ({
      id: `s-${h.id}`,
      at: h.created_at,
      who: h.changed_by?.full_name ?? "System",
      kind: "status" as const,
      text: h.note ?? "",
      from: h.old_status,
      to: h.new_status,
    })),
    ...lead.notes.map((n) => ({
      id: `n-${n.id}`,
      at: n.created_at,
      who: n.created_by?.full_name ?? "System",
      kind: "note" as const,
      text: n.note,
      from: null,
      to: null,
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  const whatsappNumber = lead.phone.replace(/\D/g, "");

  return (
    <div className="space-y-5">
      <Link to="/leads" className="btn-ghost btn-sm"><ArrowLeft size={14} /> All leads</Link>

      {/* Header */}
      <div className="card flex flex-wrap items-center gap-4 p-5">
        <Avatar name={fullName} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">{fullName}</h1>
            <LeadStatusBadge status={lead.status} />
            {lead.is_potential_duplicate && <Badge tone="rose">Possible duplicate</Badge>}
          </div>
          <p className="mt-1 font-mono text-xs text-slate-400">{lead.lead_number} · created {timeAgo(lead.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${lead.phone}`} className="btn-primary"><Phone size={16} /> Call</a>
          <a href={`https://wa.me/${whatsappNumber.length === 10 ? `91${whatsappNumber}` : whatsappNumber}`} target="_blank" rel="noreferrer" className="btn-outline">
            <MessageCircle size={16} /> WhatsApp
          </a>
          {lead.email && <a href={`mailto:${lead.email}`} className="btn-outline"><Mail size={16} /> Email</a>}
        </div>
      </div>

      {/* Pipeline */}
      <div className="card-pad">
        <p className="section-title mb-4">Pipeline stage</p>
        <ol className="flex items-center">
          {PIPELINE.map((stage, i) => {
            const done = stageIndex >= 0 && i <= stageIndex;
            return (
              <li key={stage} className="flex flex-1 items-center last:flex-none">
                <button
                  onClick={() => statusMutation.mutate(stage)}
                  className="group flex flex-col items-center gap-1"
                  title={`Move to ${stage.replace("_", " ")}`}
                >
                  <span
                    className={clsx(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition",
                      done ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-400 group-hover:border-brand-400"
                    )}
                  >
                    {done ? <Check size={16} /> : i + 1}
                  </span>
                  <span className={clsx("hidden text-[11px] font-semibold sm:block", done ? "text-brand-700" : "text-slate-400")}>
                    {stage.replace("_", " ")}
                  </span>
                </button>
                {i < PIPELINE.length - 1 && (
                  <span className={clsx("mx-1 h-1 flex-1 rounded", stageIndex > i ? "bg-brand-500" : "bg-slate-200")} />
                )}
              </li>
            );
          })}
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-400">Close out:</span>
          {OTHER_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => statusMutation.mutate(status)}
              className={clsx("btn-sm btn", lead.status === status ? "bg-slate-700 text-white" : "btn-outline")}
            >
              {status.replace("_", " ").toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5">
          <div className="card-pad space-y-3">
            <p className="section-title">Customer</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" value={lead.phone} />
              <Field label="Email" value={lead.email} />
              <Field label="City" value={lead.city} />
              <Field label="State" value={lead.state} />
              <Field label="Preferred contact" value={lead.preferred_contact_method} />
              <Field label="Quantity" value={lead.quantity} />
            </div>
            {lead.message && (
              <blockquote className="rounded-xl bg-slate-50 p-3 text-sm italic text-slate-600">“{lead.message}”</blockquote>
            )}
          </div>

          <div className="card-pad space-y-3">
            <p className="section-title flex items-center gap-2"><Megaphone size={15} className="text-accent-600" /> Attribution</p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="accent">{lead.source || "Unknown source"}</Badge>
              {lead.medium && <Badge tone="blue">{lead.medium}</Badge>}
              {lead.campaign_name && <Badge tone="brand">{lead.campaign_name}</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="UTM source" value={lead.utm_source} />
              <Field label="UTM campaign" value={lead.utm_campaign} />
            </div>
            {lead.landing_page && (
              <p className="flex items-center gap-1 truncate text-xs text-slate-400"><Globe size={12} /> {lead.landing_page}</p>
            )}
          </div>

          <div className="card-pad space-y-3">
            <p className="section-title flex items-center gap-2"><UserCheck size={15} className="text-brand-600" /> Assignment</p>
            <div className="flex items-center gap-3">
              {lead.assigned_to_detail ? (
                <>
                  <Avatar name={lead.assigned_to_detail.full_name} size={36} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{lead.assigned_to_detail.full_name}</p>
                    <p className="text-xs text-slate-400">{lead.assigned_to_detail.email}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">Unassigned</p>
              )}
            </div>
            {canAssign && (
              <select
                className="input"
                value=""
                onChange={(e) => e.target.value && assignMutation.mutate(e.target.value)}
              >
                <option value="">{lead.assigned_to_detail ? "Reassign to…" : "Assign to…"}</option>
                {assignable.data?.map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="card-pad xl:col-span-2">
          <p className="section-title mb-4">Activity</p>
          <form
            className="mb-5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (noteText.trim()) noteMutation.mutate(noteText);
            }}
          >
            <input className="input" placeholder="Add a note about this lead…" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            <button type="submit" className="btn-primary" disabled={noteMutation.isPending}><Send size={15} /> Add</button>
          </form>
          <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6">
            {activity.map((item) => (
              <li key={item.id} className="relative">
                <span
                  className={clsx(
                    "absolute -left-[2.2rem] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white",
                    item.kind === "status" ? "bg-accent-100 text-accent-700" : "bg-brand-100 text-brand-700"
                  )}
                >
                  {item.kind === "status" ? <RefreshCw size={13} /> : <MessageSquareText size={13} />}
                </span>
                <div className="rounded-xl bg-slate-50 p-3">
                  {item.kind === "status" ? (
                    <p className="flex flex-wrap items-center gap-1.5 text-sm text-slate-700">
                      Status {item.from ? <LeadStatusBadge status={item.from} /> : "set"} → {item.to && <LeadStatusBadge status={item.to} />}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-700">{item.text}</p>
                  )}
                  {item.kind === "status" && item.text && <p className="mt-1 text-xs text-slate-500">{item.text}</p>}
                  <p className="mt-1 text-[11px] text-slate-400">
                    {item.who} · <span title={formatDateTime(item.at)}>{timeAgo(item.at)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

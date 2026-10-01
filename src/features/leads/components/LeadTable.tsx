import { Link } from "react-router-dom";
import clsx from "clsx";
import { ChevronRight, Phone } from "lucide-react";

import { Avatar, EmptyState, SkeletonRows } from "@/components/ui";
import LeadStatusBadge from "@/features/leads/components/LeadStatusBadge";
import { formatDate } from "@/lib/format";
import type { LeadListItem, LeadPriority } from "@/types/lead";

const PRIORITY_DOT: Record<LeadPriority, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-amber-400",
  LOW: "bg-slate-300",
};

interface Props {
  leads: LeadListItem[];
  isLoading: boolean;
}

export default function LeadTable({ leads, isLoading }: Props) {
  if (!isLoading && leads.length === 0) {
    return (
      <div className="card">
        <EmptyState title="No leads found" message="Try clearing the filters." />
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Lead #</th>
            <th>Contact</th>
            <th>Source</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assigned to</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {isLoading && <SkeletonRows cols={9} />}
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <Link to={`/leads/${lead.id}`} className="flex items-center gap-3">
                  <Avatar name={`${lead.first_name} ${lead.last_name}`} size={34} />
                  <span>
                    <span className="block font-semibold text-slate-800">{lead.first_name} {lead.last_name}</span>
                    <span className="block text-xs text-slate-400">{lead.city ?? "—"}</span>
                  </span>
                </Link>
              </td>
              <td className="whitespace-nowrap font-mono text-xs text-slate-600">
                {lead.lead_number}
                {lead.is_potential_duplicate && <span className="badge ml-1 bg-red-100 text-red-700">DUP</span>}
              </td>
              <td>
                <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-700">
                  <Phone size={12} /> {lead.phone}
                </a>
              </td>
              <td><span className="badge bg-slate-100 text-slate-600">{lead.source || "—"}</span></td>
              <td><LeadStatusBadge status={lead.status} /></td>
              <td>
                <span className="inline-flex items-center gap-1.5 text-xs capitalize text-slate-600">
                  <span className={clsx("h-2 w-2 rounded-full", PRIORITY_DOT[lead.priority])} />
                  {lead.priority.toLowerCase()}
                </span>
              </td>
              <td className="text-slate-600">{lead.assigned_to_name ?? <span className="text-slate-400">Unassigned</span>}</td>
              <td className="whitespace-nowrap text-xs text-slate-500">{formatDate(lead.created_at)}</td>
              <td className="text-right">
                <Link to={`/leads/${lead.id}`} className="btn-outline btn-sm">View <ChevronRight size={13} /></Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

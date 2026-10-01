import { Search, X } from "lucide-react";

import type { LeadFilters } from "@/types/lead";

const STATUS_OPTIONS = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "CONVERTED",
  "NOT_INTERESTED",
  "NO_RESPONSE",
  "INVALID",
  "CLOSED",
];

interface Props {
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
}

export default function LeadFiltersBar({ filters, onChange }: Props) {
  const active = Boolean(filters.search || filters.status || filters.priority || filters.created_after || filters.created_before);
  return (
    <div className="card flex flex-wrap items-end gap-3 p-4">
      <label className="relative min-w-[220px] flex-1">
        <span className="label">Search</span>
        <Search size={15} className="absolute bottom-2.5 left-3 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Name, phone, lead #"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
        />
      </label>
      <label>
        <span className="label">Status</span>
        <select
          className="input"
          value={filters.status ?? ""}
          onChange={(e) => onChange({ ...filters, status: (e.target.value || undefined) as LeadFilters["status"], page: 1 })}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="label">Priority</span>
        <select
          className="input"
          value={filters.priority ?? ""}
          onChange={(e) => onChange({ ...filters, priority: (e.target.value || undefined) as LeadFilters["priority"], page: 1 })}
        >
          <option value="">Any</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </label>
      <label>
        <span className="label">From</span>
        <input
          type="date"
          className="input"
          value={filters.created_after?.slice(0, 10) ?? ""}
          onChange={(e) => onChange({ ...filters, created_after: e.target.value || undefined, page: 1 })}
        />
      </label>
      <label>
        <span className="label">To</span>
        <input
          type="date"
          className="input"
          value={filters.created_before?.slice(0, 10) ?? ""}
          onChange={(e) => onChange({ ...filters, created_before: e.target.value || undefined, page: 1 })}
        />
      </label>
      {active && (
        <button className="btn-ghost" onClick={() => onChange({ page: 1 })}>
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
}

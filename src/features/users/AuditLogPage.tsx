import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Search } from "lucide-react";

import { Avatar, Badge, PageHeader, Pagination, SkeletonRows, type Tone } from "@/components/ui";
import { getAuditLogs } from "@/lib/api/notifications";
import { formatDateTime, timeAgo } from "@/lib/format";

const PAGE_SIZE = 25;

function toneFor(action: string): Tone {
  if (action.includes("CREATED") || action.includes("REGISTERED") || action.includes("BOOKED")) return "brand";
  if (action.includes("UPDATED") || action.includes("CHANGED")) return "blue";
  if (action.includes("LOGIN")) return "accent";
  if (action.includes("DELETE")) return "rose";
  return "slate";
}

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", search, page],
    queryFn: () => getAuditLogs({ ...(search ? { search } : {}), page: String(page), page_size: String(PAGE_SIZE) }),
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Audit log" subtitle="Who did what, and when" icon={History} />
      <label className="relative block max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search action, entity or email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </label>
      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>Action</th>
              <th>Entity</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonRows cols={5} />}
            {data?.results.map((entry) => (
              <tr key={entry.id}>
                <td className="whitespace-nowrap" title={formatDateTime(entry.created_at)}>
                  <span className="block font-medium text-slate-700">{timeAgo(entry.created_at)}</span>
                  <span className="text-xs text-slate-400">{formatDateTime(entry.created_at)}</span>
                </td>
                <td>
                  {entry.actor_name ? (
                    <span className="flex items-center gap-2">
                      <Avatar name={entry.actor_name} size={28} />
                      <span>
                        <span className="block text-sm font-semibold text-slate-700">{entry.actor_name}</span>
                        <span className="block text-xs text-slate-400">{entry.actor_email}</span>
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-400">Public / system</span>
                  )}
                </td>
                <td><Badge tone={toneFor(entry.action)}>{entry.action.replace(/_/g, " ")}</Badge></td>
                <td>
                  <span className="text-slate-700">{entry.entity_type}</span>
                  {entry.entity_id && <span className="block font-mono text-[11px] text-slate-400">{entry.entity_id.slice(0, 8)}</span>}
                </td>
                <td className="font-mono text-xs text-slate-400">{entry.ip_address ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={PAGE_SIZE} count={data?.count ?? 0} onChange={setPage} />
    </div>
  );
}

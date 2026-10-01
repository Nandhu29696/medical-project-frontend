import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Download, Target, TrendingUp, Trophy } from "lucide-react";

import { useToast } from "@/components/Toast";
import { EmptyState, PageHeader, StatCard } from "@/components/ui";
import { apiClient } from "@/lib/api/client";
import { getDashboardSummary, getSourcePerformance } from "@/lib/api/dashboard";
import { formatDate } from "@/lib/format";
import type { ApiSuccess } from "@/types/common";

interface ConversionRow {
  lead_number: string;
  status: string;
  created_at: string;
}

const AXIS = { fontSize: 11, fill: "#94a3b8" };

export default function ReportsPage() {
  const toast = useToast();
  const [exporting, setExporting] = useState(false);
  const summary = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary });
  const sources = useQuery({ queryKey: ["dashboard-sources"], queryFn: getSourcePerformance });
  const conversions = useQuery({
    queryKey: ["reports-conversions"],
    queryFn: async () => (await apiClient.get<ApiSuccess<ConversionRow[]>>("/reports/conversions/")).data.data,
  });

  // A plain <a href> would not send the JWT, so fetch the CSV with auth and save it as a blob.
  async function exportCsv() {
    setExporting(true);
    try {
      const response = await apiClient.get<Blob>("/reports/export/", { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast("Export downloaded.");
    } catch {
      toast("Export failed.", "error");
    } finally {
      setExporting(false);
    }
  }

  const bySource = (sources.data ?? []).map((s) => ({ ...s, rate: s.total ? Math.round((s.converted / s.total) * 100) : 0 }));
  const best = [...bySource].sort((a, b) => b.rate - a.rate)[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        subtitle="Conversion and source performance"
        icon={BarChart3}
        actions={
          <button className="btn-primary" onClick={() => void exportCsv()} disabled={exporting}>
            <Download size={16} /> {exporting ? "Exporting…" : "Export CSV"}
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Converted leads" icon={Target} tone="brand" value={summary.data?.converted_leads} />
        <StatCard label="Conversion rate" icon={TrendingUp} tone="accent" value={summary.data ? `${summary.data.conversion_rate ?? 0}%` : undefined} />
        <StatCard label="Best source" icon={Trophy} tone="amber" value={best?.source ?? "—"} hint={best ? `${best.rate}% converted` : undefined} />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="card-pad xl:col-span-2">
          <p className="section-title">Leads by source</p>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bySource}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="source" tick={AXIS} />
                <YAxis allowDecimals={false} tick={AXIS} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" name="Total" fill="rgb(var(--accent-500))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="converted" name="Converted" fill="rgb(var(--brand-500))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-pad">
          <p className="section-title mb-3">Converted leads</p>
          {conversions.data?.length === 0 && <EmptyState title="No conversions yet" />}
          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {conversions.data?.map((row) => (
              <li key={row.lead_number} className="flex items-center justify-between py-2.5 text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Target size={14} /></span>
                  <span className="font-mono text-xs font-semibold text-slate-700">{row.lead_number}</span>
                </span>
                <span className="text-xs text-slate-400">{formatDate(row.created_at)}</span>
              </li>
            ))}
          </ul>
          <Link to="/leads" className="btn-outline btn-sm mt-3 w-full">Open leads</Link>
        </div>
      </div>
    </div>
  );
}

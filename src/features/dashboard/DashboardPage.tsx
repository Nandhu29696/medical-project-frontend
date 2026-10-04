import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  Contact,
  LayoutDashboard,
  PhoneCall,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

import { Avatar, Badge, PageHeader, StatCard } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import LeadStatusBadge from "@/features/leads/components/LeadStatusBadge";
import { getClinicalSummary } from "@/lib/api/clinical";
import { getDashboardSummary, getLeadFunnel, getLeadTrend, getSourcePerformance } from "@/lib/api/dashboard";
import { getLeads } from "@/lib/api/leads";
import { getAuditLogs } from "@/lib/api/notifications";
import { greeting, timeAgo } from "@/lib/format";
import { ADMIN_ROLES, hasAnyRole } from "@/lib/roles";

const AXIS = { fontSize: 11, fill: "#94a3b8" };
const PIE_COLORS = ["rgb(var(--brand-500))", "rgb(var(--accent-500))", "#3b82f6", "#f59e0b", "#ef4444", "#14b8a6", "#a855f7", "#64748b", "#0ea5e9"];

function ChartCard({ title, subtitle, children, className }: { title: string; subtitle?: string; children: ReactElement; className?: string }) {
  return (
    <div className={`card-pad ${className ?? ""}`}>
      <p className="section-title">{title}</p>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={250}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = hasAnyRole(user, ADMIN_ROLES);
  const summary = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary });
  const funnel = useQuery({ queryKey: ["dashboard-funnel"], queryFn: getLeadFunnel });
  const trend = useQuery({ queryKey: ["dashboard-trend"], queryFn: () => getLeadTrend(14) });
  const sources = useQuery({ queryKey: ["dashboard-sources"], queryFn: getSourcePerformance });
  const recentLeads = useQuery({ queryKey: ["leads", "recent"], queryFn: () => getLeads({ page: 1 }) });
  const clinical = useQuery({ queryKey: ["clinical-summary"], queryFn: getClinicalSummary, enabled: isAdmin });
  const activity = useQuery({ queryKey: ["audit-logs", "recent"], queryFn: () => getAuditLogs({ page_size: "8" }), enabled: isAdmin });

  const s = summary.data;
  const trendData = (trend.data ?? []).map((d) => ({ ...d, label: new Date(d.date).toLocaleDateString(undefined, { day: "numeric", month: "short" }) }));
  const funnelData = (funnel.data ?? []).filter((f) => f.count > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${user?.first_name || user?.full_name}`}
        subtitle="Here's what's happening with leads and care today."
        icon={LayoutDashboard}
        actions={<Link to="/leads" className="btn-primary"><Users size={16} /> View leads</Link>}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total leads" icon={Users} tone="brand" value={s?.total_leads} />
        <StatCard label="New leads" icon={Sparkles} tone="blue" value={s?.new_leads} />
        <StatCard label="Today" icon={UserPlus} tone="accent" value={s?.today_leads} hint="new today" />
        <StatCard label="Follow-ups due" icon={PhoneCall} tone="amber" value={s?.pending_followups} />
        <StatCard label="Interested" icon={Star} tone="rose" value={s?.interested_leads} />
        <StatCard
          label="Converted"
          icon={Target}
          tone="brand"
          value={s?.converted_leads}
          hint={s?.conversion_rate !== null && s?.conversion_rate !== undefined ? `${s.conversion_rate}% rate` : undefined}
        />
      </div>

      {isAdmin && (
        <div className="card-pad bg-gradient-to-r from-brand-50 to-accent-50">
          <p className="section-title mb-3 flex items-center gap-2"><Activity size={16} className="text-brand-600" /> Clinical overview</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Patients" icon={Contact} tone="accent" value={clinical.data?.patients} />
            <StatCard label="Consultations today" icon={CalendarCheck} tone="brand" value={clinical.data?.today_consultations} />
            <StatCard label="Upcoming" icon={CalendarClock} tone="blue" value={clinical.data?.upcoming_consultations} />
            <StatCard label="Completed" icon={TrendingUp} tone="slate" value={clinical.data?.completed_consultations} />
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard title="Lead trend" subtitle="New leads over the last 14 days" className="xl:col-span-2">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--brand-500))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="rgb(var(--brand-500))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={AXIS} />
            <YAxis allowDecimals={false} tick={AXIS} />
            <Tooltip />
            <Area type="monotone" dataKey="count" name="Leads" stroke="rgb(var(--brand-500))" strokeWidth={2.5} fill="url(#trend)" />
          </AreaChart>
        </ChartCard>
        <ChartCard title="Status mix" subtitle="Where leads are in the funnel">
          <PieChart>
            <Pie data={funnelData} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {funnelData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard title="Source performance" subtitle="Total vs converted by source" className="xl:col-span-2">
          <BarChart data={sources.data ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="source" tick={AXIS} />
            <YAxis allowDecimals={false} tick={AXIS} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="total" name="Total" fill="rgb(var(--accent-500))" radius={[6, 6, 0, 0]} />
            <Bar dataKey="converted" name="Converted" fill="rgb(var(--brand-500))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>

        <div className="card-pad">
          <div className="mb-3 flex items-center justify-between">
            <p className="section-title">Recent leads</p>
            <Link to="/leads" className="text-xs font-semibold text-brand-600 hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentLeads.data?.results.slice(0, 6).map((lead) => (
              <li key={lead.id}>
                <Link to={`/leads/${lead.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                  <Avatar name={`${lead.first_name} ${lead.last_name}`} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{lead.first_name} {lead.last_name}</p>
                    <p className="text-xs text-slate-400">{lead.lead_number} · {lead.city ?? "—"}</p>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isAdmin && (
        <div className="card-pad">
          <div className="mb-3 flex items-center justify-between">
            <p className="section-title">Recent activity</p>
            <Link to="/audit-logs" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
              Audit log <ChevronRight size={12} />
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
            {activity.data?.results.map((entry) => (
              <li key={entry.id} className="flex min-w-0 items-center gap-3 border-b border-slate-100 py-2.5">
                <Avatar name={entry.actor_name ?? "System"} size={30} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-700">
                    <b>{entry.actor_name ?? "Public"}</b> · {entry.action.replace(/_/g, " ").toLowerCase()}
                  </p>
                  <p className="text-xs text-slate-400">{timeAgo(entry.created_at)}</p>
                </div>
                <span className="shrink-0"><Badge tone="slate">{entry.entity_type}</Badge></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

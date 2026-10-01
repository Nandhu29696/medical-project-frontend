import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, ClipboardList, List } from "lucide-react";

import { Pagination, Tabs } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import ConsultationTable from "@/features/clinical/ConsultationTable";
import { getConsultations } from "@/lib/api/clinical";
import { formatTime, localDateKey } from "@/lib/format";
import { ADMIN_ROLES, CLINICAL_STAFF_ROLES, hasAnyRole } from "@/lib/roles";
import { PageHeader } from "@/components/ui";
import type { ConsultationDetail } from "@/types/clinical";

const STATUSES = ["", "SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];
const PAGE_SIZE = 20;

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return d;
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "border-l-blue-500 bg-blue-50",
  COMPLETED: "border-l-emerald-500 bg-emerald-50",
  CANCELLED: "border-l-slate-400 bg-slate-100",
  NO_SHOW: "border-l-amber-500 bg-amber-50",
};

function WeekCalendar({ showDoctor }: { showDoctor: boolean }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const { data, isLoading } = useQuery({
    queryKey: ["consultations", "week", weekStart.toISOString()],
    queryFn: () =>
      getConsultations({
        scheduled_after: weekStart.toISOString(),
        scheduled_before: weekEnd.toISOString(),
        ordering: "scheduled_at",
        page_size: "100",
      }),
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const byDay = useMemo(() => {
    const map: Record<string, ConsultationDetail[]> = {};
    for (const c of data?.results ?? []) {
      (map[localDateKey(new Date(c.scheduled_at))] ??= []).push(c);
    }
    return map;
  }, [data]);
  const todayKey = localDateKey(new Date());

  const shift = (weeks: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + weeks * 7);
    setWeekStart(d);
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="font-semibold text-slate-800">
          {weekStart.toLocaleDateString(undefined, { day: "numeric", month: "short" })} –{" "}
          {days[6].toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
        </p>
        <div className="flex gap-1">
          <button className="btn-ghost btn-sm" onClick={() => shift(-1)} aria-label="Previous week"><ChevronLeft size={16} /></button>
          <button className="btn-outline btn-sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>Today</button>
          <button className="btn-ghost btn-sm" onClick={() => shift(1)} aria-label="Next week"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-7 md:divide-x md:divide-y-0">
        {days.map((day) => {
          const key = localDateKey(day);
          const items = byDay[key] ?? [];
          return (
            <div key={key} className={clsx("min-h-40 p-2", key === todayKey && "bg-brand-50/40")}>
              <p className={clsx("mb-2 text-center text-xs font-semibold", key === todayKey ? "text-brand-700" : "text-slate-500")}>
                {day.toLocaleDateString(undefined, { weekday: "short" })}
                <span className={clsx("ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full", key === todayKey && "bg-brand-600 text-white")}>
                  {day.getDate()}
                </span>
              </p>
              <div className="space-y-1.5">
                {isLoading && <div className="h-10 animate-pulse rounded-lg bg-slate-100" />}
                {items.map((c) => (
                  <Link
                    key={c.id}
                    to={`/consultations/${c.id}`}
                    className={clsx("block rounded-lg border-l-4 px-2 py-1.5 text-xs transition hover:shadow", STATUS_COLORS[c.status])}
                  >
                    <p className="font-bold text-slate-800">{formatTime(c.scheduled_at)}</p>
                    <p className="truncate text-slate-600">{c.patient.full_name}</p>
                    {showDoctor && <p className="truncate text-[10px] text-slate-400">Dr. {c.doctor.full_name}</p>}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ConsultationsPage() {
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["consultations", status, page],
    queryFn: () => getConsultations({ ...(status ? { status } : {}), page: String(page), page_size: String(PAGE_SIZE) }),
  });
  const isDoctorOnly = hasAnyRole(user, ["DOCTOR"]) && !hasAnyRole(user, ADMIN_ROLES);
  const isStaff = hasAnyRole(user, CLINICAL_STAFF_ROLES);
  const isPatient = hasAnyRole(user, ["PATIENT"]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Consultations"
        subtitle={isPatient && !isStaff ? "Your visits with our doctors" : "Scheduled and past visits"}
        icon={ClipboardList}
        actions={
          isPatient ? (
            <Link to="/book" className="btn-primary"><CalendarPlus size={16} /> Book consultation</Link>
          ) : undefined
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[
            { id: "list", label: "List", icon: List },
            { id: "calendar", label: "Week", icon: CalendarDays },
          ]}
          active={view}
          onChange={setView}
        />
        {view === "list" && (
          <div className="flex flex-wrap gap-1">
            {STATUSES.map((s) => (
              <button
                key={s || "all"}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className={status === s ? "btn-primary btn-sm" : "btn-outline btn-sm"}
              >
                {s ? s.replace("_", " ").toLowerCase() : "All"}
              </button>
            ))}
          </div>
        )}
      </div>
      {view === "calendar" ? (
        <WeekCalendar showDoctor={!isDoctorOnly} />
      ) : (
        <>
          <ConsultationTable
            consultations={data?.results}
            isLoading={isLoading}
            canManage={isStaff}
            showDoctor={!isDoctorOnly}
            showPatient={isStaff}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} count={data?.count ?? 0} onChange={setPage} />
        </>
      )}
    </div>
  );
}
